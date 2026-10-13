const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Optimizes the 'update:minor' command.
 * Only runs 'npm install' and 'npm run check-licenses' if minor updates were actually applied to package.json.
 */

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

try {
  const args = process.argv.slice(2);
  const skipLicenses = args.includes('--no-update-licenses');

  console.log('🔍 Checking for minor updates...');

  // 1. Read current package.json content
  const oldContent = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');

  // 2. Run npx npm-check-updates
  // We use inherit for stdio to show the ncu output to the user.
  //
  // ⚠️ `--yes` is load-bearing. `npm-check-updates` is not a devDependency, so
  // npx has to fetch it, and without this it stops on `Ok to proceed? (y)`.
  // Inside `npm run release -- --update-deps` that prompt is invisible: the
  // release script's own output has already scrolled past, so the run reads as
  // "hung after the dependency check" rather than "waiting for a keystroke".
  // It hung exactly that way on 2026-08-09, and the second attempt only got
  // through because the first had warmed the npx cache.
  execSync('npx --yes npm-check-updates -u --target minor', { stdio: 'inherit' });

  // 3. Read updated package.json content
  const newContent = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');

  // 4. Compare
  if (oldContent !== newContent) {
    console.log('\n📦 Updates detected. Running npm install and license check...');

    console.log('  - Running npm install...');
    execSync('npm install', { stdio: 'inherit' });

    if (!skipLicenses) {
      console.log('  - Checking licenses...');
      execSync('npm run check-licenses', { stdio: 'inherit' });
    } else {
      console.log('  - Skipping license check (--no-update-licenses)...');
    }

    console.log('\n✅ Dependencies updated and licenses verified!');
  } else {
    console.log('\n✨ No minor updates found. Skipping npm install.');
  }
} catch (error) {
  console.error('\n❌ Update check failed:', error.message);
  process.exit(1);
}
