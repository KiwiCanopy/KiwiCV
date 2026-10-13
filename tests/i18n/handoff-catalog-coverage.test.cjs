const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const catalog = require('../../scripts/i18n/handoff-catalog.cjs');
const ts = require('typescript');
const { exportedObjects, parseSource } = require('../../scripts/i18n/locale-ast.cjs');

/**
 * An export with no catalog row is never offered for translation: every key in
 * it is generated, synced, shipped as English in fourteen locales, and appears
 * in no packet — silently, since every other check passes. Keyed per
 * EXPORT, not per file: `themes.ts` holds two, and `theme_translations` sat
 * outside the catalog behind its sibling's rows.
 *
 * ⚠️ **This guards PRESENCE, not coverage.** A module with one row and thirty
 * uncatalogued keys passes, and nothing ratchets the uncatalogued count yet.
 * `untranslated.test.cjs` cannot stand in for either: it fires
 * only when a key is English in ALL fifteen locales.
 *
 * ⚠️ **An entry below is a decision, and the list only shrinks.** An export
 * listed here with no row is deliberate or filed; one that has since gained
 * rows is a stale entry and fails too. A key names ONE export — `header`, or
 * `themes:theme_translations` — never a whole file.
 */
const CATALOGUE_EXEMPT_EXPORTS = {
  changelog:
    'staged and translated by sync-changelog.cjs on its own release cadence, never through the packet',
};

const EN_DIR = path.join(__dirname, '..', '..', 'src', 'locales', 'en');

/** The catalog's spelling of an export: the bare name when it is the file's own. */
const exportSpec = (file, name) => (file === name ? name : `${file}:${name}`);

/** An exemption key in the same spelling, so `header:header` and `header` are one. */
const normalizeKey = (key) => {
  const [file, name = file] = key.split(':');
  return exportSpec(file, name);
};

/**
 * What ships: every member of `en` in `src/locales/en/index.ts`, spelled by the
 * file it is imported from. The scan below can only see `export const x = {…}`;
 * this is what keeps an export in any other form from passing unseen.
 */
const shippedExports = () => {
  const filePath = path.join(EN_DIR, 'index.ts');
  const source = parseSource(filePath, fs.readFileSync(filePath, 'utf8'));
  const fileOf = new Map();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const file = statement.moduleSpecifier.text.split('/').pop();
    for (const element of statement.importClause?.namedBindings?.elements ?? []) {
      fileOf.set(element.name.text, file);
    }
  }
  const en = exportedObjects(source).get('en');
  assert.ok(en, 'src/locales/en/index.ts no longer declares `export const en = {…}`');
  return en.properties.map((property) => {
    const name = property.name.text;
    return exportSpec(fileOf.get(name) ?? name, name);
  });
};

/** Every exported object of every English module, as `module:export` (the catalog's spelling). */
const englishExports = () =>
  fs
    .readdirSync(EN_DIR)
    .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
    .flatMap((file) => {
      const filePath = path.join(EN_DIR, file);
      const moduleName = file.replace(/\.ts$/, '');
      const names = [
        ...exportedObjects(parseSource(filePath, fs.readFileSync(filePath, 'utf8'))).keys(),
      ];
      return names.map((name) => exportSpec(moduleName, name));
    });

const catalogued = () => new Set(catalog.map((row) => exportSpec(row.module, row.exportName)));

test('every English locale export has a catalog row, or a recorded reason not to', () => {
  const exports = englishExports();
  assert.ok(exports.length > 10, 'no exports found — the scan is looking in the wrong place');
  // The scan sees exactly what ships; an export it cannot parse would otherwise pass unseen.
  assert.deepEqual([...exports].sort(), shippedExports().sort());

  const covered = catalogued();
  const exempt = new Set(Object.keys(CATALOGUE_EXEMPT_EXPORTS).map(normalizeKey));
  const blind = exports.filter((e) => !covered.has(e) && !exempt.has(e));
  assert.deepEqual(
    blind,
    [],
    `${blind.join(', ')}: no handoff-catalog row, so no key in it can ever reach a packet. ` +
      'Add rows, or list it in CATALOGUE_EXEMPT_EXPORTS with the issue that will.',
  );

  const stale = [...exempt].filter((e) => covered.has(e) || !exports.includes(e));
  assert.deepEqual(
    stale,
    [],
    `${stale.join(', ')}: exempted, but now catalogued (or gone) — delete the entry in the same change set.`,
  );
});
