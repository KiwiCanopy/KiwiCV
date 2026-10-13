import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { sourceFiles as listSourceFiles, named } from '../../src/test/sourceFiles.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * `event.detail` is how this codebase tells a keyboard, voice or switch
 * activation from a pointer one. One predicate owns that read; the
 * argument is in `code/UI_PATTERNS.md` § Focus Handoff When a Control Removes
 * Itself.
 *
 * ⚠️ **The property, not one spelling of the test.** An earlier cut of this
 * matched `/\bdetail\s*[=!]==\s*0/`, which reads as thorough and is not:
 * `InfoBox.tsx` asked the same question as `event.detail > 0` and was invisible
 * to it, so this suite shipped green while claiming the derivation was in one
 * place and it was in two. `> 0`, `< 1`, `!e.detail` and `0 === e.detail` are
 * all the same read. Matching `.detail` catches every spelling there is.
 *
 * A genuine unrelated read — `CustomEvent.detail` — is not a violation, but it
 * is a decision: enrol the file below with its reason rather than loosening
 * this.
 */
const DETAIL_READ = /\.detail\b/;
const PREDICATE = /export const isKeyboardActivation\b/;

/** Files that read `.detail` for something other than the activation test. */
const UNRELATED_DETAIL_READERS = [];

const sourceFiles = listSourceFiles(path.join(ROOT, 'src'), {
  extensions: ['.ts', '.tsx'],
  skip: [named('__tests__')],
});
const read = (file) => fs.readFileSync(file, 'utf8');

/**
 * ⚠️ Derived, never restated — the owner is whichever file exports the
 * predicate, found by scanning rather than named in a constant here. A
 * hard-coded path would fail this suite on a move with the invariant intact,
 * and couple the test to the file the predicate happens to live in today
 * (`entry-delete-anchor.test.mjs` records the same lesson).
 */
const owners = sourceFiles.filter((file) => PREDICATE.test(read(file)));

test('exactly one module owns the keyboard-activation predicate', () => {
  assert.deepEqual(
    owners.map((file) => path.relative(ROOT, file)),
    ['src/utils/focus.ts'],
    'A second `isKeyboardActivation` is a second answer to one question. If the predicate ' +
      'moved, this suite follows it — update the expected owner and nothing else.',
  );
});

test('the activation test is read in exactly one place', () => {
  const readers = sourceFiles
    .filter((file) => DETAIL_READ.test(read(file)))
    .map((file) => path.relative(ROOT, file))
    .filter((file) => !UNRELATED_DETAIL_READERS.includes(file))
    .sort();

  assert.deepEqual(
    readers,
    owners.map((file) => path.relative(ROOT, file)),
    'A second reading of `event.detail` decides whether a press came from a pointer. Call ' +
      '`isKeyboardActivation(event)` from `@/utils/focus` — or its negation — so that when the ' +
      'right test for an assistive-technology click changes, one place changes with it. A read ' +
      'of `CustomEvent.detail` that is not the activation test belongs in ' +
      '`UNRELATED_DETAIL_READERS`, with its reason.',
  );
});
