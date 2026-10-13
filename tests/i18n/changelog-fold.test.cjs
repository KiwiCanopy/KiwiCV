const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { foldStagedEntries, isStagedEntryFile } = require('../../scripts/changelog-fold.cjs');

/**
 * The gap this closes cost a real release.
 *
 * `npm run changelog:add` names its output after the entry key, so it writes
 * `feat_x.ts` beside the `v_*` files. But `changelog/index.ts` is rebuilt from
 * `v_*` only, and `sync-changelog.cjs`'s structural sync walks `v_*` only — so
 * nothing ever read a staged entry. `feat_heic_photo_upload` was staged,
 * merged before 4.2.4, and `v_004_002_004.ts` shipped carrying only the
 * dependency line: a user-facing feature announced to nobody, with its fifteen
 * translations sitting in the tree unused.
 *
 * ⚠️ **These call `foldStagedEntries` directly, so they cannot see the call
 * site.** The first version of this file claimed "stage an entry, cut a
 * release" as a mutation; deleting the `require` and the step-5.5 block from
 * `release.cjs` — restoring the exact bug — left the whole suite green. The
 * ordering test at the bottom is what actually binds the two.
 */

const LOCALES = ['en', 'de'];

function createFixture(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kiwicv-fold-'));
  for (const locale of LOCALES) {
    const dir = path.join(root, locale, 'changelog');
    fs.mkdirSync(dir, { recursive: true });
    for (const [name, content] of Object.entries(files(locale))) {
      fs.writeFileSync(path.join(dir, name), content, 'utf8');
    }
  }
  return root;
}

const staged = (key, value) => `export const ${key} = {\n  ${key}: '${value}',\n};\n`;

test('treats anything that is not index/meta/v_* as a staged entry', () => {
  assert.ok(isStagedEntryFile('feat_import_any_language.ts'));
  assert.ok(isStagedEntryFile('ui_landing_refresh.ts'));
  assert.ok(isStagedEntryFile('chore_dependency_updates.ts'));
  // `add-changelog.cjs` emits this id for a highlight entry. An allowlist of
  // prefixes missed it, which reopened the very bug the fold closes.
  assert.ok(isStagedEntryFile('highlight_ai_composer.ts'));
  assert.ok(isStagedEntryFile('anything_a_future_prefix_invents.ts'));
  assert.ok(!isStagedEntryFile('v_004_003_000.ts'));
  assert.ok(!isStagedEntryFile('v_001_000_000.ts'));
  assert.ok(!isStagedEntryFile('index.ts'));
  assert.ok(!isStagedEntryFile('meta.ts'));
});

test('folds every staged entry into the version file and removes the originals', (context) => {
  const root = createFixture((locale) => ({
    'feat_one.ts': staged('feat_one', `one-${locale}`),
    'ui_two.ts': staged('ui_two', `two-${locale}`),
    'index.ts': 'export const changelog_entries = {};\n',
    'meta.ts': 'export const meta = {};\n',
  }));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const result = foldStagedEntries(root, LOCALES, 'v_004_003_000');
  assert.deepEqual(result.folded, ['feat_one', 'ui_two']);

  for (const locale of LOCALES) {
    const dir = path.join(root, locale, 'changelog');
    assert.ok(!fs.existsSync(path.join(dir, 'feat_one.ts')), `${locale}: staged file survived`);
    assert.ok(!fs.existsSync(path.join(dir, 'ui_two.ts')), `${locale}: staged file survived`);

    const version = fs.readFileSync(path.join(dir, 'v_004_003_000.ts'), 'utf8');
    assert.match(version, new RegExp(`feat_one: 'one-${locale}'`));
    assert.match(version, new RegExp(`ui_two: 'two-${locale}'`));

    // index.ts and meta.ts are not entries and must be left alone.
    assert.ok(fs.existsSync(path.join(dir, 'index.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'meta.ts')));
  }
});

test('merges into a version file that already exists rather than replacing it', (context) => {
  // The real ordering that produces this: `changelog:deps` injects its line, or
  // the release is re-run after a failure part-way through.
  const root = createFixture(() => ({
    'v_004_003_000.ts': "export const v_004_003_000 = {\n  chore_dependency_updates: 'deps',\n};\n",
    'feat_one.ts': staged('feat_one', 'one'),
  }));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  foldStagedEntries(root, LOCALES, 'v_004_003_000');

  const version = fs.readFileSync(path.join(root, 'en', 'changelog', 'v_004_003_000.ts'), 'utf8');
  assert.match(version, /chore_dependency_updates: 'deps'/);
  assert.match(version, /feat_one: 'one'/);
});

test('types the non-English version files and leaves English untyped', (context) => {
  const root = createFixture(() => ({ 'feat_one.ts': staged('feat_one', 'one') }));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  foldStagedEntries(root, LOCALES, 'v_004_003_000');

  const en = fs.readFileSync(path.join(root, 'en', 'changelog', 'v_004_003_000.ts'), 'utf8');
  const de = fs.readFileSync(path.join(root, 'de', 'changelog', 'v_004_003_000.ts'), 'utf8');
  assert.ok(!en.includes('Translations'), 'English must stay untyped — it is the source');
  assert.match(de, /Translations\['changelog'\]\['entries'\]\['v_004_003_000'\]/);
});

test('a release with nothing staged reports it and writes no version file', (context) => {
  const root = createFixture(() => ({ 'index.ts': 'export const changelog_entries = {};\n' }));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const result = foldStagedEntries(root, LOCALES, 'v_004_003_000');
  assert.deepEqual(result.folded, []);
  assert.ok(!fs.existsSync(path.join(root, 'en', 'changelog', 'v_004_003_000.ts')));
});

test('refuses to delete a staged entry it could not read', (context) => {
  // `readEntryObject`'s regex stops at the first `};`, so a value containing
  // one is enough. The unlink used to be unconditional: the entry and its
  // fourteen translations were deleted and reported as folded.
  const root = createFixture(() => ({
    'feat_broken.ts': "export const feat_broken = {\n  feat_broken: 'Try {tag}; it helps',\n};\n",
  }));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.throws(
    () => foldStagedEntries(root, LOCALES, 'v_004_003_000'),
    /Cannot read staged entry/,
  );
  assert.ok(
    fs.existsSync(path.join(root, 'en', 'changelog', 'feat_broken.ts')),
    'the unreadable entry was deleted anyway',
  );
});

test('refuses to fold into a version file it could not read', (context) => {
  // `|| {}` here turned an unreadable base into an empty one and wrote it,
  // silently dropping every key already folded or injected by changelog:deps.
  const root = createFixture(() => ({
    'v_004_003_000.ts': "export const v_004_003_000 = {\n  prev: 'Use {tag}; it helps',\n};\n",
    'feat_one.ts': staged('feat_one', 'one'),
  }));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.throws(
    () => foldStagedEntries(root, LOCALES, 'v_004_003_000'),
    /Refusing to fold into it/,
  );
  const version = fs.readFileSync(path.join(root, 'en', 'changelog', 'v_004_003_000.ts'), 'utf8');
  assert.match(version, /prev:/, 'the unreadable base was overwritten');
});

test('serialises a nested highlights block as JSON, not [object Object]', (context) => {
  const root = createFixture(() => ({
    'highlight_tour.ts':
      "export const highlight_tour = {\n  _highlights: { tour: { badge: 'AI', title: 'T', content: 'C' } },\n};\n",
  }));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  foldStagedEntries(root, LOCALES, 'v_004_003_000');
  const version = fs.readFileSync(path.join(root, 'en', 'changelog', 'v_004_003_000.ts'), 'utf8');
  assert.ok(!version.includes('[object Object]'), 'the highlights block was stringified');
  assert.match(version, /"badge": "AI"/);
});

test('keeps every highlight when several sources carry a _highlights block', (context) => {
  // A shallow merge kept only the last block folded: two staged highlights, or
  // an inbox highlight already in the version file, lost all but one.
  const block = (id) => `_highlights: { ${id}: { badge: 'B', title: 'T', content: 'C' } }`;
  const root = createFixture(() => ({
    'v_004_003_000.ts': `export const v_004_003_000 = {\n  ${block('inbox')},\n};\n`,
    'highlight_a.ts': `export const highlight_a = {\n  ${block('a')},\n};\n`,
    'highlight_b.ts': `export const highlight_b = {\n  ${block('b')},\n};\n`,
  }));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  foldStagedEntries(root, LOCALES, 'v_004_003_000');
  const version = fs.readFileSync(path.join(root, 'en', 'changelog', 'v_004_003_000.ts'), 'utf8');
  for (const id of ['inbox', 'a', 'b']) assert.match(version, new RegExp(`"${id}": \\{`));
});

test('escapes apostrophes, newlines and backslashes in a value', (context) => {
  const root = createFixture(() => ({
    'feat_q.ts': 'export const feat_q = {\n  feat_q: "it\'s a C:\\\\path",\n};\n',
  }));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  foldStagedEntries(root, LOCALES, 'v_004_003_000');
  const file = path.join(root, 'en', 'changelog', 'v_004_003_000.ts');
  const version = fs.readFileSync(file, 'utf8');
  // The written file must be re-readable: round-tripping is the real assertion.
  const reread = version.match(/=\s*(\{[\s\S]*?\});/);
  assert.ok(reread, 'the written file no longer parses');
  let obj = {};

  eval(`obj = ${reread[1]}`);
  assert.equal(obj.feat_q, "it's a C:\\path");
});

test('release.cjs still folds, and validates the changelog after folding', () => {
  // The unit tests above call foldStagedEntries directly and cannot see the
  // call site; deleting it left them all green. This is the binding.
  const release = fs.readFileSync(
    path.join(__dirname, '..', '..', 'scripts', 'release.cjs'),
    'utf8',
  );

  const fold = release.indexOf('foldStagedEntries(');
  const inboxSync = release.indexOf("execSync('npm run changelog:sync'");
  const sync = release.lastIndexOf("execSync('npm run changelog:sync'");
  const highlights = release.indexOf('?._highlights');
  const highlightGuard = release.indexOf('changelogHighlights.test.ts', sync);
  const translations = release.indexOf('validateChangelogTranslations(newId');
  const keys = release.indexOf('validateChangelogKeys(newId)');

  assert.ok(fold > 0, 'release.cjs no longer folds staged entries');
  assert.ok(sync > 0, 'release.cjs no longer syncs changelog locales');
  assert.ok(
    fold < sync,
    'the fold must run before changelog:sync, which rebuilds the indexes from the v_* files',
  );
  // An inbox entry applied only after the highlights were read shipped 4.5.0
  // with its highlight undeclared in changelog.ts.
  assert.ok(
    inboxSync < fold && inboxSync < sync,
    'the CHANGELOG_UPDATES inbox must be applied before the fold',
  );
  assert.ok(
    highlights > fold && highlights > inboxSync,
    'highlights are registered before every changelog source is in the version file',
  );
  assert.ok(highlightGuard > sync, 'the highlights test no longer reruns after the locale writes');
  // Both checks return early when the version file is absent, and before the
  // fold it always is — which is how the translation gate sat dead.
  assert.ok(keys > fold, 'validateChangelogKeys runs before the version file exists');
  assert.ok(
    translations > fold,
    'validateChangelogTranslations runs before the version file exists, so it validates nothing',
  );
});
