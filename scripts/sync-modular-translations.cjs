const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const {
  exportedObjects,
  findProperty,
  leadingWhitespaceAt,
  parseSource,
  propertyName,
  unwrapExpression,
  updateModuleSource,
} = require('./i18n/locale-ast.cjs');

/**
 * Modular Translation Sync Script
 * This script synchronizes specific translation fields across all modular locale files.
 * It's used to quickly propagate new UI strings or marketing copy changes.
 *
 * Structure of FIELDS_TO_SYNC:
 * module: name of the file in src/locales/{lang}/{module}.ts
 * path: the key path within the export object
 * translations: object with language codes as keys (en, de, fr, es, it, pt, nl, pl, ru, zh, ja, bg, tr, sv, uk)
 * IMPORTANT: "Clear-Before-Add" Policy — and clear *after* too.
 * ⚠️ A leftover entry is not inert: this script writes its `translations` map
 * verbatim, so a stale row whose non-English values are still the English
 * placeholder **overwrites a since-translated locale back to English** the next
 * time anyone runs the sync for an unrelated key. That happened on 2026-08-09
 * with `landing.closing.kofi`, which silently reverted the German string. Leave
 * this array empty once a run has landed.
 */
const FIELDS_TO_SYNC = [];

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const LANGUAGES = require('./languages.cjs');

/**
 * Path traversal runs through the TypeScript AST (`scripts/i18n/locale-ast.cjs`),
 * not through regexes over the source text. Regexes cannot see a quoted key:
 * `/\b4:\s*\{/` never matches `'4': {` because the closing quote sits between
 * the digit and the colon, so the old implementation concluded the parent was
 * missing and injected a duplicate unquoted `4: {},` into all 15 locales. The
 * same blindness hit hyphenated keys, and its leaf replacement was a global
 * regex that also rewrote same-named keys in nested children.
 */

/**
 * Locale modules export one object named after the file, except `themes.ts`,
 * which also exports `theme_translations`. Accept an explicit first path
 * segment naming the export, then the module name, then a sole export.
 */
function resolveExportName(exportNames, moduleName, pathParts) {
  if (pathParts.length > 1 && exportNames.includes(pathParts[0])) return pathParts.shift();
  if (exportNames.includes(moduleName)) return moduleName;
  if (exportNames.length === 1) return exportNames[0];
  throw new Error(
    `cannot tell which export to write: ${exportNames.join(', ')} — prefix the path with one`,
  );
}

/**
 * Index of the first path segment that does not exist yet, or `parts.length`
 * when the whole path resolves. That index is the object which will receive a
 * newly created key, and therefore the block worth re-sorting.
 */
function firstMissingIndex(sourceFile, root, parts) {
  let current = root;
  for (let index = 0; index < parts.length; index += 1) {
    const property = findProperty(current, parts[index], sourceFile);
    if (!property) return index;
    if (index === parts.length - 1) return parts.length;
    const initializer = unwrapExpression(property.initializer);
    if (!ts.isObjectLiteralExpression(initializer)) return parts.length;
    current = initializer;
  }
  return parts.length;
}

function objectAtPath(sourceFile, root, parts) {
  let current = root;
  for (const part of parts) {
    const property = findProperty(current, part, sourceFile);
    if (!property) return null;
    const initializer = unwrapExpression(property.initializer);
    if (!ts.isObjectLiteralExpression(initializer)) return null;
    current = initializer;
  }
  return current;
}

/** A property's own text, including any comment lines attached above it. */
function propertyText(source, sourceFile, property) {
  const comments = ts.getLeadingCommentRanges(source, property.getFullStart()) || [];
  const start = comments.length ? comments[0].pos : property.getStart(sourceFile);
  return source.slice(start, property.end);
}

/**
 * Sorts one object literal's own keys and leaves every nested block byte-identical
 * — the "indentation-aware sorting" the script has always documented, expressed
 * as a level in the tree rather than as a leading-whitespace count.
 */
function sortObjectKeys(source, sourceFile, object) {
  const properties = object.properties;
  if (properties.length < 2) return source;
  // Spreads and shorthand carry order-dependent meaning; do not reorder them.
  if (!properties.every((property) => ts.isPropertyAssignment(property))) return source;

  const entries = properties.map((property) => ({
    key: propertyName(property.name, sourceFile),
    text: propertyText(source, sourceFile, property),
  }));
  const sorted = [...entries].sort((a, b) =>
    a.key.localeCompare(b.key, undefined, { numeric: true, sensitivity: 'base' }),
  );
  if (sorted.every((entry, index) => entry === entries[index])) return source;

  const bodyStart = object.getStart(sourceFile) + 1;
  const bodyEnd = object.end - 1;
  const indent = leadingWhitespaceAt(source, properties[0].getStart(sourceFile));
  const closingIndent = leadingWhitespaceAt(source, bodyEnd);
  const body = `\n${sorted.map((entry) => `${indent}${entry.text}`).join(',\n')},\n${closingIndent}`;

  return `${source.slice(0, bodyStart)}${body}${source.slice(bodyEnd)}`;
}

function sortBlockAtPath(filePath, source, exportName, parts) {
  const sourceFile = parseSource(filePath, source);
  const root = exportedObjects(sourceFile).get(exportName);
  if (!root) return source;
  const object = objectAtPath(sourceFile, root, parts);
  return object ? sortObjectKeys(source, sourceFile, object) : source;
}

/**
 * Writes one field into one locale module's source text.
 * `pathParts` is the dot path already split; `value` is the raw string — quoting
 * and escaping happen in `locale-ast.cjs`, so callers must not pre-escape.
 */
function applyFieldToSource(filePath, source, moduleName, pathParts, value) {
  const parts = [...pathParts];
  const sourceFile = parseSource(filePath, source);
  const exportNames = [...exportedObjects(sourceFile).keys()];
  const exportName = resolveExportName(exportNames, moduleName, parts);
  const root = exportedObjects(sourceFile).get(exportName);
  if (!root) throw new Error(`${filePath}: export const ${exportName} object was not found`);
  if (!parts.length) throw new Error(`${filePath}: empty path for ${exportName}`);

  const missingAt = firstMissingIndex(sourceFile, root, parts);
  let content = updateModuleSource(filePath, source, exportName, parts.join('.'), value);

  // Only an insertion can put a key out of order; a value replacement cannot,
  // so re-sorting then would only churn unrelated lines.
  if (missingAt < parts.length) {
    content = sortBlockAtPath(filePath, content, exportName, parts.slice(0, missingAt));
  }

  return { content, modified: content !== source };
}

async function syncTranslations() {
  console.log(
    `🚀 Starting sync for ${FIELDS_TO_SYNC.length} fields across ${LANGUAGES.length} locales...\n`,
  );

  // Validation: Ensure all languages are provided for every field
  let hasErrors = false;
  for (const field of FIELDS_TO_SYNC) {
    for (const lang of LANGUAGES) {
      if (!field.translations[lang]) {
        console.error(
          `❌ Missing translation for language '${lang}' in field '${field.module}.${field.path}'`,
        );
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    console.error('\n🛑 Sync aborted due to missing translations.');
    process.exit(1);
  }

  let modifiedCount = 0;

  for (const lang of LANGUAGES) {
    for (const field of FIELDS_TO_SYNC) {
      const filePath = path.join(LOCALES_DIR, lang, `${field.module}.ts`);
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, 'utf8');
      const newValue = field.translations[lang] || field.translations['en'];
      const pathParts = field.path.split('.');

      try {
        const result = applyFieldToSource(filePath, content, field.module, pathParts, newValue);
        if (result.modified) {
          fs.writeFileSync(filePath, result.content, 'utf8');
          modifiedCount++;
        }
      } catch (err) {
        console.error(`❌ Error updating ${filePath}:`, err.message);
        hasErrors = true;
      }
    }
  }

  console.log(`\n📝 ${modifiedCount} files updated.`);

  const { execSync } = require('child_process');
  const touchedModules = [...new Set(FIELDS_TO_SYNC.map((field) => field.module))];
  if (touchedModules.length) {
    const prettierTargets = touchedModules
      .map((module) => `"${path.join(LOCALES_DIR, '*', `${module}.ts`)}"`)
      .join(' ');
    const localPrettier = path.join(__dirname, '../node_modules/.bin/prettier');
    const prettierBin = fs.existsSync(localPrettier) ? `"${localPrettier}"` : 'npx prettier';

    console.log('\n✨ Formatting with Prettier...');
    try {
      execSync(`${prettierBin} --write ${prettierTargets}`, { stdio: 'inherit' });
      console.log('✅ Prettier complete!');
    } catch (err) {
      console.error('⚠️ Prettier failed:', err.message);
    }
  }

  if (hasErrors) process.exit(1);
}

if (require.main === module) {
  syncTranslations().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { applyFieldToSource, resolveExportName, sortBlockAtPath };
