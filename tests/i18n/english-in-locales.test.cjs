const assert = require('node:assert/strict');
const test = require('node:test');

const { NON_ENGLISH_LOCALES } = require('../../scripts/i18n/config.cjs');
const catalog = require('../../scripts/i18n/handoff-catalog.cjs');
const { catalogId } = require('../../scripts/i18n/locale-ast.cjs');
const { buildEntries, localeValues } = require('../../scripts/generate-i18n-handoff.cjs');

/**
 * `ENGLISH_IN` records the cells that are English on purpose in some locales,
 * so a packet on a clean tree opens no work it did not create (#39). The record
 * has to stay a true claim about src/locales, or it would hide a placeholder.
 */
const rowsById = new Map(catalog.map((row) => [catalogId(row), row]));

test('every ENGLISH_IN key resolves to a catalog row that is not VERBATIM', () => {
  assert.ok(catalog.englishInKeys.length > 0, 'nothing is recorded, so nothing below runs');
  for (const key of catalog.englishInKeys) {
    const row = rowsById.get(key);
    assert.ok(row, `${key}: no catalog row, so the record marks nothing`);
    assert.equal(row.verbatim, false, `${key}: VERBATIM already covers every locale`);
    assert.ok(
      row.englishIn.length < NON_ENGLISH_LOCALES.length,
      `${key}: English in all fourteen belongs in VERBATIM`,
    );
  }
});

test('every recorded cell still holds exactly its English', () => {
  const drifted = [];
  for (const locale of NON_ENGLISH_LOCALES) {
    const stored = localeValues(locale);
    for (const key of catalog.englishInKeys) {
      const row = rowsById.get(key);
      if (!row.englishIn.includes(locale)) continue;
      const value = stored.get(key);
      if (value !== row.source) drifted.push(`${locale}:${key} = ${JSON.stringify(value)}`);
    }
  }
  assert.deepEqual(
    drifted,
    [],
    'A recorded cell no longer equals the English — it was translated. Drop the locale from ' +
      'ENGLISH_IN in handoff-catalog.cjs.',
  );
});

// The regression: a packet built from the committed tree opened ~200 cells.
test('a packet built from the committed tree opens no cell', () => {
  const blank = [];
  for (const locale of NON_ENGLISH_LOCALES) {
    for (const [id, entry] of Object.entries(buildEntries(locale, {}, localeValues(locale)))) {
      if (!entry.translation) blank.push(`${locale}:${id}`);
    }
  }
  assert.deepEqual(blank, [], 'Translate these, or record an intended English in ENGLISH_IN.');
});

test('an unrecorded locale holding the English still opens the cell', () => {
  const key = catalog.englishInKeys[0];
  const row = rowsById.get(key);
  const other = NON_ENGLISH_LOCALES.find((locale) => !row.englishIn.includes(locale));
  assert.equal(buildEntries(other, {}, new Map([[key, row.source]]))[key].translation, '');
});
