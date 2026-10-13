const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { LOCALES } = require('../../scripts/i18n/config.cjs');
const { canonicalEntries } = require('../../scripts/i18n/handoff-validation.cjs');
const { importHandoff } = require('../../scripts/i18n/import-handoff.cjs');
const { catalogId, updateModuleSource } = require('../../scripts/i18n/locale-ast.cjs');
const {
  extractPlaceholders,
  fingerprint,
  validateRichText,
} = require('../../scripts/i18n/text-validation.cjs');
const { buildEntries } = require('../../scripts/generate-i18n-handoff.cjs');
const catalog = require('../../scripts/i18n/handoff-catalog.cjs');

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kiwicv-i18n-'));
  const translatorDir = path.join(root, 'translations');
  const localesDir = path.join(root, 'locales');
  fs.mkdirSync(translatorDir, { recursive: true });
  const affectedModules = new Set();

  for (const locale of LOCALES) {
    const packet = canonicalEntries(locale);
    for (const [id, entry] of Object.entries(packet)) {
      // A locale that declares a placeholder reorder gets its own sequence.
      const declared = catalog.find((row) => catalogId(row) === id).acceptedReorders[locale];
      entry.translation = declared ? declared.map((name) => `{{${name}}}`).join(' ') : entry.source;
    }
    for (const entry of Object.values(packet)) affectedModules.add(entry.module);
    fs.writeFileSync(
      path.join(translatorDir, `${locale}.json`),
      JSON.stringify(packet, null, 2),
      'utf8',
    );
    const localeDir = path.join(localesDir, locale);
    fs.mkdirSync(localeDir, { recursive: true });
    for (const moduleName of affectedModules) {
      // Every export the catalog addresses in this file, e.g. both `themes`
      // and `theme_translations` in themes.ts.
      const exportNames = new Set([moduleName]);
      for (const row of catalog) if (row.module === moduleName) exportNames.add(row.exportName);
      fs.writeFileSync(
        path.join(localeDir, `${moduleName}.ts`),
        [...exportNames].map((name) => `export const ${name} = {};\n`).join(''),
        'utf8',
      );
    }
  }
  return { affectedModules, localesDir, root, translatorDir };
}

test('extracts both supported placeholder forms and validates rich-text balance', () => {
  assert.deepEqual(extractPlaceholders('Hello {{name}} — use {CONTACT_EMAIL} and {{count}}.'), [
    'CONTACT_EMAIL',
    'count',
    'name',
  ]);
  assert.deepEqual(validateRichText('<strong>Safe <span>content</span></strong>'), []);
  assert.equal(validateRichText('<strong>Broken</span>').length, 1);
});

test('updates an existing key and inserts a missing nested path', () => {
  const original = "export const landing = { hero: { title: 'Old' } };\n";
  const updated = updateModuleSource('landing.ts', original, 'landing', 'hero.title', 'New');
  assert.match(updated, /title: 'New'/);

  const inserted = updateModuleSource(
    'landing.ts',
    updated,
    'landing',
    'workflow.create.title',
    'Create',
  );
  assert.match(inserted, /workflow:\s*\{/);
  assert.match(inserted, /create:\s*\{/);
  assert.match(inserted, /title: 'Create'/);
});

test('invalid handoff packets change no locale source file', async (context) => {
  const fixture = createFixture();
  context.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }));
  const target = path.join(fixture.localesDir, 'en', 'landing.ts');
  const before = fs.readFileSync(target, 'utf8');
  const germanPath = path.join(fixture.translatorDir, 'de.json');
  const germanPacket = JSON.parse(fs.readFileSync(germanPath, 'utf8'));
  germanPacket['landing.hero.title'].translation = '';
  fs.writeFileSync(germanPath, JSON.stringify(germanPacket), 'utf8');

  const result = await importHandoff({
    apply: true,
    localesDir: fixture.localesDir,
    translatorDir: fixture.translatorDir,
  });
  assert.ok(result.errors.some((error) => error.includes('translation is empty')));
  assert.equal(fs.readFileSync(target, 'utf8'), before);
});

test('a complete packet stages every affected locale module before writing', async (context) => {
  const fixture = createFixture();
  context.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }));
  const target = path.join(fixture.localesDir, 'en', 'landing.ts');
  const before = fs.readFileSync(target, 'utf8');

  const result = await importHandoff({
    apply: false,
    localesDir: fixture.localesDir,
    translatorDir: fixture.translatorDir,
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.staged.size, LOCALES.length * fixture.affectedModules.size);
  assert.equal(fs.readFileSync(target, 'utf8'), before);
  // Derived from the catalog, never a hardcoded literal: this used to pin the
  // English hero headline verbatim, so editing marketing copy failed a test
  // about *staging semantics* that has nothing to do with the words. Escaped
  // the way `locale-ast.cjs` writes values, so an apostrophe in future copy
  // does not reopen the same trap.
  const heroTitle = require('../../scripts/i18n/handoff-catalog.cjs').find(
    (entry) => entry.module === 'landing' && entry.path === 'hero.title',
  );
  assert.ok(heroTitle, 'the catalog no longer carries landing.hero.title');
  assert.ok(result.staged.get(target).includes(heroTitle.source.replace(/'/g, "\\'")));
});

// A `file:export` row writes into the named export, not the file's own.
test('a catalog row naming a second export stages into that export', async (context) => {
  const fixture = createFixture();
  context.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }));
  const result = await importHandoff({
    apply: false,
    localesDir: fixture.localesDir,
    translatorDir: fixture.translatorDir,
  });
  assert.deepEqual(result.errors, []);

  const row = catalog.find((entry) => entry.exportName !== entry.module);
  assert.ok(row, 'no catalog row names a second export');
  const staged = result.staged.get(path.join(fixture.localesDir, 'en', `${row.module}.ts`));
  const exportBody = staged.slice(staged.indexOf(`export const ${row.exportName} =`));
  assert.ok(exportBody.includes(row.source.replace(/'/g, "\\'")));
});

test('a stored value equal to the English source is offered for translation, not recovered', () => {
  const catalogEntry = require('../../scripts/i18n/handoff-catalog.cjs')[0];
  const id = `${catalogEntry.module}.${catalogEntry.path}`;

  // A key that shipped with an English placeholder in every locale looks
  // exactly like this in src/locales. Recovering it would hand the translator
  // a cell that already reads as done — how such placeholders once survived
  // until someone went looking for them.
  const placeholder = buildEntries('ja', {}, new Map([[id, catalogEntry.source]]));
  assert.equal(placeholder[id].translation, '');

  // A real translation is still recovered.
  const translated = buildEntries('ja', {}, new Map([[id, '翻訳済み']]));
  assert.equal(translated[id].translation, '翻訳済み');

  // And once the translator confirms a language really does use the English
  // wording, the packet carries it and this stops asking.
  const confirmed = buildEntries(
    'ja',
    {
      [id]: {
        source: catalogEntry.source,
        fingerprint: fingerprint(catalogEntry.source),
        translation: catalogEntry.source,
      },
    },
    new Map([[id, catalogEntry.source]]),
  );
  assert.equal(confirmed[id].translation, catalogEntry.source);
});
