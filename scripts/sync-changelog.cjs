const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { readEntryKeys, readEntryObject, writeEntryFile } = require('./changelog-file.cjs');
const { regenerateChangelogIndexes } = require('./changelog-index.cjs');

/**
 * Inbox for changelog entries to apply across all 15 locales.
 * `translations` is keyed by language code (en, de, fr, es, it, pt, nl, pl, ru,
 * zh, ja, bg, tr, sv, uk); every key needs all fifteen or the sync refuses.
 *
 * This array is **emptied automatically** once its contents are written — see
 * `clearAppliedUpdates()`. An empty array is the resting state, so what you see
 * here is always work that has not been applied yet. Do not restore entries
 * after a sync to "keep a record": the locale files are the record, and a stale
 * copy here silently wins the next time anything runs a sync, including
 * `release.cjs`.
 */
const LOCALES = require('./languages.cjs');

/**
 * Stages one English string into all 15 locales. English is authored here; the
 * other 14 stay English placeholders until the single pre-release translation pass
 * translates the accumulated entries (AGENTS.md §6, ops/CHANGELOG.md). The
 * generator blanks a cell whose stored value equals the English source, so the
 * placeholders reopen as translation work automatically.
 */
const stageEnglish = (english) => Object.fromEntries(LOCALES.map((locale) => [locale, english]));

const CHANGELOG_UPDATES = [];

const BASE_PATH = path.join(__dirname, '..', 'src', 'locales');
const EN_CHANGELOG_PATH = path.join(BASE_PATH, 'en', 'changelog');

/**
 * Validates that all updates have the required 15 locales for every translation key.
 */
function validateUpdates() {
  if (CHANGELOG_UPDATES.length === 0) return true;

  console.log('🔍 Validating translation coverage and keys...');
  let hasError = false;
  for (const update of CHANGELOG_UPDATES) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(update.id)) {
      console.error(
        `❌ Error: update id "${update.id}" must be an identifier: a version file id like v_004_005_000, or a staged entry slug.`,
      );
      hasError = true;
    }
  }
  const VALID_PREFIXES = [
    'feat_',
    'ui_',
    'perf_',
    'fix_',
    'refactor_',
    'chore_',
    'docs_',
    'other_',
  ];

  CHANGELOG_UPDATES.forEach((update) => {
    Object.entries(update.translations).forEach(([key, localesMap]) => {
      // 1. Check if the key has a valid prefix or is '_highlights'
      if (key !== '_highlights' && !key.startsWith('_highlights.')) {
        const isValid = VALID_PREFIXES.some((prefix) => key.startsWith(prefix));
        if (!isValid) {
          console.error(
            `❌ Error: [${update.id}] Invalid key "${key}". Keys must start with one of: ${VALID_PREFIXES.join(
              ', ',
            )} (or be '_highlights')`,
          );
          hasError = true;
        }
      }

      // 2. Check for missing locales
      const missingLocales = LOCALES.filter((l) => !localesMap[l]);
      if (missingLocales.length > 0) {
        console.error(
          `❌ Error: [${update.id}] Key "${key}" is missing locales: [${missingLocales.join(', ')}]`,
        );
        hasError = true;
      }
    });
  });

  if (hasError) {
    console.error('\n🛑 Sync aborted due to validation errors.');
    process.exit(1);
  }

  console.log('✅ All provided updates are valid and have full language coverage.');
  return true;
}

function sync() {
  console.log('🚀 Starting Unified Changelog Sync...');

  // 1. Validate updates
  validateUpdates();

  if (!fs.existsSync(EN_CHANGELOG_PATH)) {
    console.error('❌ English changelog directory not found.');
    return;
  }

  // 2. Process scripted updates
  CHANGELOG_UPDATES.forEach((update) => {
    console.log(`📦 Applying structured update for ${update.id}...`);

    LOCALES.forEach((locale) => {
      const targetDir = path.join(BASE_PATH, locale, 'changelog');
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

      const targetFile = path.join(targetDir, `${update.id}.ts`);
      let obj = {};

      if (fs.existsSync(targetFile)) {
        // Merging into an unreadable file would write only this update's keys
        // and drop everything already in it, so refuse rather than warn and
        // carry on with an empty base.
        obj = readEntryObject(targetFile);
        if (!obj) {
          throw new Error(
            `Cannot read ${targetFile}. Refusing to merge into it — a merge that cannot read ` +
              'its base would overwrite it. Fix the file by hand, then re-run.',
          );
        }
      }

      // Merge new translations
      Object.entries(update.translations).forEach(([key, localesMap]) => {
        if (key.includes('.')) {
          const parts = key.split('.');
          let current = obj;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]];
          }
          current[parts[parts.length - 1]] = localesMap[locale];

          // Cleanup any mistakenly created top-level key from previous runs
          if (obj[key]) {
            delete obj[key];
          }
        } else {
          obj[key] = localesMap[locale];
        }
      });

      writeEntryFile(targetFile, update.id, obj, locale);
    });
  });

  // 3. Structural Sync (Pull from EN for any manual edits)
  const enFiles = fs
    .readdirSync(EN_CHANGELOG_PATH)
    .filter((f) => f.startsWith('v_') && f.endsWith('.ts'));

  enFiles.forEach((enFile) => {
    const versionName = enFile.replace('.ts', '');
    const enPath = path.join(EN_CHANGELOG_PATH, enFile);
    const enKeys = readEntryKeys(enPath);
    if (!enKeys) {
      throw new Error(
        `Cannot read ${enPath}. Refusing to sync from it — an unreadable English file would ` +
          'look like a file with no keys and propagate nothing. Fix it by hand, then re-run.',
      );
    }

    LOCALES.filter((l) => l !== 'en').forEach((locale) => {
      const targetDir = path.join(BASE_PATH, locale, 'changelog');
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

      const targetFile = path.join(targetDir, enFile);
      const exists = fs.existsSync(targetFile);

      // Read once, and refuse on failure. Previously an unreadable target read
      // as "no keys", so every English key looked missing — and the rewrite
      // that followed `eval`ed the same file again with no `try`, so the run
      // either crashed or wrote a file holding nothing but empty strings.
      let obj = {};
      if (exists) {
        obj = readEntryObject(targetFile);
        if (!obj) {
          throw new Error(
            `Cannot read ${targetFile}. Refusing to sync into it — every key would look ` +
              'missing and the rewrite would empty the file. Fix it by hand, then re-run.',
          );
        }
      }

      const missingKeys = enKeys.filter((k) => !Object.keys(obj).includes(k));
      if (missingKeys.length === 0 && exists) return;

      console.log(
        `✨ Structural Sync for ${versionName} to [${locale}] - Adding keys: ${missingKeys.join(', ') || 'ALL'}`,
      );
      missingKeys.forEach((k) => {
        k = k.trim();
        if (k) obj[k] = '';
      });

      writeEntryFile(targetFile, versionName, obj, locale);
    });
  });

  // 4. Update Index Files
  //
  // Shared with `changelog-deps.cjs`, which also creates version files. Two
  // copies of this would let one writer forget the step and leave a version
  // file no index imports.
  regenerateChangelogIndexes(BASE_PATH, LOCALES);

  console.log('\n💅 Running Prettier...');
  try {
    execSync(
      'npx prettier --config .prettierrc --write "src/locales/*/changelog/*.ts" "src/data/changelog.ts"',
      { stdio: 'ignore' },
    );
  } catch (e) {
    console.warn('  ⚠️ Prettier failed, but files were written.');
  }

  if (CHANGELOG_UPDATES.length > 0) {
    clearAppliedUpdates();
  }

  console.log('✅ Unified Changelog Sync Complete!');
}

/**
 * Empties `CHANGELOG_UPDATES` in this file once its contents have been written.
 *
 * The array is an inbox, not a record. Its contents live in
 * `src/locales/*&#47;changelog/*.ts` the moment this script succeeds, and leaving a
 * copy behind creates a stale second source that silently wins the next time
 * anything runs a sync.
 *
 * That is not hypothetical. During the 4.0.1 release, three reviewed German
 * corrections were made directly in the locale files while this array still
 * held the pre-review text. `release.cjs` runs `changelog:sync` as one of its
 * steps, so the release quietly reverted all three and tagged the result. It
 * was caught only because German showed eight changed lines in the release
 * commit where every other locale showed two.
 *
 * The old rule was "clear before adding", which depended on the next person
 * remembering. Clearing here makes an empty array the resting state, so the
 * failure cannot recur.
 */
function clearAppliedUpdates() {
  const selfPath = __filename;
  const source = fs.readFileSync(selfPath, 'utf8');

  // Bracket-counted rather than regex-matched. A regex has to guess where the
  // array ends: anchoring to `\n];` misses a one-line array, and stopping at
  // the first `];` breaks on a nested one. Both failure modes are silent, and a
  // silent miss here is the bug this function exists to prevent.
  const decl = 'const CHANGELOG_UPDATES = ';
  const start = source.indexOf(decl);
  const open = start === -1 ? -1 : source.indexOf('[', start + decl.length);

  if (open === -1) {
    console.warn(
      '  ⚠️ Could not locate CHANGELOG_UPDATES to clear it. Empty it by hand — ' +
        'a stale array overwrites later edits on the next sync.',
    );
    return;
  }

  let depth = 0;
  let end = -1;
  for (let i = open; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end === -1) {
    console.warn('  ⚠️ CHANGELOG_UPDATES looks unbalanced; leaving it alone.');
    return;
  }

  fs.writeFileSync(selfPath, `${source.slice(0, open)}[]${source.slice(end + 1)}`);

  try {
    execSync(`npx prettier --config .prettierrc --write "${selfPath}"`, { stdio: 'ignore' });
  } catch {
    // Formatting only; the array is already empty.
  }

  console.log('🧹 Cleared CHANGELOG_UPDATES — the entries now live in src/locales/*/changelog/.');
}

sync();
