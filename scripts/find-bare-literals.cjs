#!/usr/bin/env node
/**
 * Finds user-visible English strings that never pass through `t()`.
 *
 * This class is invisible to the two checks that look like they would catch it.
 * `check-i18n.cjs` only validates keys that are actually looked up, so a string
 * with no lookup is nothing to it. And the sweep that removed 192 dead
 * `t('key') || 'literal'` fallbacks keyed on a `t()` call being present, so a
 * literal written straight into JSX was never a candidate.
 *
 * Run directly to list findings:
 *
 *   node scripts/find-bare-literals.cjs
 *
 * `tests/lint/bare-literals.test.mjs` fails the suite on any finding not frozen
 * in `bare-literal-baseline.js`.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
// Plain `require`, not `require(path.join(ROOT, 'node_modules/typescript'))`:
// the hardcoded form assumes dependencies sit directly under this checkout, so
// it failed in a git worktree, where `node_modules` resolves further up the
// tree. `scripts/i18n/locale-ast.cjs` already loads TypeScript this way.
const ts = require('typescript');

// `src/test/` is the test-support directory (vitest setup, compile harness,
// fixtures). It belongs here for the same reason `__tests__` does: nothing
// under it renders to a user, so its English is not translation work. A resume
// fixture in particular is nothing but prose — baselining it would add twenty
// exemptions that each need a written justification and say nothing.
//
// Anchored to that one path rather than matching any segment named `test`, so
// a future `src/features/x/test/` cannot exempt itself from the scan by name.
const SKIP_DIR = /(^|\/)(locales|__tests__|__mocks__|node_modules|dist)(\/|$)|^src\/test(\/|$)/;
const SKIP_FILE = /\.(test|spec|d)\.tsx?$/;

/** JSX attributes whose value reaches the user as prose. */
const VISIBLE_ATTRS = new Set([
  'title',
  'label',
  'placeholder',
  'alt',
  'aria-label',
  'aria-description',
  'aria-roledescription',
  'aria-placeholder',
  'aria-valuetext',
  'description',
  'message',
  'heading',
  'subtitle',
  'text',
  'tooltip',
  'hint',
  'infoHint',
  'helperText',
  'emptyText',
  'errorMessage',
  'disabledReason',
  'confirmLabel',
  'cancelLabel',
  'actionLabel',
  'submitLabel',
  'closeLabel',
  'buttonLabel',
  'srLabel',
  'announce',
  'processingNote',
  'summary',
  'caption',
  'legend',
  'badge',
  'note',
  'prompt',
]);

/** Object-literal property names that read as prose when built in `.ts` logic. */
const VISIBLE_PROPS = new Set([
  'title',
  'label',
  'description',
  'message',
  'placeholder',
  'hint',
  'error',
  'subtitle',
  'heading',
  'text',
  'name',
  'summary',
  'reason',
  'note',
  'desc',
  'body',
  'answer',
  'question',
  'caption',
  'tooltip',
  'cta',
  'action',
  'empty',
  'emptyText',
  'helper',
]);

/**
 * Any user-facing announcer, however it is named. The first version of this
 * scan matched `toast(...)` only and missed `addToast(...)` in `Settings.tsx`,
 * which is what this repository actually uses — two live English strings the
 * audit reported as clean.
 */
const ANNOUNCER =
  /(^|\.)((add|show|push|open|emit|trigger)?[Tt]oast|notify|announce|alert|confirm)(\.\w+)?$/;

/** Reject strings that are code, not copy. */
function looksTechnical(value) {
  const text = value.trim();
  if (!text) return true;
  if (!/[A-Za-z]/.test(text)) return true;
  if (text.length < 2) return true;
  if (/^https?:\/\//.test(text)) return true;
  if (/^[./#]/.test(text)) return true; // paths, anchors, selectors
  if (/^[a-z0-9]+([-_.][a-z0-9]+)+$/.test(text)) return true; // kebab/snake/dotted id
  if (/^[a-z]+([A-Z][a-z0-9]*)+$/.test(text)) return true; // camelCase id
  if (/^[A-Z0-9_]+$/.test(text)) return true; // CONSTANT
  // A Tailwind-ish class list: dashed tokens, no ordinary prose between them.
  if (
    /^[\w:./[\]()%-]+(\s+[\w:./[\]()%-]+)*$/.test(text) &&
    /-/.test(text) &&
    !/\s[a-z]{3,}\s/.test(text)
  ) {
    return true;
  }
  if (/^[a-z]+$/.test(text) && text.length <= 3) return true;
  return false;
}

/** Does it read like English prose or a UI label? */
function looksLikeCopy(value) {
  const text = value.trim();
  if (looksTechnical(text)) return false;
  if (text.split(/\s+/).length >= 2) return true;
  // A single word only counts when capitalised like a label.
  return /^[A-Z][a-z]{2,}$/.test(text);
}

function sourceFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (SKIP_DIR.test(path.relative(ROOT, full))) continue;
    if (entry.isDirectory()) sourceFiles(full, files);
    else if (/\.tsx?$/.test(entry.name) && !SKIP_FILE.test(entry.name)) files.push(full);
  }
  return files;
}

function literalText(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
}

/** Only these can yield an operand; `x === 'a'` compares a string, it never renders it. */
const FALLBACK_OPERATORS = new Set([
  ts.SyntaxKind.BarBarToken,
  ts.SyntaxKind.QuestionQuestionToken,
  ts.SyntaxKind.AmpersandAmpersandToken,
]);

/**
 * Every string literal an expression can evaluate to: the literal itself, both
 * arms of a ternary, both sides of `||`/`??`/`&&`, through parentheses. A walk
 * that stops one level down cannot see `alt={name || 'User Avatar'}`.
 *
 * @returns {[import('typescript').Node, string][]}
 */
function collectLiterals(node, found = []) {
  if (!node) return found;
  const value = literalText(node);
  if (value !== null) {
    found.push([node, value]);
  } else if (ts.isConditionalExpression(node)) {
    collectLiterals(node.whenTrue, found);
    collectLiterals(node.whenFalse, found);
  } else if (ts.isBinaryExpression(node) && FALLBACK_OPERATORS.has(node.operatorToken.kind)) {
    collectLiterals(node.left, found);
    collectLiterals(node.right, found);
  } else if (ts.isParenthesizedExpression(node)) {
    collectLiterals(node.expression, found);
  }
  return found;
}

/**
 * Scans one source text. `file` is the repo-relative path reported in each
 * finding and decides TSX vs TS parsing.
 *
 * @returns {{file: string, line: number, kind: string, value: string}[]}
 */
function scanSource(file, source) {
  const findings = [];
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    // Script kind must follow the extension: parsing a `.ts` file as TSX
    // reads its generic parameters as JSX elements.
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const record = (node, kind, value) => {
    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    findings.push({ file, line: line + 1, kind, value: value.trim().replace(/\s+/g, ' ') });
  };
  const recordAll = (expression, kind) => {
    for (const [child, value] of collectLiterals(expression)) {
      if (looksLikeCopy(value)) record(child, kind, value);
    }
  };

  (function visit(node) {
    // 1. JSX text nodes.
    if (ts.isJsxText(node)) {
      const text = node.text.replace(/\s+/g, ' ').trim();
      if (text && looksLikeCopy(text)) record(node, 'jsx-text', text);
    }

    // 2. JSX attributes carrying prose: "x", {'x'}, {cond ? 'a' : 'b'}, {name || 'x'}.
    if (ts.isJsxAttribute(node) && node.initializer) {
      const name = node.name.getText(sourceFile);
      if (VISIBLE_ATTRS.has(name)) {
        const expression = ts.isJsxExpression(node.initializer)
          ? node.initializer.expression
          : node.initializer;
        recordAll(expression, `attr:${name}`);
      }
    }

    // 3. String literals rendered as JSX children: {'x'}, {cond ? 'a' : 'b'}.
    if (ts.isJsxExpression(node) && node.parent && !ts.isJsxAttribute(node.parent)) {
      recordAll(node.expression, 'jsx-child-literal');
    }

    // 4. Object-literal properties carrying prose.
    if (ts.isPropertyAssignment(node) && node.name) {
      const name = ts.isIdentifier(node.name)
        ? node.name.text
        : ts.isStringLiteral(node.name)
          ? node.name.text
          : null;
      if (name && VISIBLE_PROPS.has(name)) recordAll(node.initializer, `prop:${name}`);
    }

    // 5. Strings handed to a user-facing announcer.
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(sourceFile);
      if (ANNOUNCER.test(callee)) {
        for (const argument of node.arguments) recordAll(argument, `call:${callee}`);
      }
    }

    ts.forEachChild(node, visit);
  })(sourceFile);

  return findings;
}

/** @returns {{file: string, line: number, kind: string, value: string}[]} */
function findBareLiterals() {
  const findings = [];
  for (const file of sourceFiles(path.join(ROOT, 'src'))) {
    findings.push(...scanSource(path.relative(ROOT, file), fs.readFileSync(file, 'utf8')));
  }
  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  return findings;
}

module.exports = { findBareLiterals, scanSource };

if (require.main === module) {
  const findings = findBareLiterals();
  for (const finding of findings) {
    console.log(
      `${finding.file}:${finding.line}  [${finding.kind}]  ${JSON.stringify(finding.value)}`,
    );
  }
  console.log(`\n${findings.length} bare literal(s).`);
}
