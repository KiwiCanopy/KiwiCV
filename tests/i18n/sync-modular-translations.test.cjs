const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const { applyFieldToSource } = require('../../scripts/sync-modular-translations.cjs');
const { flattenExports } = require('../../scripts/i18n/locale-ast.cjs');

// legal.ts-shaped fixture: section keys are quoted numerics, and the same leaf
// name (`title`) exists both on the section and inside a nested child. A regex
// traversal is blind to the first and clobbers the second.
const FIXTURE = `export const legal = {
  privacy: {
    sections: {
      '4': {
        github: {
          content: 'old github content',
          title: 'GitHub',
        },
        title: '4. Data Collection',
      },
    },
    tabLabel: 'Privacy',
  },
};
`;

function apply(source, pathParts, value, moduleName = 'legal') {
  return applyFieldToSource('legal.ts', source, moduleName, pathParts, value);
}

function sectionFourBlocks(content) {
  return (content.match(/['"]?4['"]?:\s*\{/g) || []).length;
}

function assertParses(content, label) {
  const { diagnostics } = ts.transpileModule(content, {
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.Latest },
  });
  assert.deepStrictEqual(
    diagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')),
    [],
    `${label} must still parse`,
  );
}

test('replaces a value nested under a quoted numeric key', () => {
  const { content, modified } = apply(
    FIXTURE,
    ['privacy', 'sections', '4', 'github', 'title'],
    'GitHub (PAT)',
  );
  assert.ok(modified);
  assert.strictEqual(sectionFourBlocks(content), 1, 'must not duplicate the section block');
  const values = flattenExports('legal.ts', content);
  assert.strictEqual(values.get('legal.privacy.sections.4.github.title').value, 'GitHub (PAT)');
  assert.strictEqual(
    values.get('legal.privacy.sections.4.title').value,
    '4. Data Collection',
    'the sibling of the same name must be untouched',
  );
});

test('writes a section title without clobbering the same key in a nested child', () => {
  const { content } = apply(FIXTURE, ['privacy', 'sections', '4', 'title'], '4. Datenerhebung');
  const values = flattenExports('legal.ts', content);
  assert.strictEqual(values.get('legal.privacy.sections.4.title').value, '4. Datenerhebung');
  assert.strictEqual(
    values.get('legal.privacy.sections.4.github.title').value,
    'GitHub',
    'the nested child of the same name must be untouched',
  );
});

test('inserts a new key under an existing quoted numeric section', () => {
  const { content, modified } = apply(
    FIXTURE,
    ['privacy', 'sections', '4', 'drive', 'title'],
    'Google Drive',
  );
  assert.ok(modified);
  assert.strictEqual(sectionFourBlocks(content), 1, 'must reuse the existing quoted block');
  assertParses(content, 'inserted nested parent');
  const values = flattenExports('legal.ts', content);
  assert.strictEqual(values.get('legal.privacy.sections.4.drive.title').value, 'Google Drive');
  assert.strictEqual(values.get('legal.privacy.sections.4.github.title').value, 'GitHub');
});

test('quotes numeric and hyphenated parent keys it has to create', () => {
  const numeric = apply(FIXTURE, ['privacy', 'sections', '10', 'intro', 'title'], 'Ten').content;
  assertParses(numeric, 'created numeric parent');
  assert.match(numeric, /'10': \{/);
  assert.strictEqual(
    flattenExports('legal.ts', numeric).get('legal.privacy.sections.10.intro.title').value,
    'Ten',
  );

  const hyphenated = apply(FIXTURE, ['privacy', 'dashboard-view', 'title'], 'Dashboard').content;
  assertParses(hyphenated, 'created hyphenated parent');
  assert.match(hyphenated, /'dashboard-view': \{/);
  assert.strictEqual(
    flattenExports('legal.ts', hyphenated).get('legal.privacy.dashboard-view.title').value,
    'Dashboard',
  );
});

test('replaces a value under a hyphenated key that already exists', () => {
  const source = `export const legal = {
  privacy: {
    'dashboard-view': {
      title: 'Old',
    },
  },
};
`;
  const { content, modified } = apply(source, ['privacy', 'dashboard-view', 'title'], 'New');
  assert.ok(modified);
  assert.strictEqual(
    flattenExports('legal.ts', content).get('legal.privacy.dashboard-view.title').value,
    'New',
  );
  assert.strictEqual((content.match(/dashboard-view/g) || []).length, 1);
});

test('still handles plain identifier paths', () => {
  const { content, modified } = apply(FIXTURE, ['privacy', 'tabLabel'], 'Datenschutz');
  assert.ok(modified);
  assert.strictEqual(
    flattenExports('legal.ts', content).get('legal.privacy.tabLabel').value,
    'Datenschutz',
  );
});

test('drops a leading path segment that names the export', () => {
  const { content } = apply(FIXTURE, ['legal', 'privacy', 'tabLabel'], 'Datenschutz');
  assert.strictEqual(
    flattenExports('legal.ts', content).get('legal.privacy.tabLabel').value,
    'Datenschutz',
  );
});

test('targets the named export when a module exports more than one object', () => {
  const source = `export const themes = {
  name: 'Themes',
};

export const theme_translations = {
  javascript: {
    label: 'Old',
  },
};
`;
  const { content } = applyFieldToSource(
    'themes.ts',
    source,
    'themes',
    ['theme_translations', 'javascript', 'label'],
    'New',
  );
  const values = flattenExports('themes.ts', content);
  assert.strictEqual(values.get('theme_translations.javascript.label').value, 'New');
  assert.strictEqual(values.get('themes.name').value, 'Themes');
});

test('sorts the block that receives a new key, and only that block', () => {
  const source = `export const legal = {
  privacy: {
    zulu: {
      b: 'b',
      a: 'a',
    },
  },
};
`;
  const { content } = apply(source, ['privacy', 'alpha'], 'A');
  assert.ok(
    content.indexOf('alpha:') < content.indexOf('zulu:'),
    'the new key must land in alphabetical position',
  );
  assert.ok(
    content.indexOf("b: 'b'") < content.indexOf("a: 'a'"),
    'an untouched nested block must keep its original order',
  );
});

test('keeps a comment attached to its key when the block is sorted', () => {
  const source = `export const themes = {
  /** Docs for zulu. */
  zulu: {
    label: 'Z',
  },
};
`;
  const { content } = applyFieldToSource('themes.ts', source, 'themes', ['alpha', 'label'], 'A');
  assertParses(content, 'sorted block with a comment');
  assert.match(content, /\/\*\* Docs for zulu\. \*\/\s*\n\s*zulu: \{/);
});

test('refuses to overwrite an object with a string instead of destroying it', () => {
  assert.throws(
    () => apply(FIXTURE, ['privacy', 'sections', '4', 'github'], 'oops'),
    /is not a string value/,
  );
});

test('does not report a modification when the value is already current', () => {
  const { modified } = apply(FIXTURE, ['privacy', 'tabLabel'], 'Privacy');
  assert.strictEqual(modified, false);
});

// Read-only dry run against the real file that triggered the bug: quoted
// numeric section keys, 15 locales, and a `title` at two nesting levels.
test('dry run over the real src/locales/en/legal.ts', () => {
  const filePath = path.join(__dirname, '../../src/locales/en/legal.ts');
  const source = fs.readFileSync(filePath, 'utf8');
  const before = flattenExports(filePath, source);
  assert.ok(
    before.has('legal.privacy.sections.4.title'),
    'fixture assumption: a quoted numeric section 4 with a title',
  );

  const { content, modified } = applyFieldToSource(
    filePath,
    source,
    'legal',
    ['privacy', 'sections', '4', 'dryRun', 'title'],
    'Google Drive backup',
  );
  assert.ok(modified);
  assertParses(content, 'real legal.ts');

  const after = flattenExports(filePath, content);
  assert.strictEqual(
    after.get('legal.privacy.sections.4.dryRun.title').value,
    'Google Drive backup',
  );

  const changed = [...after.keys()].filter(
    (key) => !before.has(key) || before.get(key).value !== after.get(key).value,
  );
  assert.deepStrictEqual(
    changed.sort(),
    ['legal.privacy.sections.4.dryRun', 'legal.privacy.sections.4.dryRun.title'],
    'nothing outside the inserted path may change',
  );
  assert.strictEqual(before.size + 2, after.size, 'no key may be dropped');

  assert.strictEqual(fs.readFileSync(filePath, 'utf8'), source, 'the dry run must not write');
});
