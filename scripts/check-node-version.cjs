#!/usr/bin/env node

/**
 * check-node-version.cjs
 *
 * Run from `preinstall`, so it fires before a single dependency is unpacked.
 *
 * `.nvmrc` pins node 24 and is the only place the number is written — Netlify
 * reads it, this script reads it, and nothing else restates it. What it cannot
 * do is make a shell honour it: a machine whose default is node 20 installs
 * happily and then fails in three unrelated-looking ways.
 *
 *   - `vitest` dies at import with
 *     `SyntaxError: The requested module 'node:util' does not provide an export
 *     named 'styleText'` — reads as a broken test file.
 *   - `npm ci` under 20 leaves rolldown's native binding unresolvable
 *     (`Cannot find module './rolldown-binding.darwin-arm64.node'`), and the only
 *     fix is `rm -rf node_modules && npm ci` under the right node.
 *   - An absent `node_modules` sends `npx tsc -b` to a 2016 package called `tsc`,
 *     which prints `This is not the tsc command you are looking for`.
 *
 * None of those name the node version, which is the entire point of failing here
 * instead.
 *
 * `engines` is deliberately NOT set in `package.json`: it would be a second copy
 * of the pinned major, and npm only warns about it unless `engine-strict` is on —
 * which also applies to every dependency's own `engines` range and fails installs
 * for reasons that have nothing to do with this repo.
 */

const fs = require('node:fs');
const path = require('node:path');

const NVMRC = path.join(__dirname, '..', '.nvmrc');

/** The major version `.nvmrc` pins, as a number. Throws if it cannot be read. */
function requiredMajor(source = fs.readFileSync(NVMRC, 'utf8')) {
  const major = Number.parseInt(source.trim().replace(/^v/, ''), 10);
  if (!Number.isInteger(major) || major < 1) {
    throw new Error(`.nvmrc does not name a node major version: ${JSON.stringify(source)}`);
  }
  return major;
}

/**
 * The message to print for `version` under `required`, or `null` when the
 * running node is new enough. A newer major passes — the pin is a floor, and
 * refusing it would break the machine that is already ahead.
 */
function nodeVersionError(version, required) {
  const running = Number.parseInt(String(version).trim().replace(/^v/, ''), 10);
  if (Number.isInteger(running) && running >= required) return null;
  return (
    `This repository needs node ${required} or newer; you are on ${version}.\n` +
    `  nvm use            # .nvmrc already pins ${required}\n` +
    `If a previous install ran under the wrong node, the tree is unusable and\n` +
    `has to be rebuilt rather than repaired:\n` +
    `  rm -rf node_modules && npm ci`
  );
}

if (require.main === module) {
  const error = nodeVersionError(process.version, requiredMajor());
  if (error) {
    console.error(error);
    process.exit(1);
  }
}

module.exports = { nodeVersionError, requiredMajor };
