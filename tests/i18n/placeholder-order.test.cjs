const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { LOCALES } = require('../../scripts/i18n/config.cjs');
const catalog = require('../../scripts/i18n/handoff-catalog.cjs');
const { checkHandoffCatalog } = require('../../scripts/i18n/check-handoff-catalog.cjs');
const { canonicalEntries, validateHandoff } = require('../../scripts/i18n/handoff-validation.cjs');
const { catalogId } = require('../../scripts/i18n/locale-ast.cjs');
const {
  extractPlaceholders,
  placeholderOrderError,
  placeholderSequence,
} = require('../../scripts/i18n/text-validation.cjs');

/**
 * `extractPlaceholders` returns a sorted set, so a translation that
 * transposes two placeholders passed every check. A catalog row now opts in
 * with `orderedPlaceholders`; a locale that legitimately reorders is declared in
 * `acceptedReorders`. See `placeholderOrderError` for the rule.
 */
const ROW = {
  orderedPlaceholders: true,
  acceptedReorders: { ja: ['total', 'done'] },
};
const SOURCE = '{{done}} of {{total}} destinations finished.';

test('the old set comparison cannot tell a transposed placeholder from the original', () => {
  const swapped = '{{total}} of {{done}} destinations finished.';
  assert.deepEqual(extractPlaceholders(swapped), extractPlaceholders(SOURCE));
});

test('a transposed placeholder fails, naming the order', () => {
  const error = placeholderOrderError(ROW, 'de', SOURCE, '{{total}} von {{done}} Zielen fertig.');
  assert.match(error, /placeholder order \[total,done\] differs from the expected \[done,total\]/);
});

test('the English order passes, repeated placeholders included', () => {
  assert.equal(placeholderOrderError(ROW, 'de', SOURCE, '{{done}} von {{total}} Zielen.'), '');
  assert.deepEqual(placeholderSequence('{{a}} {{b}} {{a}}'), ['a', 'b']);
});

test('a declared reorder passes, and swapping it back fails', () => {
  assert.equal(placeholderOrderError(ROW, 'ja', SOURCE, '{{total}} 件中 {{done}} 件'), '');
  assert.match(
    placeholderOrderError(ROW, 'ja', SOURCE, '{{done}} 件中 {{total}} 件'),
    /declared for this locale/,
  );
});

test('an undeclared reorder fails and tells the author how to declare it', () => {
  assert.match(
    placeholderOrderError(ROW, 'tr', SOURCE, '{{total}} hedeften {{done}}'),
    /acceptedReorders/,
  );
});

test('a row that is not ordered is not checked', () => {
  assert.equal(
    placeholderOrderError({ orderedPlaceholders: false }, 'de', SOURCE, '{{total}} {{done}}'),
    '',
  );
});

test('every catalog row with two or more placeholders is ordered', () => {
  const missing = catalog
    .filter((row) => placeholderSequence(row.source).length >= 2 && !row.orderedPlaceholders)
    .map(catalogId);
  assert.deepEqual(
    missing,
    [],
    'Add the key to ORDERED_PLACEHOLDERS in scripts/i18n/handoff-catalog.cjs. A key whose ' +
      'placeholders really are interchangeable is not a case this repo has met yet; decide it there.',
  );
});

test('every declared reorder is a real, different permutation of a shipped locale', () => {
  for (const row of catalog.filter((candidate) => candidate.orderedPlaceholders)) {
    const english = placeholderSequence(row.source);
    for (const [locale, sequence] of Object.entries(row.acceptedReorders)) {
      const where = `${catalogId(row)} ${locale}`;
      assert.ok(LOCALES.includes(locale) && locale !== 'en', `${where}: not a locale`);
      assert.deepEqual([...sequence].sort(), [...english].sort(), `${where}: not a permutation`);
      assert.notDeepEqual(sequence, english, `${where}: stale, it equals the English order`);
    }
  }
});

test('the shipped locales hold the declared orders', () => {
  const orderErrors = checkHandoffCatalog().filter((error) => error.includes('placeholder order'));
  assert.deepEqual(orderErrors, []);
});

test('the importer rejects a packet with a transposed placeholder, and only for that', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'handoff-order-'));
  try {
    for (const locale of LOCALES) {
      const entries = canonicalEntries(locale);
      for (const [entryId, entry] of Object.entries(entries)) {
        const declared = catalog.find((row) => catalogId(row) === entryId).acceptedReorders[locale];
        entry.translation = declared
          ? declared.map((name) => `{{${name}}}`).join(' ')
          : entry.source;
      }
      const id = 'ai.diff_prose_count_changed';
      if (locale === 'de') {
        entries[id].translation = entries[id].source
          .replace('{{proposed}}', '@@')
          .replace('{{original}}', '{{proposed}}')
          .replace('@@', '{{original}}');
      }
      fs.writeFileSync(path.join(dir, `${locale}.json`), JSON.stringify(entries));
    }
    const { errors } = validateHandoff(dir);
    assert.equal(errors.length, 1, errors.join('\n'));
    assert.match(errors[0], /^de\.json:ai\.diff_prose_count_changed placeholder order/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('every ORDERED_PLACEHOLDERS key resolves to a catalog row with two or more placeholders', () => {
  const rowsById = new Map(catalog.map((row) => [catalogId(row), row]));
  for (const key of catalog.orderedPlaceholderKeys) {
    const row = rowsById.get(key);
    assert.ok(row, `${key}: no catalog row, so the order is never checked`);
    assert.ok(row.orderedPlaceholders, `${key}: row is not flagged ordered`);
    assert.ok(
      placeholderSequence(row.source).length >= 2,
      `${key}: fewer than two placeholders, nothing to order`,
    );
  }
});
