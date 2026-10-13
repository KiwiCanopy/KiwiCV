const fs = require('fs');
const path = require('path');

const FRONTEND_PATH = path.resolve(__dirname, '../src/constants/ai.ts');
const BACKEND_PATH = path.resolve(__dirname, '../netlify/functions/lib/ai/constants.js');

function extractConstant(content, name) {
  // Matches "export const NAME = value;" or "export const NAME = { ... };"
  // Handles simple values and objects (non-nested)
  const regex = new RegExp(`export const ${name}\\s*=\\s*([^;]+);`, 's');
  const match = content.match(regex);
  if (!match) return null;

  let value = match[1].trim();
  // Remove "as const" if present
  value = value.replace(/\s*as const\s*$/, '');

  // Try to parse as JSON if it looks like an object
  if (value.startsWith('{')) {
    try {
      // Convert JS object literal to JSON-parseable string
      // This is a simple conversion for the expected structure
      const jsonLike = value
        .replace(/([a-zA-Z0-9_]+):/g, '"$1":') // Quote keys
        .replace(/'/g, '"') // Replace single quotes with double quotes
        .replace(/,\s*}/g, '}'); // Remove trailing commas
      return JSON.stringify(JSON.parse(jsonLike));
    } catch (e) {
      return value;
    }
  }

  return value;
}

const frontendContent = fs.readFileSync(FRONTEND_PATH, 'utf8');
const backendContent = fs.readFileSync(BACKEND_PATH, 'utf8');

const constantsToSync = [
  'AI_PRO_DAILY_LIMIT',
  'AI_MAX_CHAR_LIMIT',
  'AI_LANGUAGE_NAME_MAX_LENGTH',
  'AI_MAX_UPLOAD_BYTES',
  'AI_TRANSLATION_MAX_CHARS',
  'COVER_LETTER_MIN_WORDS',
  'COVER_LETTER_MAX_WORDS',
  'COVER_LETTER_STYLE_MAX',
  'COVER_LETTER_CHARACTER_LANGS',
  'COVER_LETTER_CHARACTER_CLAMP_FACTOR',
  'AI_JOB_STAGE_COVER_LETTER',
  'AI_PAYWALL_CODES',
];

let hasError = false;

console.log('🔍 Checking AI constants synchronization...');

constantsToSync.forEach((name) => {
  const fValue = extractConstant(frontendContent, name);
  const bValue = extractConstant(backendContent, name);

  // `null !== null` is false, so a name that has vanished from *both* files —
  // renamed on both sides, or rewritten into a form the regex cannot read
  // (`= BASE * 2`, a multiline object) — used to report "in sync" while
  // comparing nothing. A listed name that cannot be found is a script error,
  // not a pass: CI and `release.cjs` both trust this output.
  if (fValue === null || bValue === null) {
    console.error(`❌ ${name} could not be read as "export const ${name} = <value>;" in:`);
    if (fValue === null) console.error(`   ${path.relative(process.cwd(), FRONTEND_PATH)}`);
    if (bValue === null) console.error(`   ${path.relative(process.cwd(), BACKEND_PATH)}`);
    console.error('   Either it was renamed and constantsToSync was not updated, or its');
    console.error('   declaration is no longer a form this check can parse.');
    hasError = true;
    return;
  }

  if (fValue !== bValue) {
    console.error(`❌ Mismatch in ${name}:`);
    console.error(`   Frontend: ${fValue}`);
    console.error(`   Backend:  ${bValue}`);
    hasError = true;
  } else {
    console.log(`✅ ${name} is in sync.`);
  }
});

if (hasError) {
  console.error(
    '\n🚨 AI constants are out of sync! Please update src/constants/ai.ts or netlify/functions/lib/ai/constants.js.',
  );
  process.exit(1);
} else {
  console.log('\n✨ All AI constants are synchronized.');
}
