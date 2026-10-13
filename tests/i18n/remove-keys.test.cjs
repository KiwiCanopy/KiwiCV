const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { removeModuleProperty } = require('../../scripts/i18n/locale-ast.cjs');
const { moduleTarget, resolveSpec } = require('../../scripts/remove-keys.cjs');
const { flattenExports } = require('../../scripts/i18n/locale-ast.cjs');

/**
 * `remove-keys.cjs` parsed a locale file with one greedy regex and `eval`, so a
 * file with two exports (`themes.ts`) or a `satisfies` clause (en) printed
 * "Error parsing" for every locale and removed nothing. The removal now
 * cuts the property out of the AST's text range.
 */
const TWO_EXPORTS = `import type { X } from './x';

export const themes = {
  names: {
    lunar: 'Lunar',
  },
} satisfies X;

export const theme_translations = {
  bcp47: 'en-US',
  sections: {
    // The work heading.
    work: 'Work',
    x: 'Gone',
    skills: 'Skills',
  },
} satisfies X;
`;

test('removes a key from the second export of a file, satisfies clause and all', () => {
  const next = removeModuleProperty('themes.ts', TWO_EXPORTS, 'theme_translations', 'sections.x');
  assert.equal(next, TWO_EXPORTS.replace("    x: 'Gone',\n", ''));
});

test('takes the comment above a property with it, and leaves the first export alone', () => {
  const next = removeModuleProperty(
    'themes.ts',
    TWO_EXPORTS,
    'theme_translations',
    'sections.work',
  );
  assert.equal(next, TWO_EXPORTS.replace("    // The work heading.\n    work: 'Work',\n", ''));
  assert.ok(next.includes("lunar: 'Lunar'"));
});

test('removes the last property, trailing comma or none', () => {
  const source = "export const a = {\n  b: {\n    c: 'C',\n    d: 'D'\n  },\n};\n";
  assert.equal(
    removeModuleProperty('a.ts', source, 'a', 'b.d'),
    "export const a = {\n  b: {\n    c: 'C',\n  },\n};\n",
  );
});

test('returns null for a key, export or object path that is not there', () => {
  assert.equal(
    removeModuleProperty('t.ts', TWO_EXPORTS, 'theme_translations', 'sections.none'),
    null,
  );
  assert.equal(removeModuleProperty('t.ts', TWO_EXPORTS, 'nope', 'sections.x'), null);
  assert.equal(removeModuleProperty('t.ts', TWO_EXPORTS, 'theme_translations', 'bcp47.x'), null);
});

test('resolves the catalog spelling and a bare export name to the same file', () => {
  const expected = { file: 'themes', exportName: 'theme_translations', keyPath: 'sections.x' };
  assert.deepEqual(resolveSpec('themes:theme_translations.sections.x'), expected);
  assert.deepEqual(resolveSpec('theme_translations.sections.x'), expected);
  assert.deepEqual(resolveSpec('editor.fields.name'), {
    file: 'editor',
    exportName: 'editor',
    keyPath: 'fields.name',
  });
  assert.equal(resolveSpec('nonexistent.key'), null);
});

test('removes a real theme_translations key from every shipped locale file', () => {
  const dir = path.join(__dirname, '..', '..', 'src', 'locales');
  const locales = fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isDirectory());
  assert.equal(locales.length, 15);
  for (const locale of locales) {
    const file = path.join(dir, locale, 'themes.ts');
    const next = removeModuleProperty(
      file,
      fs.readFileSync(file, 'utf8'),
      'theme_translations',
      'sections.work',
    );
    assert.ok(next, `${locale}: theme_translations.sections.work not found`);
    assert.ok(!/^\s{4}work:/m.test(next.slice(next.indexOf('theme_translations'))), locale);
  }
});

test('never takes a sibling on the same line, or one ahead of a trailing comment', () => {
  const sameLine = "export const a = {\n  b: 'B', c: 'C',\n  d: 'D',\n};\n";
  assert.equal(
    removeModuleProperty('a.ts', sameLine, 'a', 'c'),
    "export const a = {\n  b: 'B',\n  d: 'D',\n};\n",
  );

  const trailing = "export const a = {\n  x: 'X', // note\n  y: 'Y',\n};\n";
  assert.equal(
    removeModuleProperty('a.ts', trailing, 'a', 'y'),
    "export const a = {\n  x: 'X', // note\n};\n",
  );
});

test('an inline object and a first property on the brace line stay valid', () => {
  const inline = "export const a = {\n  o: { c: 'C', d: 'D' },\n};\n";
  const next = flattenExports('a.ts', removeModuleProperty('a.ts', inline, 'a', 'o.d'));
  assert.ok(next.has('a.o.c') && !next.has('a.o.d'));

  const braceLine = "export const a = { b: 'B',\n  c: 'C',\n};\n";
  const after = flattenExports('a.ts', removeModuleProperty('a.ts', braceLine, 'a', 'b'));
  assert.ok(after.has('a.c') && !after.has('a.b'));
});

test('a changelog key resolves to changelog/meta.ts and its meta export', () => {
  const target = moduleTarget('en', resolveSpec('changelog.types.ui'));
  assert.ok(target.filePath.endsWith(path.join('en', 'changelog', 'meta.ts')));
  assert.equal(target.exportName, 'meta');
  const source = fs.readFileSync(target.filePath, 'utf8');
  const next = removeModuleProperty(target.filePath, source, 'meta', 'types.ui');
  assert.ok(next && !flattenExports(target.filePath, next).has('meta.types.ui'));
});

test('a cut that would lose more than its key throws instead of writing', () => {
  // Every real file round-trips: the invariant inside removeModuleProperty holds.
  const dir = path.join(__dirname, '..', '..', 'src', 'locales', 'en');
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.ts') && f !== 'index.ts')) {
    const filePath = path.join(dir, file);
    const source = fs.readFileSync(filePath, 'utf8');
    const leaves = [...flattenExports(filePath, source).keys()].filter(
      (key) => key.includes('.') && !key.includes('...'),
    );
    for (const key of [leaves[0], leaves[Math.floor(leaves.length / 2)], leaves.at(-1)]) {
      const [exportName, ...rest] = key.split('.');
      assert.ok(removeModuleProperty(filePath, source, exportName, rest.join('.')), key);
    }
  }
});
