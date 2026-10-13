const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { readEntryObject, writeEntryFile } = require('./changelog-file.cjs');

const keysToRemove = process.argv.slice(2);
if (keysToRemove.length === 0) {
  console.log('Usage: node scripts/remove-changelog-key.cjs <key1> <key2>...');
  process.exit(1);
}

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales');
const locales = fs
  .readdirSync(LOCALES_DIR)
  .filter((f) => fs.lstatSync(path.join(LOCALES_DIR, f)).isDirectory());

let totalRemoved = 0;

locales.forEach((locale) => {
  const changelogDir = path.join(LOCALES_DIR, locale, 'changelog');
  if (!fs.existsSync(changelogDir)) return;

  const files = fs.readdirSync(changelogDir).filter((f) => f.startsWith('v_') && f.endsWith('.ts'));

  files.forEach((file) => {
    const filePath = path.join(changelogDir, file);

    const obj = readEntryObject(filePath);
    if (!obj) {
      console.warn(`⚠️ Could not parse ${locale}/changelog/${file}`);
      return;
    }

    let removed = false;
    keysToRemove.forEach((key) => {
      if (key.includes('.')) {
        const parts = key.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current || !current[parts[i]]) return;
          current = current[parts[i]];
        }
        if (current && current[parts[parts.length - 1]]) {
          delete current[parts[parts.length - 1]];
          removed = true;
          totalRemoved++;
        }
      } else {
        if (obj[key]) {
          delete obj[key];
          removed = true;
          totalRemoved++;
        }
      }
    });

    if (removed) {
      // Re-serialized through the shared writer rather than splicing a
      // `JSON.stringify` back into the original text: that spliced in
      // double-quoted keys and relied on a later Prettier pass to make the file
      // match what every other writer produces.
      writeEntryFile(filePath, file.replace(/\.ts$/, ''), obj, locale);
      console.log(`✂️ Updated ${locale}/changelog/${file}`);
    }
  });
});

if (totalRemoved > 0) {
  console.log(`\n✅ Removed ${totalRemoved} keys total.`);
  console.log('💅 Formatting with Prettier...');
  try {
    execSync('npx prettier --write "src/locales/*/changelog/*.ts"');
  } catch (e) {}
} else {
  console.log('\n✨ No keys found to remove.');
}
