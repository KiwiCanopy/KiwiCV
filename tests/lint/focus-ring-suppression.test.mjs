import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { sourceFiles as listSourceFiles } from '../../src/test/sourceFiles.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = path.join(ROOT, 'src');
const SEGMENTED = path.join(SRC, 'components/ui/SegmentedToggle.tsx');
const TOKENS = path.join(SRC, 'styles/tokens.css');

/**
 * `outline-hidden` does not move a focus indicator, it deletes one — and it
 * out-specifies the `:where(a, button, …):focus-visible` base rule in
 * `tokens.css` while reading like a reset. `SegmentedToggle` carried it on every
 * segment, which measured 1:1 in light mode.
 *
 * A container that clips re-points `--focus-offset`; one that need not clip
 * should stop clipping. Neither is `outline-hidden`.
 *
 * ⚠️ `focus-visible:outline-none` is deliberately NOT banned, and its 38 sites
 * are not a second instance of this bug. It is half of the `outline-none` +
 * `ring-*` treatment, which paints; and the `forced-colors` block in
 * `tokens.css` is **unlayered**, so it outranks every Tailwind utility there and
 * restores `outline: 3px solid CanvasText` regardless of what the class string
 * says. `outline-hidden` is not saved by that: it wins the same cascade in
 * normal mode, where nothing else repaints the ring.
 *
 * Ruling: `code/DESIGN_LANGUAGE.md` § "A clipping track draws the focus ring
 * inward".
 */

const sourceFiles = (dir) =>
  listSourceFiles(dir, { extensions: ['.ts', '.tsx', '.css'], skip: [] });

/** Comments are prose about the code, never the code. Matching them is the
 *  `toContain`-on-unrelated-copy trap `.claude/rules/testing.md` names. */
function withoutComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

test('no source file suppresses the focus ring with `outline-hidden`', () => {
  const offenders = sourceFiles(SRC)
    .filter((file) => /\boutline-hidden\b/.test(withoutComments(fs.readFileSync(file, 'utf8'))))
    .map((file) => path.relative(ROOT, file));

  assert.deepEqual(
    offenders,
    [],
    `${offenders.length} file(s) delete the keyboard focus indicator.\n` +
      'Re-point `--focus-offset` on the clipping container, or stop clipping it.',
  );
});

test('the clipping track derives its inward offset from the gutter it clips with', () => {
  // Not a spelling check: the offset and the padding are the same number, and a
  // test that pins `-3px` as a literal stays green through the edit that makes
  // them disagree. Both sides must read `--seg-gutter`.
  const source = withoutComments(fs.readFileSync(SEGMENTED, 'utf8'));

  assert.match(source, /'--seg-gutter':\s*'3px'/, 'the gutter must be declared once');
  assert.match(source, /p-\[var\(--seg-gutter\)\]/, 'the padding must read the gutter');
  assert.match(
    source,
    /'--focus-offset':\s*'calc\(-1 \* var\(--seg-gutter\)\)'/,
    'the ring must be offset inward BY the gutter, not by a number that matches it today',
  );
  assert.match(source, /'--focus-separator-shadow':\s*'none'/);
});

test('the base rule still publishes the two variables the track re-points', () => {
  // Without this the track sets variables nothing reads, and the ring silently
  // returns to a clipped `outline-offset: 2px`.
  const tokens = fs.readFileSync(TOKENS, 'utf8');
  assert.match(tokens, /outline:\s*3px solid hsl\(var\(--focus-outer\)\)/);
  assert.match(tokens, /outline-offset:\s*var\(--focus-offset,\s*2px\)/);
  assert.match(tokens, /box-shadow:\s*var\(--focus-separator-shadow,/);
});
