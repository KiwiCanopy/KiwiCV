import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
const { nodeVersionError, requiredMajor } = require('../../scripts/check-node-version.cjs');

// `.nvmrc` has said 24 for a while and a shell whose default is 20 ignores it
// silently. The install then succeeds and the failures surface later as a broken
// vitest import or an unresolvable rolldown binding, neither of which mentions
// node. `preinstall` is the only hook that runs before dependencies are
// unpacked, so it is where the version can still be reported as the cause.

test('.nvmrc pins a node major, and nothing restates a different one', () => {
  const nvmrc = fs.readFileSync(path.join(ROOT, '.nvmrc'), 'utf8');
  const pinned = requiredMajor(nvmrc);
  assert.ok(pinned >= 24);

  // ⚠️ This forbade an `engines` field outright, which is scoped by spelling
  // rather than by the property: `engines: { npm: '>=10' }` duplicates nothing
  // and failed with a message about the pinned major. Worse, it forbade the one
  // shape that would satisfy both goals — an `engines.node` *derived* from
  // `.nvmrc` — so the first author who wanted the field for `setup-node`,
  // Volta or corepack would have deleted the assertion and the duplication
  // guard with it. The property is "no second, different declaration".
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const range = pkg.engines?.node;
  if (range !== undefined) {
    const stated = Number.parseInt(String(range).replace(/[^\d]*/, ''), 10);
    assert.equal(
      stated,
      pinned,
      `package.json engines.node says ${range}; .nvmrc pins ${pinned} and is the declaration`,
    );
  }
});

test('the preinstall hook runs the checker', () => {
  // The wiring, not the helper. A checker nothing invokes is decoration, and
  // deleting the script entry is the likeliest way for this to rot.
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts.preinstall, 'node scripts/check-node-version.cjs');
  assert.ok(fs.existsSync(path.join(ROOT, 'scripts/check-node-version.cjs')));
});

test('a node older than the pin is rejected, and the message says how to fix it', () => {
  const error = nodeVersionError('v20.11.1', 24);
  assert.ok(error, 'node 20 must not pass');
  assert.match(error, /v20\.11\.1/);
  assert.match(error, /nvm use/);
  assert.match(error, /rm -rf node_modules && npm ci/);
});

test('the pinned major and anything newer pass', () => {
  // The pin is a floor. Failing a machine that is already on node 25 would be a
  // worse bug than the one this closes.
  assert.equal(nodeVersionError('v24.18.0', 24), null);
  assert.equal(nodeVersionError('v25.0.0', 24), null);
});

test('an unreadable .nvmrc is an error rather than a silently permissive default', () => {
  // Parsing failure must not resolve to 0, which would make every version pass.
  for (const bad of ['', '   ', 'lts/*', 'node']) {
    assert.throws(() => requiredMajor(bad), /does not name a node major version/);
  }
});
