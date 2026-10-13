const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { LOCALES, NON_ENGLISH_LOCALES } = require('../../scripts/i18n/config.cjs');
const catalog = require('../../scripts/i18n/handoff-catalog.cjs');
const { canonicalEntries, validateHandoff } = require('../../scripts/i18n/handoff-validation.cjs');
const { catalogId } = require('../../scripts/i18n/locale-ast.cjs');
const { buildEntries, localeValues } = require('../../scripts/generate-i18n-handoff.cjs');

/**
 * A `VERBATIM` row is one whose correct value is the English in all
 * fourteen locales. The generator pre-fills it instead of blanking it, so the
 * marker has to stay a true claim — about the catalog and about src/locales.
 */
const verbatimRows = catalog.filter((row) => row.verbatim);

test('every VERBATIM key resolves to a catalog row', () => {
  assert.ok(verbatimRows.length > 0, 'no row is marked verbatim, so nothing below runs');
  const ids = new Set(catalog.map(catalogId));
  for (const key of catalog.verbatimKeys) {
    assert.ok(ids.has(key), `${key}: no catalog row, so the marker marks nothing`);
  }
  assert.equal(verbatimRows.length, catalog.verbatimKeys.length);
});

test('every verbatim row holds exactly its English in every locale', () => {
  const drifted = [];
  for (const locale of NON_ENGLISH_LOCALES) {
    const stored = localeValues(locale);
    for (const row of verbatimRows) {
      const value = stored.get(catalogId(row));
      if (value !== row.source)
        drifted.push(`${locale}:${catalogId(row)} = ${JSON.stringify(value)}`);
    }
  }
  assert.deepEqual(
    drifted,
    [],
    'A locale holds something other than the English for a row marked verbatim. Either the ' +
      'locale is wrong, or the row is not verbatim everywhere: drop it from VERBATIM.',
  );
});

test('the generator pre-fills a verbatim row and keeps a value that differs', () => {
  const row = verbatimRows[0];
  const id = catalogId(row);
  assert.equal(buildEntries('ja', {}, new Map())[id].translation, row.source);
  assert.equal(buildEntries('ja', {}, new Map([[id, row.source]]))[id].translation, row.source);
  // Kept rather than overwritten, so the importer is the one that says no.
  assert.equal(buildEntries('ja', {}, new Map([[id, 'drift']]))[id].translation, 'drift');
});

test('the importer rejects a verbatim row whose translation differs, and only that', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'handoff-verbatim-'));
  const id = catalogId(verbatimRows[0]);
  try {
    for (const locale of LOCALES) {
      const entries = canonicalEntries(locale);
      for (const [entryId, entry] of Object.entries(entries)) {
        const declared = catalog.find((row) => catalogId(row) === entryId).acceptedReorders[locale];
        entry.translation = declared
          ? declared.map((name) => `{{${name}}}`).join(' ')
          : entry.source;
      }
      if (locale === 'de') entries[id].translation = `${entries[id].source} (de)`;
      fs.writeFileSync(path.join(dir, `${locale}.json`), JSON.stringify(entries));
    }
    const { errors } = validateHandoff(dir);
    assert.equal(errors.length, 1, errors.join('\n'));
    assert.equal(errors[0], `de.json:${id} is marked verbatim and must equal the approved source`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
