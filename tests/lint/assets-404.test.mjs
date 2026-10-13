/**
 * A missing hashed chunk must 404, not fall through to the SPA shell as a
 * `200 text/html` that `_headers` then marks immutable. Netlify applies
 * the first matching rule, so the `/assets/*` rule has to precede `/*`.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const toml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');

// One parsed block per `[[redirects]]`, comment lines dropped.
const blocks = toml
  .split(/^\[\[redirects\]\]\s*$/m)
  .slice(1)
  .map((block) => {
    const body = block.split(/^\[/m)[0];
    const fields = {};
    for (const line of body.split('\n')) {
      const match = line.match(/^\s*(\w+)\s*=\s*(.+?)\s*$/);
      if (match) fields[match[1]] = match[2].replace(/^"|"$/g, '');
    }
    return fields;
  });

const assetsIndex = blocks.findIndex((block) => block.from === '/assets/*');
const catchAllIndex = blocks.findIndex((block) => block.from === '/*');

test('missing /assets/* files answer 404', () => {
  assert.ok(assetsIndex >= 0, 'no /assets/* rule');
  assert.equal(blocks[assetsIndex].status, '404');
});

test('the /assets/* rule precedes the SPA catch-all', () => {
  assert.ok(catchAllIndex >= 0, 'no catch-all found');
  assert.ok(assetsIndex < catchAllIndex, '/assets/* rule must come before /*');
});

test('the /assets/* rule is not forced, so existing files still win', () => {
  assert.notEqual(blocks[assetsIndex].force, 'true');
});
