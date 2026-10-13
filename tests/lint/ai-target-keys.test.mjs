import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import { PRODUCT_SOURCE_SKIP, sourceFiles as listSourceFiles } from '../../src/test/sourceFiles.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * The store records a proposal under an `item:`/`section:` key and each form
 * reads it back under the same key; a hand-spelled copy that drifts shows no
 * diff panel and no error. `src/utils/aiTarget.ts` holds the one
 * spelling of every prefix — the builders, the `isItemTarget`-style predicates
 * and the parser. This walks string and template literals (comments are
 * not literals) for one that opens with `item:` or `section:` — a key,
 * or a bare prefix handed to `startsWith` or `+`.
 *
 * ⚠️ A forward guard on the obvious spellings only: a prefix assembled from parts
 * (`'item' + ':'`, `${'item'}:`) passes it.
 */
const HELPER_HOME = 'src/utils/aiTarget.ts';
const SPELLED = /^(item|section):/;

/** `file:line text` for every literal in `source` that spells a target prefix. */
const handSpelledTargets = (file, source) => {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = [];
  const visit = (node) => {
    const text =
      ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
        ? node.text
        : ts.isTemplateExpression(node)
          ? node.head.text + '${'
          : undefined;
    if (text !== undefined && SPELLED.test(text)) {
      const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      found.push(`${file}:${line + 1} ${node.getText(sf)}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
};

test('the walk reports a hand-built key and a hand-spelled prefix, and passes a comment', () => {
  const source = [
    'const a = `item:${k}:${v}`;',
    "const b = 'section:work';",
    '<X target="item:basics" />;',
    "const c = key.startsWith('item:');",
    '// `item:${k}` in a comment',
    "const d = 'item:' + k;",
    "const e = 'section:' + k + ':' + v;",
    "const f = t.startsWith('group:');",
    "const g = 'custom:' + id;",
    "const h = 'cv';",
  ].join('\n');
  assert.deepEqual(
    handSpelledTargets('fixture.tsx', source).map((hit) => hit.split(' ')[0]),
    [
      'fixture.tsx:1',
      'fixture.tsx:2',
      'fixture.tsx:3',
      'fixture.tsx:4',
      'fixture.tsx:6',
      'fixture.tsx:7',
    ],
  );
});

test('no AI target prefix is spelled outside aiTarget.ts', () => {
  const files = listSourceFiles(path.join(ROOT, 'src'), {
    extensions: ['.ts', '.tsx'],
    skip: PRODUCT_SOURCE_SKIP,
  });
  const hits = files
    .map((file) => path.relative(ROOT, file))
    .filter((rel) => rel !== HELPER_HOME)
    .flatMap((rel) => handSpelledTargets(rel, fs.readFileSync(path.join(ROOT, rel), 'utf8')));

  assert.deepEqual(
    hits,
    [],
    'Build a target with `itemTarget(sectionKey, vId?)` or `sectionTarget(sectionKey)`, and test ' +
      'one with `isItemTarget`/`isSectionTarget`/`isGroupTarget`, all from `@/utils/aiTarget`, ' +
      'so the store and the form that reads it cannot spell it apart.',
  );
});
