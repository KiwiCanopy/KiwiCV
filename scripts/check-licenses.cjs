const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Generating production licenses...');

try {
  // Run license-checker-rseidelsohn to get the JSON output
  const output = execSync(
    'npx license-checker-rseidelsohn --production --json --customPath scripts/license-format.json',
    { maxBuffer: 10 * 1024 * 1024 },
  ).toString();

  // Parse the output
  const licenses = JSON.parse(output);

  // Strip absolute local paths (path and licenseFile) to protect privacy and reduce file size
  for (const pkg in licenses) {
    delete licenses[pkg].path;
    delete licenses[pkg].licenseFile;
  }

  // The AGPL text carries no project copyright line for the checker to extract;
  // README.md § License holds the notice.
  const own = Object.keys(licenses).find((pkg) => pkg.startsWith('kiwicv@'));
  if (own) licenses[own].copyright = 'Copyright (C) 2026 Maikel Hajiabadi';

  // Write to src/assets/licenses.json
  const targetPath = path.join(__dirname, '../src/assets/licenses.json');
  fs.writeFileSync(targetPath, JSON.stringify(licenses, null, 2));

  console.log(
    `✅ Licenses generated successfully at ${targetPath} (absolute local paths stripped).`,
  );
} catch (error) {
  console.error('❌ Error generating licenses:', error);
  process.exit(1);
}
