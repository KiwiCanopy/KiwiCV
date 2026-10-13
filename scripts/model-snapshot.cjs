#!/usr/bin/env node

/**
 * model-snapshot.cjs
 *
 * Automates the creation of a new versioned example resume file.
 * Usage: npm run model:snapshot
 */

const fs = require('fs');
const path = require('path');

const EXAMPLES_DIR = path.join(__dirname, '..', 'examples');
const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

// --- Helper: Read package configuration ------------------
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
const currentAppVersion = packageJson.version;
const newSnapshotFilename = `resume_${currentAppVersion.replace(/\./g, '_')}.json`;
const newSnapshotPath = path.join(EXAMPLES_DIR, newSnapshotFilename);

// --- Find latest existing snapshot -----------------------
const files = fs
  .readdirSync(EXAMPLES_DIR)
  .filter((f) => f.startsWith('resume_') && f.endsWith('.json'))
  .sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));

const latestSnapshotFile = files[0];

if (!latestSnapshotFile) {
  console.error('\n❌ No existing versioned snapshots found in /examples.\n');
  process.exit(1);
}

const latestSnapshotPath = path.join(EXAMPLES_DIR, latestSnapshotFile);
console.log(`\n📄 Latest snapshot found: ${latestSnapshotFile}`);

// --- Create new snapshot ----------------------------------
if (fs.existsSync(newSnapshotPath)) {
  console.warn(`⚠️  Snapshot ${newSnapshotFilename} already exists. Overwriting.\n`);
}

try {
  const data = JSON.parse(fs.readFileSync(latestSnapshotPath, 'utf8'));

  // --- Sanitization & Migration ---------------------------
  if (data.meta) {
    console.log('🧹 Sanitizing meta structure...');

    // 1. Core Metadata
    data.meta.version = currentAppVersion;
    delete data.meta.lastModified;
    delete data.meta.ui;

    // 2. Export Config Cleanup
    if (data.meta.export?.config) {
      delete data.meta.export.config.clean;
      data.meta.export.config.updateBackupOnCloudExport = true;
    }

    // 3. Layout Structure Migration
    if (data.meta.content) {
      if (!data.meta.content.order) {
        data.meta.content.order = {
          oneColumn: data.meta.content.sectionOrder || [],
          twoColumn: { main: [], sidebar: [] },
        };
      }
      delete data.meta.content.sectionOrder;
    }
  }

  // Prettify and write
  fs.writeFileSync(newSnapshotPath, JSON.stringify(data, null, 2) + '\n');
  console.log(`✅ Success! Created new snapshot: ${newSnapshotFilename}`);
  console.log(`📍 Location: ${newSnapshotPath}\n`);
} catch (err) {
  console.error(`\n❌ Error creating snapshot: ${err.message}\n`);
  process.exit(1);
}
