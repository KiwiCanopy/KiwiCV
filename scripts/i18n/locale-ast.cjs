const ts = require('typescript');

function parseSource(filePath, source) {
  return ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function unwrapExpression(expression) {
  let current = expression;
  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current) ||
    ts.isTypeAssertionExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function propertyName(name, sourceFile) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return name.getText(sourceFile);
}

function exportedObjects(sourceFile) {
  const exports = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const isExported = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!isExported) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      const initializer = unwrapExpression(declaration.initializer);
      if (ts.isObjectLiteralExpression(initializer))
        exports.set(declaration.name.text, initializer);
    }
  }
  return exports;
}

function expressionKind(expression) {
  const value = unwrapExpression(expression);
  if (ts.isObjectLiteralExpression(value)) return 'object';
  if (ts.isArrayLiteralExpression(value)) return 'array';
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) return 'string';
  if (ts.isNumericLiteral(value)) return 'number';
  if (value.kind === ts.SyntaxKind.TrueKeyword || value.kind === ts.SyntaxKind.FalseKeyword) {
    return 'boolean';
  }
  if (ts.isIdentifier(value)) return 'reference';
  return 'expression';
}

function flattenExpression(expression, path, sourceFile, result) {
  const value = unwrapExpression(expression);
  const kind = expressionKind(value);
  result.set(path, {
    kind,
    value:
      kind === 'string'
        ? value.text
        : kind === 'reference' || kind === 'expression'
          ? value.getText(sourceFile)
          : undefined,
  });

  if (ts.isObjectLiteralExpression(value)) {
    for (const property of value.properties) {
      if (ts.isSpreadAssignment(property)) {
        result.set(`${path}....${property.expression.getText(sourceFile)}`, { kind: 'spread' });
      } else if (ts.isShorthandPropertyAssignment(property)) {
        result.set(`${path}.${property.name.text}`, {
          kind: 'reference',
          value: property.name.text,
        });
      } else if (ts.isPropertyAssignment(property)) {
        flattenExpression(
          property.initializer,
          `${path}.${propertyName(property.name, sourceFile)}`,
          sourceFile,
          result,
        );
      }
    }
  } else if (ts.isArrayLiteralExpression(value)) {
    value.elements.forEach((element, index) => {
      flattenExpression(element, `${path}[${index}]`, sourceFile, result);
    });
  }
}

function flattenExports(filePath, source) {
  const sourceFile = parseSource(filePath, source);
  const result = new Map();
  for (const [name, expression] of exportedObjects(sourceFile)) {
    flattenExpression(expression, name, sourceFile, result);
  }
  return result;
}

function findProperty(object, name, sourceFile) {
  return object.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) && propertyName(property.name, sourceFile) === name,
  );
}

function quoteString(value) {
  return `'${value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')}'`;
}

function leadingWhitespaceAt(source, position) {
  const lineStart = source.lastIndexOf('\n', position - 1) + 1;
  return source.slice(lineStart, position).match(/^\s*/)?.[0] || '';
}

function safePropertyName(name) {
  return /^[A-Za-z_$][\w$]*$/.test(name) ? name : quoteString(name);
}

function renderNestedProperty(parts, value, indent) {
  const [head, ...tail] = parts;
  if (!tail.length) return `${safePropertyName(head)}: ${quoteString(value)}`;
  const childIndent = `${indent}  `;
  return `${safePropertyName(head)}: {\n${childIndent}${renderNestedProperty(
    tail,
    value,
    childIndent,
  )},\n${indent}}`;
}

function updateModuleSource(filePath, source, moduleName, path, value) {
  const sourceFile = parseSource(filePath, source);
  const root = exportedObjects(sourceFile).get(moduleName);
  if (!root) throw new Error(`${filePath}: export const ${moduleName} object was not found`);

  const parts = path.split('.');
  let current = root;
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    const property = findProperty(current, part, sourceFile);
    if (!property) {
      const closingBrace = current.end - 1;
      const closingIndent = leadingWhitespaceAt(source, closingBrace);
      const childIndent = `${closingIndent}  `;
      const previousText = source.slice(current.getStart(sourceFile) + 1, closingBrace).trimEnd();
      const separator = previousText ? (previousText.endsWith(',') ? '' : ',') : '';
      const insertion = `${separator}\n${childIndent}${renderNestedProperty(
        parts.slice(index),
        value,
        childIndent,
      )},\n${closingIndent}`;
      return `${source.slice(0, closingBrace)}${insertion}${source.slice(closingBrace)}`;
    }

    if (index === parts.length - 1) {
      // Replacing an object or array initializer with a quoted string would
      // silently destroy a whole subtree, so refuse rather than write it.
      if (expressionKind(property.initializer) !== 'string') {
        throw new Error(
          `${filePath}: ${moduleName}.${path} is not a string value and cannot be overwritten`,
        );
      }
      return `${source.slice(0, property.initializer.getStart(sourceFile))}${quoteString(value)}${source.slice(
        property.initializer.end,
      )}`;
    }

    const initializer = unwrapExpression(property.initializer);
    if (!ts.isObjectLiteralExpression(initializer)) {
      throw new Error(
        `${filePath}: ${moduleName}.${parts.slice(0, index + 1).join('.')} is not an object`,
      );
    }
    current = initializer;
  }

  return source;
}

/**
 * `source` without the property at `path` of `export const <exportName>`, or
 * `null` when there is none. Cuts the property, its trailing comma and the
 * comment lines directly above it — never reaching back past the previous
 * property — so the rest of the file, a second export and a `satisfies` clause
 * included, is untouched. Throws rather than return a file that lost
 * anything else or no longer parses.
 */
function removeModuleProperty(filePath, source, exportName, path) {
  const sourceFile = parseSource(filePath, source);
  let current = exportedObjects(sourceFile).get(exportName);
  if (!current) return null;

  const parts = path.split('.');
  let property;
  for (let index = 0; index < parts.length; index += 1) {
    property = findProperty(current, parts[index], sourceFile);
    if (!property) return null;
    if (index === parts.length - 1) break;
    const initializer = unwrapExpression(property.initializer);
    if (!ts.isObjectLiteralExpression(initializer)) return null;
    current = initializer;
  }

  // The cut may not start before the previous property (and its comma) ends.
  const siblings = current.properties;
  const position = siblings.indexOf(property);
  let floor = position > 0 ? siblings[position - 1].end : current.getStart(sourceFile) + 1;
  if (source[floor] === ',') floor += 1;

  const lineStart = (at) => source.lastIndexOf('\n', at - 1) + 1;
  const lineOf = (at) => sourceFile.getLineAndCharacterOfPosition(at).line;
  let start = property.getStart(sourceFile);
  // Comments on their own lines above the property belong to it.
  for (const comment of ts.getLeadingCommentRanges(source, property.getFullStart()) ?? []) {
    if (comment.pos >= floor && lineOf(comment.pos) > lineOf(floor)) {
      start = Math.min(start, comment.pos);
    }
  }
  // Mid-line (a sibling ends on this line): cut from just after it.
  start = lineStart(start) >= floor ? lineStart(start) : floor;

  let end = property.end;
  if (source[end] === ',') end += 1;
  const lineEnd = source.indexOf('\n', end);
  if (lineEnd !== -1 && source.slice(end, lineEnd).trim() === '' && lineStart(start) === start) {
    end = lineEnd + 1;
  }
  const next = `${source.slice(0, start)}${source.slice(end)}`;

  const removed = `${exportName}.${path}`;
  const expected = [...flattenExports(filePath, source)].filter(
    ([key]) => key !== removed && !key.startsWith(`${removed}.`),
  );
  const nextSource = parseSource(filePath, next);
  const actual = [...flattenExports(filePath, next)];
  if (nextSource.parseDiagnostics?.length || JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${filePath}: removing ${removed} would change more than that key`);
  }
  return next;
}

/**
 * A catalog row's key in `flattenExports` and its packet id: `<export>.<path>`.
 * The export is the module's own unless the row names another.
 */
function catalogId(entry) {
  return `${entry.exportName ?? entry.module}.${entry.path}`;
}

module.exports = {
  catalogId,
  exportedObjects,
  findProperty,
  flattenExports,
  leadingWhitespaceAt,
  parseSource,
  propertyName,
  removeModuleProperty,
  unwrapExpression,
  updateModuleSource,
};
