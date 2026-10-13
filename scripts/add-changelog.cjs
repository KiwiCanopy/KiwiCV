#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ENTRY_ID_PATTERN, isValidEntryId, suggestEntryId } = require('./changelog-file.cjs');
const LOCALES = require('./languages.cjs');

const VALID_PREFIXES = ['feat_', 'ui_', 'perf_', 'fix_', 'refactor_', 'chore_', 'docs_', 'other_'];

/**
 * A highlight slug becomes a JavaScript identifier, so it has to be spellable as
 * one. This file emits `id: 'highlight_<slug>'` and `changelog-file.cjs` writes
 * `export const <id> = { … }`, so a hyphen there parses as subtraction:
 * `export const highlight_ai-composer-polish` is a syntax error. The inner
 * locale keys are quoted (`'_highlights.<slug>.badge'`), so only the export name
 * is at risk.
 *
 * It stayed invisible until 4.3.0 because nothing folded staged entries into the
 * release's version file — the broken `highlight_*.ts` was written and then
 * ignored forever. `changelog-fold.cjs` now picks it up, so the next highlight
 * anyone stages reaches `tsc -b`.
 *
 * **Rejected, never normalised.** The slug is embedded verbatim in three locale
 * keys, so silently rewriting it ships keys the author never typed.
 *
 * The rule itself lives in `changelog-file.cjs`, beside the emission that
 * creates the requirement. Rejecting here as well is what puts the error in
 * front of the author who typed the slug rather than whoever cuts the release.
 */
const isValidHighlightKey = (key) => isValidEntryId(key);

function helpText() {
  return `
🥝 KiwiCV Changelog Entry CLI (npm run changelog:add)

USAGE:
  1. Standard Entry (Positional):
     npm run changelog:add -- <key> "<English text>"
     Example:
       npm run changelog:add -- ui_ai_composer_auto_hide "The composer field automatically collapses during optimization."

  2. Standard Entry (Flags):
     npm run changelog:add -- --key <key> --text "<English text>"

  3. Highlight Entry (Major Release Feature):
     npm run changelog:add -- highlight <slug_key> "<Badge>" "<Title>" "<English content text>"
     Example:
       npm run changelog:add -- highlight ai_composer_polish "AI 🤖" "Smoother AI Workflow" "Improving with AI is now smoother..."

  4. Highlight Entry (Flags):
     npm run changelog:add -- --highlight --key <slug> --badge "<Badge>" --title "<Title>" --text "<Content>"

  5. Batch Multi-Entry:
     npm run changelog:add -- \\
       ui_ai_composer_auto_hide "The composer field automatically collapses..." \\
       fix_ai_badges "Proposal badges sync directly to items..." \\
       highlight ai_composer_polish "AI 🤖" "Smoother AI" "Improving with AI..."

ALLOWED KEY PREFIXES:
  ${VALID_PREFIXES.join(', ')}

HIGHLIGHT SLUG FORMAT:
  ${ENTRY_ID_PATTERN} — letters, digits and "_", never starting with a digit.
  The slug becomes the identifier "highlight_<slug>" in the generated locale
  file, so a hyphen would not compile. Use ai_composer_polish, not
  ai-composer-polish.

BEHAVIOR:
  - Stages the English text across all 15 locale files via stageEnglish().
  - Validates prefix and key format.
  - Automatically runs i18n:sort to keep locale files sorted.
`;
}

function printHelp() {
  console.log(helpText());
}

function parseArgs(args) {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const entries = [];
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    if (arg === '--highlight' || arg === 'highlight') {
      // Highlight entry
      let key, badge, title, text;
      if (arg === '--highlight') {
        i++;
        while (i < args.length && args[i].startsWith('--')) {
          const flag = args[i];
          const val = args[i + 1];
          if (flag === '--key') key = val;
          else if (flag === '--badge') badge = val;
          else if (flag === '--title') title = val;
          else if (flag === '--text') text = val;
          i += 2;
        }
      } else {
        // Positional: highlight <slug> <badge> <title> <text>
        key = args[i + 1];
        badge = args[i + 2];
        title = args[i + 3];
        text = args[i + 4];
        i += 5;
      }

      if (!key || !badge || !title || !text) {
        console.error('❌ Error: Invalid highlight arguments.');
        console.error('   Expected: highlight <slug_key> "<badge>" "<title>" "<content_text>"');
        process.exit(1);
      }

      entries.push({
        type: 'highlight',
        key: key.replace(/^_highlights\./, '').replace(/^_highlights/, ''),
        badge,
        title,
        text,
      });
    } else if (arg.startsWith('--key')) {
      // Flag-based normal entry
      let key, text;
      while (i < args.length && args[i].startsWith('--')) {
        const flag = args[i];
        const val = args[i + 1];
        if (flag === '--key') key = val;
        else if (flag === '--text') text = val;
        i += 2;
      }

      if (!key || !text) {
        console.error('❌ Error: Missing --key or --text flag.');
        process.exit(1);
      }

      entries.push({ type: 'normal', key, text });
    } else {
      // Positional normal entry: <key> <text>
      const key = args[i];
      const text = args[i + 1];

      if (!key || !text) {
        console.error(`❌ Error: Expected text for key "${key}".`);
        console.error('   Usage: npm run changelog:add -- <key> "<text>"');
        process.exit(1);
      }

      entries.push({ type: 'normal', key, text });
      i += 2;
    }
  }

  return entries;
}

function validateKey(key) {
  const isValid = VALID_PREFIXES.some((prefix) => key.startsWith(prefix));
  if (!isValid) {
    console.error(
      `❌ Error: Invalid key "${key}". Key must start with one of: ${VALID_PREFIXES.join(', ')}`,
    );
    process.exit(1);
  }
}

function validateHighlightKey(key) {
  if (!isValidHighlightKey(key)) {
    console.error(
      `❌ Error: Invalid highlight slug "${key}". A slug becomes the identifier ` +
        `"highlight_${key}" in the generated locale file, so it must match ` +
        `${ENTRY_ID_PATTERN} — letters, digits and "_", never starting with a digit. ` +
        `Use "${suggestEntryId(key)}" instead.`,
    );
    process.exit(1);
  }
}

/**
 * Builds the `CHANGELOG_UPDATES` entry literal spliced into `sync-changelog.cjs`.
 * Extracted so the emitted `id:` — the string that becomes an `export const`
 * name one script later — is reachable from a test.
 */
function buildUpdateLiteral(entry) {
  const q = (value) => String(value).replace(/'/g, "\\'");

  if (entry.type === 'normal') {
    return `  {\n    id: '${entry.key}',\n    translations: {\n      ${entry.key}: stageEnglish('${q(entry.text)}'),\n    },\n  }`;
  }

  return `  {\n    id: 'highlight_${entry.key}',\n    translations: {\n      '_highlights.${entry.key}.badge': stageEnglish('${q(entry.badge)}'),\n      '_highlights.${entry.key}.title': stageEnglish('${q(entry.title)}'),\n      '_highlights.${entry.key}.content': stageEnglish('${q(entry.text)}'),\n    },\n  }`;
}

function stageEnglish(text) {
  return Object.fromEntries(LOCALES.map((locale) => [locale, text]));
}

function main() {
  const args = process.argv.slice(2);
  const parsedEntries = parseArgs(args);

  if (parsedEntries.length === 0) {
    printHelp();
    process.exit(0);
  }

  // Validate all entries first
  parsedEntries.forEach((entry) => {
    if (entry.type === 'normal') {
      validateKey(entry.key);
    } else {
      validateHighlightKey(entry.key);
    }
  });

  // Prepare updates to append to scripts/sync-changelog.cjs
  const changelogUpdatesFile = path.join(__dirname, 'sync-changelog.cjs');
  let content = fs.readFileSync(changelogUpdatesFile, 'utf8');

  // Build the updates object
  const updatesArray = parsedEntries.map(buildUpdateLiteral);

  const updatesCode = `const CHANGELOG_UPDATES = [\n${updatesArray.join(',\n')}\n];`;
  content = content.replace(/const CHANGELOG_UPDATES = \[\s*\];/g, updatesCode);

  fs.writeFileSync(changelogUpdatesFile, content, 'utf8');
  console.log(
    `✅ Staged ${parsedEntries.length} changelog entry/entries in scripts/sync-changelog.cjs`,
  );

  // Run changelog sync to populate across locales
  console.log('🔄 Running npm run changelog:sync to distribute entries across 15 locales...');
  execSync('npm run changelog:sync', { stdio: 'inherit' });

  // Run i18n sort
  console.log('💅 Running npm run i18n:sort to keep locale files sorted...');
  execSync('npm run i18n:sort', { stdio: 'inherit' });

  console.log('\n🎉 Done! All 15 locale changelog files updated and sorted.');
}

if (require.main === module) {
  main();
}

module.exports = {
  buildUpdateLiteral,
  helpText,
  isValidHighlightKey,
};
