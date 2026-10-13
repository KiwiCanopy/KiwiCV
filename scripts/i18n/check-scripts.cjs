const fs = require('fs');
const path = require('path');

const { LOCALES, ROOT_DIR } = require('./config.cjs');
const { flattenExports } = require('./locale-ast.cjs');
const { scriptContaminationBaseline } = require('../../script-contamination-baseline.cjs');

const LOCALES_DIR = path.join(ROOT_DIR, 'src/locales');

/**
 * Writing systems we can attribute to a locale. Latin is deliberately absent:
 * every locale uses it legitimately for `KiwiCV`, `GDPR`, HTML tags and URLs,
 * so its presence proves nothing.
 *
 * Han is shared between `ja` and `zh` and so cannot separate them; kana can,
 * because `zh` has none. That asymmetry is the whole reason the table lists
 * scripts per locale rather than a single "expected script" per locale.
 */
const SCRIPTS = [
  { name: 'Cyrillic', pattern: /[Ѐ-ӿԀ-ԯ]/u, locales: ['ru', 'uk', 'bg'] },
  { name: 'Greek', pattern: /[Ͱ-Ͽ]/u, locales: [] },
  { name: 'Kana', pattern: /[぀-ヿ]/u, locales: ['ja'] },
  { name: 'Han', pattern: /[一-鿿]/u, locales: ['ja', 'zh'] },
  { name: 'Hangul', pattern: /[가-힯]/u, locales: [] },
  { name: 'Arabic', pattern: /[؀-ۿ]/u, locales: [] },
  { name: 'Hebrew', pattern: /[֐-׿]/u, locales: [] },
];

/**
 * The writing systems in `value` that `locale` does not use.
 *
 * Kept separate from the corpus walk so the rule can be tested against strings
 * the test controls. Asserting it against `src/locales/` instead would make the
 * guard's own coverage depend on the corpus staying dirty — the assertion would
 * pass only while a bug was live, and fail the moment one was fixed.
 */
function foreignScripts(locale, value) {
  return SCRIPTS.filter(
    (script) => !script.locales.includes(locale) && script.pattern.test(value),
  ).map((script) => script.name);
}

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
}

/**
 * Every locale string carrying a writing system that locale does not use.
 *
 * Machine translation and hand-merges splice fragments of the wrong language
 * into an otherwise correct string — `KiwiCV solo может acceder`, `pozostaлych
 * dni`. The result is grammatically broken text that renders live, and no
 * existing check sees it: `checkLocales` compares key *structure* and never
 * reads a translated value, and a human reviewer skims a language they do not
 * read.
 */
function findScriptContamination() {
  const findings = [];

  for (const locale of LOCALES) {
    const localeDir = path.join(LOCALES_DIR, locale);
    if (!fs.existsSync(localeDir)) continue;

    for (const filePath of walkFiles(localeDir)) {
      if (!filePath.endsWith('.ts')) continue;

      const entries = flattenExports(filePath, fs.readFileSync(filePath, 'utf8'));
      for (const [key, entry] of entries) {
        // `flattenExports` yields `{ kind, value }`, and only `kind: 'string'`
        // carries translated copy — object nodes have no `value` at all.
        if (!entry || entry.kind !== 'string') continue;
        const value = entry.value;

        const foreign = foreignScripts(locale, value);

        if (foreign.length) {
          findings.push({
            file: path.relative(ROOT_DIR, filePath),
            locale,
            key,
            scripts: foreign,
            value,
          });
        }
      }
    }
  }

  return findings;
}

// Matched on file and key, not line number: a string that moves within its file
// is the same decision, and pinning lines would turn every unrelated edit into
// a baseline update. Mirrors `bare-literal-baseline.js`.
const baselineKey = (entry) => `${entry.file} ${entry.key}`;

function checkScripts() {
  const findings = findScriptContamination();
  const baselined = new Set(scriptContaminationBaseline.map(baselineKey));

  const errors = findings
    .filter((finding) => !baselined.has(baselineKey(finding)))
    .map(
      (finding) =>
        `${finding.file} :: ${finding.key} contains ${finding.scripts.join(' + ')} characters, ` +
        `which ${finding.locale} does not use — "${finding.value.slice(0, 80)}"`,
    );

  // A stale exemption is an error too. The list only shrinks, for the same
  // reason the bare-literal baseline does: a list nobody prunes stops
  // describing the repository and starts excusing it.
  const present = new Set(findings.map(baselineKey));
  for (const entry of scriptContaminationBaseline) {
    if (!present.has(baselineKey(entry))) {
      errors.push(
        `${entry.file} :: ${entry.key} is baselined for script contamination but is now clean — ` +
          `delete the entry from script-contamination-baseline.cjs`,
      );
    }
  }

  return errors;
}

module.exports = { checkScripts, findScriptContamination, foreignScripts };
