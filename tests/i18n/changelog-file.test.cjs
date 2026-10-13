const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const {
  findUntranslatedPaths,
  formatVersionId,
  isStagedEntryFile,
  isVersionFile,
  readEntryKeys,
  readEntryObject,
  serializeEntry,
  writeEntryFile,
} = require('../../scripts/changelog-file.cjs');

/**
 * The invariant: **one implementation of reading and writing a changelog locale
 * file, and what it writes it can read back unchanged.**
 *
 * The serializer once had three copies and the reader eight, and they had
 * drifted in three ways — each a fix that landed in one copy only:
 *
 * - the `isVersionFile` guard existed in `sync-changelog.cjs` alone;
 * - the nested-object branch was missing from `changelog-fold.cjs`, so a
 *   `_highlights` block serialized to the string `'[object Object]'`;
 * - backslash escaping existed in `changelog-fold.cjs` alone, so `'C:\Users'`
 *   round-tripped to `C:Users` through the other two.
 *
 * Each of those is a case below, asserted through a real round trip rather than
 * against an expected string — a test that pins the exact output would have to
 * be rewritten by whoever changes the formatting, which is how the copies
 * drifted apart in the first place.
 */

/** Writes `obj`, reads it back through the real reader, and returns what survived. */
function roundTrip(id, obj, locale = 'en') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kiwicv-changelog-file-'));
  try {
    const file = path.join(dir, `${id}.ts`);
    writeEntryFile(file, id, obj, locale);
    return { back: readEntryObject(file), content: fs.readFileSync(file, 'utf8') };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('a backslash survives the round trip', () => {
  // Two of the three old serializers escaped `'` and `\n` but not `\`, so the
  // backslash was consumed as the start of an escape and 'C:\Users' came back
  // as 'C:Users' — a silent corruption of the value, not a parse error.
  const { back } = roundTrip('v_004_003_000', {
    fix_windows_path: String.raw`Use C:\Users\me\Documents to locate the export.`,
  });

  assert.equal(back.fix_windows_path, String.raw`Use C:\Users\me\Documents to locate the export.`);
});

test('a nested _highlights block survives the round trip', () => {
  // `changelog-fold.cjs` shipped without the nested-object branch, so the whole
  // block became the string '[object Object]' — valid TypeScript, and the
  // release's entire highlights tour destroyed.
  const highlights = {
    ai_composer_polish: { badge: 'AI 🤖', title: 'Smoother AI', content: 'Improving is smoother.' },
  };
  const { back, content } = roundTrip('v_004_003_000', {
    _highlights: highlights,
    feat_x: 'A flat value alongside it.',
  });

  assert.deepEqual(back._highlights, highlights);
  assert.doesNotMatch(content, /\[object Object\]/);
});

test('quotes, newlines and a backslash together survive one round trip', () => {
  // Escaping is order-dependent: escape the quote before the backslash and the
  // backslash this step adds gets escaped in turn.
  const value = String.raw`It's a "quoted" path C:\tmp` + '\nsecond line';
  const { back } = roundTrip('v_004_003_000', { fix_escapes: value });

  assert.equal(back.fix_escapes, value);
});

test('only a version file is annotated against the English tree', () => {
  // A staged entry is not in `changelog/index.ts` until the release folds it in,
  // so `Translations['changelog']['entries'][id]` does not resolve yet and an
  // annotation fails `tsc -b` in all fourteen non-English locales. The guard
  // lived in one of the three serializers; `changelog-deps.cjs` was correct only
  // because it happens to write `v_*` files exclusively.
  const staged = serializeEntry('feat_x', { feat_x: 'v' }, 'de');
  assert.doesNotMatch(staged, /Translations/, 'a staged entry must not be annotated');

  const version = serializeEntry('v_004_003_000', { feat_x: 'v' }, 'de');
  assert.match(version, /Translations\['changelog'\]\['entries'\]\['v_004_003_000'\]/);

  // English is the source of the type, so it is never annotated against itself.
  assert.doesNotMatch(serializeEntry('v_004_003_000', { feat_x: 'v' }, 'en'), /Translations/);
});

test('what the writer produces is parseable JavaScript', () => {
  const { content } = roundTrip('v_004_003_000', {
    _highlights: { a_b: { badge: 'B', title: 'T', content: 'C' } },
    fix_quote: String.raw`It's got a \ and a "quote"`,
  });

  assert.doesNotThrow(() => new vm.Script(content.replace(/^export /gm, '')));
});

test('keys are sorted deeply, so a re-serialized file has a stable diff', () => {
  const { content } = roundTrip('v_004_003_000', {
    ui_z: 'z',
    feat_a: 'a',
    _highlights: { b: { title: 'T', badge: 'B', content: 'C' } },
  });

  assert.ok(
    content.indexOf('_highlights') < content.indexOf('feat_a'),
    'top-level keys are not sorted',
  );
  assert.ok(content.indexOf('feat_a') < content.indexOf('ui_z'), 'top-level keys are not sorted');
  // The nested block is JSON-encoded, so its keys sort too — badge, content, title.
  assert.ok(content.indexOf('"badge"') < content.indexOf('"title"'), 'nested keys are not sorted');
});

test('an unreadable file reads as null, never as an empty object', () => {
  // The distinction the whole module rests on. `readEntryObject(f) || {}` turns
  // a file that could not be read into an empty base, and writing that back
  // deletes every key it held — which is how the fold once deleted a staged
  // entry and its fourteen translations while reporting them folded.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kiwicv-changelog-file-'));
  try {
    const missing = path.join(dir, 'nope.ts');
    assert.equal(readEntryObject(missing), null, 'a missing file must read as null');
    assert.equal(readEntryKeys(missing), null, 'a missing file must yield null keys');

    const garbage = path.join(dir, 'garbage.ts');
    fs.writeFileSync(garbage, 'export const v_004_003_000 = not an object;\n');
    assert.equal(readEntryObject(garbage), null, 'an unparseable file must read as null');

    const empty = path.join(dir, 'empty.ts');
    writeEntryFile(empty, 'v_004_003_000', {}, 'en');
    assert.deepEqual(readEntryObject(empty), {}, 'a genuinely empty file reads as {}, not null');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('readEntryKeys returns the object top-level keys, not whatever the text indents', () => {
  // The regex variant this replaced matched `^\s*([a-zA-Z0-9_]+):` line by line
  // over the file body, so it read the shape of the text rather than the keys of
  // the object. It was saved only by `JSON.stringify` quoting nested keys.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kiwicv-changelog-file-'));
  try {
    const file = path.join(dir, 'v_004_003_000.ts');
    writeEntryFile(
      file,
      'v_004_003_000',
      { _highlights: { a_b: { badge: 'B', title: 'T', content: 'C' } }, feat_x: 'v' },
      'en',
    );

    assert.deepEqual(readEntryKeys(file), ['_highlights', 'feat_x']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('isVersionFile is anchored, and isStagedEntryFile is its complement', () => {
  assert.ok(isVersionFile('v_004_003_000'));
  assert.ok(!isVersionFile('feat_x'));
  // Anchored, unlike the `id.startsWith('v_')` it replaced: an entry key that
  // merely begins with `v_` is not a version file and must not be annotated.
  assert.ok(!isVersionFile('v_not_a_version'));

  assert.ok(isStagedEntryFile('feat_import_any_language.ts'));
  assert.ok(isStagedEntryFile('highlight_ai_composer.ts'));
  assert.ok(isStagedEntryFile('anything_a_future_prefix_invents.ts'));
  assert.ok(!isStagedEntryFile('v_004_003_000.ts'));
  assert.ok(!isStagedEntryFile('index.ts'));
  assert.ok(!isStagedEntryFile('meta.ts'));
  assert.ok(!isStagedEntryFile('README.md'));
});

test('formatVersionId pads each part to three digits', () => {
  assert.equal(formatVersionId('4.3.0'), 'v_004_003_000');
  assert.equal(formatVersionId('10.20.30'), 'v_010_020_030');
  // Once verbatim in `release.cjs` and `changelog-deps.cjs`; the two
  // copies agreed, which is why nothing caught that they were copies.
  assert.equal(formatVersionId('1.0.0'), 'v_001_000_000');
});

test('findUntranslatedPaths reaches into a _highlights block', () => {
  const en = {
    feat_x: 'Hello',
    _highlights: { tour: { badge: 'New', title: 'Tour', content: '' } },
  };
  const de = {
    feat_x: 'Hallo',
    _highlights: { tour: { badge: 'Neu', title: 'Tour', content: '' } },
  };
  // An empty English value is not translation work.
  assert.deepEqual(findUntranslatedPaths(en, de), ['_highlights.tour.title']);
  assert.deepEqual(findUntranslatedPaths(en, en), [
    'feat_x',
    '_highlights.tour.badge',
    '_highlights.tour.title',
  ]);
});
