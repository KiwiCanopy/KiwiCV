/**
 * `npm run release` runs `npm test` before it bumps the version, and
 * `changelog:sync` only after. An inbox id the sync cannot use (`4.5.0` instead
 * of `v_004_005_000`) failed there, leaving a half-applied release (2026-10-06).
 * The script is read as text: requiring it runs the sync.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../../scripts/sync-changelog.cjs'), 'utf8');

test('every staged changelog update id is an identifier the sync can write', () => {
  const inbox = source.slice(source.indexOf('const CHANGELOG_UPDATES'));
  const ids = [...inbox.matchAll(/^\s*id:\s*['"]([^'"]+)['"]/gm)].map((m) => m[1]);
  for (const id of ids) assert.match(id, /^[A-Za-z_][A-Za-z0-9_]*$/, `inbox id "${id}"`);
});
