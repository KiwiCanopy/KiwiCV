#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const { LOCALES, TRANSLATOR_DIR } = require('./i18n/config.cjs');
const catalog = require('./i18n/handoff-catalog.cjs');
const { catalogId, flattenExports } = require('./i18n/locale-ast.cjs');
const {
  extractPlaceholders,
  fingerprint,
  validateRichText,
} = require('./i18n/text-validation.cjs');

const ROOT_DIR = path.join(__dirname, '..');

/**
 * What `src/locales/<locale>/` currently holds, as a map of `module.path` to
 * value.
 *
 * The packets are a working artifact, not a source of truth: the catalog owns
 * the English and `src/locales/` owns the translations. Before this existed
 * they were load-bearing anyway — deleting the directory and regenerating
 * produced 1,708 empty cells, because the generator's only memory was the
 * previous packet. That made a build-time false positive from Netlify's secret
 * scanner, which matches short env values against the SHA-256 fingerprints in
 * these files, into a re-translate-everything problem.
 *
 * Recovering from `src/locales/` removes that coupling. The packets can now be
 * deleted after any import and regenerated on demand.
 */
function localeValues(locale) {
  const values = new Map();
  const dir = path.join(ROOT_DIR, 'src/locales', locale);
  const modules = new Set(catalog.map((entry) => entry.module));

  for (const moduleName of modules) {
    const filePath = path.join(dir, `${moduleName}.ts`);
    if (!fs.existsSync(filePath)) continue;
    const flattened = flattenExports(filePath, fs.readFileSync(filePath, 'utf8'));
    for (const [key, node] of flattened) {
      // `flattenExports` yields tagged nodes, not raw values — objects and
      // arrays appear alongside strings.
      if (node && node.kind === 'string' && node.value) values.set(key, node.value);
    }
  }
  return values;
}

function buildEntries(locale, existingPacket = {}, stored = new Map()) {
  return Object.fromEntries(
    catalog.map((entry) => {
      const id = catalogId(entry);
      const richTextErrors = validateRichText(entry.source);
      if (richTextErrors.length) {
        throw new Error(`${id}: ${richTextErrors.join('; ')}`);
      }
      const sourceFingerprint = fingerprint(entry.source);
      const existingEntry = existingPacket[id];
      // The packet wins when its English still matches: it is the record of
      // what was translated against which source.
      const fromPacket =
        locale !== 'en' &&
        existingEntry?.source === entry.source &&
        existingEntry?.fingerprint === sourceFingerprint
          ? existingEntry.translation
          : '';
      // Otherwise fall back to what the app is actually rendering today.
      //
      // Caveat, deliberately not hidden: if the catalog's English changed after
      // the last `--apply`, the stored value is a translation of the *previous*
      // source. The packet shows the current `source` beside it, so a review
      // catches it — but regenerate straight after any catalog edit and the
      // window does not open.
      const storedValue = locale !== 'en' ? stored.get(id) || '' : '';
      // A stored value identical to the English source is not evidence of a
      // translation — it is what a key looks like when it shipped with an
      // English placeholder in every locale, which has happened and had to be
      // cleaned up a day later. Recovering it would hand
      // the translator a cell that already looks done, so the placeholder
      // would survive every future packet.
      //
      // A translator whose language really does use the English word
      // (`Design`, `Import`) types it once; from then on `fromPacket` matches
      // and this never asks again.
      const fromLocales = storedValue === entry.source ? '' : storedValue;
      // A verbatim row's English is its translation. A stored value that
      // differs is kept, so the importer rejects it rather than this hiding it.
      const preservedTranslation = entry.verbatim
        ? fromPacket || storedValue || entry.source
        : fromPacket || fromLocales;

      return [
        id,
        {
          module: entry.module,
          path: entry.path,
          source: entry.source,
          translation: locale === 'en' ? entry.source : preservedTranslation,
          context: entry.context,
          placeholders: extractPlaceholders(entry.source),
          protectedTokens: entry.protectedTokens,
          kind: entry.source.includes('<') ? 'rich' : 'plain',
          fingerprint: sourceFingerprint,
        },
      ];
    }),
  );
}

function buildReadme() {
  return `# KiwiCV Step 2 translation handoff

The English source in \`en.json\` is approved and must not be translated or edited.
All 14 non-English translations are written into these files (owner ruling, 2026-09-07); derive each
from strings the locale already ships rather than composing from scratch. Machine-generated text is
never final: a value with no shipped sibling to anchor it is an escalation, not a guess.
Regeneration preserves completed translations whose English source is unchanged and leaves
only new or changed entries blank.

For each non-English JSON file:

1. Edit only each entry's \`translation\` value.
2. Keep entry IDs, \`module\`, \`path\`, \`source\`, \`context\`, \`placeholders\`,
   \`protectedTokens\`, \`kind\`, and \`fingerprint\` unchanged.
3. Preserve every placeholder exactly, including braces and spelling.
4. Preserve every protected token with the exact capitalization shown.
5. For \`rich\` entries, retain the required tags and keep them balanced.
6. Do not leave a translation empty or copy the English source as a placeholder.
7. Save UTF-8 JSON in place, at the generated path.

## Edit these files directly

Whoever translates writes into this directory in the working tree. Do not paste
translations into a chat session for someone else to transcribe: retyping is
where curly quotes, lost \`\\n\` escapes, and dropped placeholders come from, and
the importer's validation is built around reading these files, not a message.

Say when the packet is complete and let the importer read it.

The importer validates all 15 files together. If any entry fails, it reports every
actionable error and changes no file under \`src/locales/\`.

Validate a completed packet without writing locale sources:

\`npm run i18n:handoff:import -- --check\`

Apply a fully valid packet atomically:

\`npm run i18n:handoff:import -- --apply\`
`;
}

function serializePacket(packet) {
  const lines = ['{'];
  const entries = Object.entries(packet);
  entries.forEach(([id, entry], index) => {
    lines.push(`  ${JSON.stringify(id)}: {`);
    lines.push(
      `    "module": ${JSON.stringify(entry.module)}, "path": ${JSON.stringify(
        entry.path,
      )}, "source": ${JSON.stringify(entry.source)},`,
    );
    lines.push(`    "translation": ${JSON.stringify(entry.translation)},`);
    lines.push(
      `    "context": ${JSON.stringify(entry.context)}, "placeholders": ${JSON.stringify(
        entry.placeholders,
      )}, "protectedTokens": ${JSON.stringify(entry.protectedTokens)}, "kind": ${JSON.stringify(
        entry.kind,
      )}, "fingerprint": ${JSON.stringify(entry.fingerprint)}`,
    );
    lines.push(`  }${index === entries.length - 1 ? '' : ','}`);
  });
  lines.push('}');
  return `${lines.join('\n')}\n`;
}

function generate() {
  let recovered = 0;
  let blank = 0;
  fs.mkdirSync(TRANSLATOR_DIR, { recursive: true });
  for (const locale of LOCALES) {
    const filePath = path.join(TRANSLATOR_DIR, `${locale}.json`);
    let existingPacket = {};
    if (fs.existsSync(filePath)) {
      try {
        existingPacket = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch {
        existingPacket = {};
      }
    }
    const entries = buildEntries(locale, existingPacket, localeValues(locale));
    if (locale !== 'en') {
      recovered += Object.entries(entries).filter(
        ([id, entry]) => entry.translation && !existingPacket[id]?.translation,
      ).length;
      blank += Object.values(entries).filter((entry) => !entry.translation).length;
    }
    fs.writeFileSync(filePath, serializePacket(entries), 'utf8');
  }
  fs.writeFileSync(path.join(TRANSLATOR_DIR, 'README.md'), buildReadme(), 'utf8');
  console.log(`Generated ${LOCALES.length} locale packets and README in ${TRANSLATOR_DIR}`);
  if (recovered) {
    console.log(`Recovered ${recovered} translation(s) from src/locales/.`);
  }
  // Say the number out loud. A packet whose blank count is zero needs no
  // translator at all, and one with blanks is the whole reason to open it.
  console.log(`${blank} cell(s) await translation.`);
}

if (require.main === module) {
  generate();
}

module.exports = { buildEntries, localeValues };
