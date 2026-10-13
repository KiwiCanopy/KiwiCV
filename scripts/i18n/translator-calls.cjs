const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const { ROOT_DIR } = require('./config.cjs');

const TRANSLATORS = new Set(['t', 'tObject', 'tCV', 'tCVObject']);

function walkSource(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return fullPath.includes(`${path.sep}locales`) ? [] : walkSource(fullPath);
    }
    return /\.tsx?$/.test(entry.name) ? [fullPath] : [];
  });
}

function dynamicPrefix(argument, sourceFile) {
  if (ts.isTemplateExpression(argument)) return argument.head.text;
  if (ts.isBinaryExpression(argument) && argument.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    let current = argument;
    while (ts.isBinaryExpression(current)) current = current.left;
    if (ts.isStringLiteral(current)) return current.text;
  }
  return null;
}

/**
 * Every `t()`/`tObject()`/`tCV()`/`tCVObject()` call under `directory`, with the
 * pieces both consumers need. One walk, so "what counts as a translator call"
 * cannot drift between the checker and anything that audits its inputs.
 *
 * ⚠️ That single walk is the property that matters, and it is why `checkUsage`
 * and `dynamicPrefixCallSites` must keep calling *this* rather than growing
 * private traversals: narrowing `TRANSLATORS` or the file-extension filter is a
 * test failure today only because the two read the same source of calls.
 * `check-i18n` alone stays green through both narrowings.
 */
function forEachTranslatorCall(directory, visitor) {
  for (const filePath of walkSource(directory)) {
    const source = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      filePath,
      source,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const relativeFile = path.relative(ROOT_DIR, filePath);

    function visit(node) {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        TRANSLATORS.has(node.expression.text) &&
        node.arguments.length
      ) {
        const argument = node.arguments[0];
        visitor({
          callee: node.expression.text,
          argument,
          sourceFile,
          relativeFile,
          line: sourceFile.getLineAndCharacterOfPosition(argument.getStart()).line + 1,
        });
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }
}

/**
 * The template heads that actually occur, mapped to where. This is the other
 * half of what a `DYNAMIC_PREFIXES` entry means: `checkUsage` asks "is this head
 * registered", and this asks "does any call site produce this head at all".
 *
 * Two independent reviewer passes found the same hole — the first
 * version of `tests/i18n/dynamic-prefixes.test.cjs` only checked that a prefix
 * named a live *locale namespace*, which is a correlate. Six registrations
 * passed it while blessing nothing, and `'landing.'` — a blanket widening over
 * **67** keys — passed it too.
 *
 * ⚠️ It is a *textual* scan, not a reachability one: `walkSource` visits every
 * `.ts`/`.tsx` under `src/` whether or not anything imports it. So a
 * registration can be kept alive by an orphan module — the exact artifact a
 * past cleanup deleted. Had `src/constants/landing.ts` contained one template `t()` call, its
 * prefixes would have scored as live and the ten deletions would have been
 * unmeasurable. Dead-file detection is a different tool; this is the limit of
 * this one.
 */
function dynamicPrefixCallSites(srcDir = path.join(ROOT_DIR, 'src')) {
  const sites = new Map();

  forEachTranslatorCall(srcDir, ({ argument, sourceFile, relativeFile, line }) => {
    if (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) return;
    const prefix = dynamicPrefix(argument, sourceFile);
    if (!prefix) return;
    if (!sites.has(prefix)) sites.set(prefix, []);
    sites.get(prefix).push(`${relativeFile}:${line}`);
  });

  return sites;
}

module.exports = { dynamicPrefix, dynamicPrefixCallSites, forEachTranslatorCall, walkSource };
