import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { sourceFiles as listSourceFiles } from '../../src/test/sourceFiles.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = path.join(ROOT, 'src');

/**
 * `scrollbar-thin` and `scrollbar-thumb-*` come from `tailwind-scrollbar`, which
 * this repo does not install. They are not utilities here; they are dead
 * strings, and a dead class does not fail — it silently leaves the browser
 * default in place next to twelve surfaces that carry the app's own scrollbar.
 *
 * Both AI modals shipped that way and it was found by eye, in the product, by
 * the owner. Nothing else could have caught it: the class name is plausible, it
 * typechecks (it is a string), lint has no view of Tailwind's utility set, and
 * on macOS overlay scrollbars the difference is invisible until you scroll.
 *
 * The house utilities are `clean-scrollbar` and its alias `custom-scrollbar` in
 * `src/styles/utilities.css`. If `tailwind-scrollbar` is ever installed
 * deliberately, delete this test in the same change set — its whole premise is
 * that the plugin is absent.
 */

const PLUGIN_ONLY = /\bscrollbar-(thin|thumb-|track-|none\b)/;

const sourceFiles = (dir) =>
  listSourceFiles(dir, { extensions: ['.ts', '.tsx', '.css'], skip: [] });

test('no source file reaches for a scrollbar utility this repo does not define', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  assert.equal(
    Object.keys(deps).some((name) => name.includes('scrollbar')),
    false,
    'a scrollbar plugin is installed now — delete this test rather than working around it',
  );

  const offenders = sourceFiles(SRC)
    .filter((file) => PLUGIN_ONLY.test(fs.readFileSync(file, 'utf8')))
    .map((file) => path.relative(ROOT, file));

  assert.deepEqual(
    offenders,
    [],
    `${offenders.length} file(s) use a scrollbar class no stylesheet here defines.\n` +
      'Use `custom-scrollbar` (modal bodies) or `clean-scrollbar` from src/styles/utilities.css.',
  );
});

test('the house utilities still exist to point people at', () => {
  // Without this the scan above passes vacuously the day someone renames them.
  const utilities = fs.readFileSync(path.join(SRC, 'styles/utilities.css'), 'utf8');
  assert.match(utilities, /@utility clean-scrollbar/);
  assert.match(utilities, /@utility custom-scrollbar/);
});
