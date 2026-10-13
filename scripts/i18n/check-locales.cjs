const fs = require('node:fs');
const path = require('node:path');

const { LOCALES, ROOT_DIR } = require('./config.cjs');
const { flattenExports } = require('./locale-ast.cjs');
const { extractPlaceholders, sameStringSet, validateRichText } = require('./text-validation.cjs');

const LOCALES_DIR = path.join(ROOT_DIR, 'src/locales');

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkFiles(fullPath);
    return entry.name.endsWith('.ts') ? [fullPath] : [];
  });
}

function relativeModuleFiles(locale) {
  const localeDir = path.join(LOCALES_DIR, locale);
  return walkFiles(localeDir)
    .map((file) => path.relative(localeDir, file))
    .filter((file) => file !== 'index.ts')
    .sort();
}

/**
 * Every English key a `t()` call may legitimately reference, flattened.
 *
 * Beside `relativeModuleFiles` because it is the same layer — reading the
 * locale tree — and because it is that function's only other caller. The
 * changelog remapping is the one place the flattened key and the runtime key
 * differ: `changelog/meta.ts` exports under `meta.*` but is read as
 * `changelog.*`, each `changelog/v_*.ts` is read under
 * `changelog.entries.<id>.*`, and the two barrels re-export what the modules
 * already contributed.
 */
function englishKeys() {
  const localeDir = path.join(LOCALES_DIR, 'en');
  const keys = new Set();
  for (const relativeFile of relativeModuleFiles('en')) {
    const filePath = path.join(localeDir, relativeFile);
    for (const [key, entry] of flattenExports(filePath, fs.readFileSync(filePath, 'utf8'))) {
      if (entry.kind !== 'string') continue;
      if (relativeFile === 'changelog/meta.ts') {
        keys.add(key.replace(/^meta\./, 'changelog.'));
      } else if (/^changelog\/v_[\d_]+\.ts$/.test(relativeFile)) {
        keys.add(`changelog.entries.${key}`);
      } else if (relativeFile !== 'changelog.ts' && relativeFile !== 'changelog/index.ts') {
        keys.add(key);
      }
    }
  }
  return keys;
}

function compareFileSets(errors) {
  const expected = relativeModuleFiles('en');
  for (const locale of LOCALES) {
    const actual = relativeModuleFiles(locale);
    for (const missing of expected.filter((file) => !actual.includes(file))) {
      errors.push(`${locale}: missing module file ${missing}`);
    }
    for (const extra of actual.filter((file) => !expected.includes(file))) {
      errors.push(`${locale}: unexpected module file ${extra}`);
    }
  }
  return expected;
}

function compareModule(locale, relativeFile, englishEntries, errors) {
  const filePath = path.join(LOCALES_DIR, locale, relativeFile);
  if (!fs.existsSync(filePath)) return;
  const entries = flattenExports(filePath, fs.readFileSync(filePath, 'utf8'));

  for (const [key, english] of englishEntries) {
    const candidate = entries.get(key);
    if (!candidate) {
      errors.push(`${locale}/${relativeFile}: missing ${key}`);
      continue;
    }
    if (candidate.kind !== english.kind) {
      errors.push(
        `${locale}/${relativeFile}: ${key} is ${candidate.kind}; expected ${english.kind}`,
      );
      continue;
    }
    if (candidate.kind !== 'string') continue;

    const placeholders = extractPlaceholders(candidate.value);
    const expectedPlaceholders = extractPlaceholders(english.value);
    if (!sameStringSet(placeholders, expectedPlaceholders)) {
      errors.push(
        `${locale}/${relativeFile}: ${key} placeholders [${placeholders}] do not match English [${expectedPlaceholders}]`,
      );
    }
    for (const richTextError of validateRichText(candidate.value)) {
      errors.push(`${locale}/${relativeFile}: ${key} ${richTextError}`);
    }
  }

  for (const key of entries.keys()) {
    if (!englishEntries.has(key)) errors.push(`${locale}/${relativeFile}: unexpected ${key}`);
  }
}

function validatePluralPairs(relativeFile, entries, errors) {
  for (const [key, entry] of entries) {
    if (entry.kind !== 'string') continue;
    if (key.endsWith('_one') && !entries.has(key.replace(/_one$/, '_other'))) {
      errors.push(`en/${relativeFile}: ${key} is missing its _other pair`);
    }
    if (key.endsWith('_other') && !entries.has(key.replace(/_other$/, '_one'))) {
      errors.push(`en/${relativeFile}: ${key} is missing its _one pair`);
    }
  }
}

function validateLocaleRegistry(errors) {
  const actualFolders = fs
    .readdirSync(LOCALES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const expected = [...LOCALES].sort();
  if (!sameStringSet(actualFolders, expected)) {
    errors.push(`locale folders [${actualFolders}] do not match registry [${expected}]`);
  }

  const registrySource = fs.readFileSync(path.join(LOCALES_DIR, 'index.ts'), 'utf8');
  const importedLocales = [
    ...new Set(
      [...registrySource.matchAll(/@\/locales\/([a-z]{2})\/index/g)].map((match) => match[1]),
    ),
  ].sort();
  if (!sameStringSet(importedLocales, expected)) {
    errors.push(`src/locales/index.ts imports [${importedLocales}] instead of [${expected}]`);
  }
}

function checkLocales() {
  const errors = [];
  validateLocaleRegistry(errors);
  const files = compareFileSets(errors);

  for (const relativeFile of files) {
    const englishPath = path.join(LOCALES_DIR, 'en', relativeFile);
    const englishEntries = flattenExports(englishPath, fs.readFileSync(englishPath, 'utf8'));
    validatePluralPairs(relativeFile, englishEntries, errors);
    for (const locale of LOCALES.filter((candidate) => candidate !== 'en')) {
      compareModule(locale, relativeFile, englishEntries, errors);
    }
  }

  return errors;
}

module.exports = { checkLocales, englishKeys, relativeModuleFiles };
