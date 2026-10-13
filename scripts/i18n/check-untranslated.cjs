const fs = require('fs');
const path = require('path');

const { NON_ENGLISH_LOCALES, ROOT_DIR } = require('./config.cjs');
const { flattenExports } = require('./locale-ast.cjs');
const { untranslatedAllowlist } = require('../../untranslated-allowlist.cjs');
const catalog = require('./handoff-catalog.cjs');

const LOCALES_DIR = path.join(ROOT_DIR, 'src/locales');

/**
 * A value that is legitimately the same in every language is short and is a
 * name, a URL or an acronym. Prose is not. The floor keeps `PDF`, `EN` and
 * `KiwiCV` out of the findings without needing an allowlist entry each.
 */
const MIN_LENGTH = 10;

/** A verbatim catalog row is identical everywhere by declaration; the allowlist need not repeat it. */
const VERBATIM_KEYS = new Set(catalog.verbatimKeys);

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
}

function readLocale(locale) {
  const localeDir = path.join(LOCALES_DIR, locale);
  const values = new Map();
  if (!fs.existsSync(localeDir)) return values;

  for (const filePath of walkFiles(localeDir)) {
    if (!filePath.endsWith('.ts')) continue;
    // Changelog entries are staged and translated by `sync-changelog.cjs` on
    // its own release cadence, so English there is the expected resting state
    // between a merge and the pre-release pass.
    if (filePath.includes(`${path.sep}changelog${path.sep}`)) continue;

    for (const [key, entry] of flattenExports(filePath, fs.readFileSync(filePath, 'utf8'))) {
      if (entry && entry.kind === 'string') values.set(key, entry.value);
    }
  }
  return values;
}

/**
 * Every key whose value is still the English source in **every** non-English
 * locale.
 *
 * Nothing else catches this. `checkLocales` compares key structure, not values.
 * `i18n:sync` and the handoff generator both treat "differs from the English
 * source" as "translated", so two separate mistakes land here silently:
 *
 * - a key with no `handoff-catalog.cjs` row is never offered for translation,
 *   and is never reported missing either, because from the tooling's view it
 *   does not exist. This shipped three times during the 4.2.0 redesign —
 *   `cvs.*`, `editor.rail.*`, `preview.fits_pages_*`.
 * - renaming an English value strands the OLD English in fourteen files, where
 *   it looks like a real translation to every gate.
 *
 * Requiring *all* locales to match is deliberate. One locale matching English
 * is often correct — a cognate, or a term that language borrows. Fourteen out
 * of fourteen is a pipeline failure, not a coincidence.
 */
function findUntranslated({ ignoreAllowlist = false } = {}) {
  const english = readLocale('en');
  const others = NON_ENGLISH_LOCALES.map((locale) => [locale, readLocale(locale)]);

  const findings = [];
  for (const [key, source] of english) {
    if (source.length < MIN_LENGTH) continue;
    if (VERBATIM_KEYS.has(key)) continue;
    if (!ignoreAllowlist && untranslatedAllowlist.includes(key)) continue;

    const present = others.filter(([, values]) => values.has(key));
    if (present.length !== others.length) continue;

    const values = present.map(([, byKey]) => byKey.get(key));
    const [first] = values;
    if (!values.every((value) => value === first)) continue;

    // Fourteen unrelated languages agreeing on one string is not translation.
    // Two shapes reach here:
    //
    //   first === source   the key was never translated at all.
    //   first !== source   the English was reworded after the last packet, so
    //                      every locale still holds the PREVIOUS English. This
    //                      is the one that hides: it differs from the current
    //                      source, so anything comparing against the source
    //                      calls it translated. `ai.composer_jd_empty` sat like
    //                      this until the owner read it on screen.
    //
    // The second shape is only meaningful for Latin text — a genuinely shared
    // term would be short and is filtered by MIN_LENGTH or allowlisted.
    if (first !== source && !isAsciiProse(first)) continue;

    findings.push({ key, source, current: first, stale: first !== source });
  }
  return findings;
}

/** ASCII with real words in it — i.e. English, not a shared symbol or code. */
function isAsciiProse(value) {
  return /^[\x00-\x7F]*$/.test(value) && /[A-Za-z]{3}/.test(value);
}

module.exports = { findUntranslated, untranslatedAllowlist };
