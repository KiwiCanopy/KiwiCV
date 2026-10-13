import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { REPO_ROOT as ROOT, sourceFiles } from '../../src/test/sourceFiles.ts';

/**
 * `--primary` is the FILL. `--primary-strong` is everything drawn — text,
 * borders, rings, strokes.
 *
 * ⚠️ **This is the guard the eslint rule cannot be.** `eslint.config.js` stops
 * anyone writing `text-primary` at a call site, but it says nothing about the
 * token values. Someone tidying `tokens.css` can collapse the two back to one
 * triple and every other check in the repo still passes.
 *
 * ⚠️ **These assertions compute; they do not compare spellings.** The first
 * version of this file asserted `fill !== strong` and
 * `foreground !== '0 0% 100%'`, which let `10.8%` vs `11%` through as a "split"
 * and let `0 0% 99%` through as an "ink label". A test that pins a
 * spelling passes for every value that is wrong in a slightly different way.
 */
const CSS_PATH = new URL('../../src/styles/tokens.css', import.meta.url);
const css = readFileSync(CSS_PATH, 'utf8');

function block(selector) {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `${selector} block not found in tokens.css`);
  const end = css.indexOf('\n  }', start);
  assert.notEqual(end, -1, `${selector} block is not closed`);
  return css.slice(start, end);
}

function token(selector, name) {
  const match = block(selector).match(new RegExp(`--${name}:\\s*([^;]+);`));
  assert.ok(match, `--${name} is missing from ${selector}`);
  return match[1].trim();
}

/** WCAG relative luminance from an `H S% L%` triple. */
function luminance(triple) {
  const [h, s, l] = triple
    .split(/\s+/)
    .map((part) => Number.parseFloat(part) / (part.includes('%') ? 100 : 1));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][Math.floor(hp) % 6];
  const m = l - c / 2;
  const channel = (v) => {
    const u = v + m;
    return u <= 0.03928 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

const ratio = (a, b) => contrast(a, b).toFixed(2);

test('the light fill is bright enough that ink can sit on it', () => {
  const fill = token(':root', 'primary');

  // The floor the design rests on. Below it, ink-on-fill stops clearing 4.5:1
  // and the label has to go back to white — which forces the fill dark again,
  // into the ~30% band whose candidates were rejected twice.
  assert.ok(
    luminance(fill) >= 0.2437,
    `light --primary has relative luminance ${luminance(fill).toFixed(4)}, under the 0.2437 floor. ` +
      'The bright fill is only legal because its label is ink; darken it and the label must revert ' +
      'to white, which is the state two rounds of rejected colours came out of.',
  );
});

test('the ink label clears AA on the fill it sits on', () => {
  const fill = token(':root', 'primary');
  const foreground = token(':root', 'primary-foreground');

  assert.ok(
    contrast(fill, foreground) >= 4.5,
    `light --primary-foreground on --primary is ${ratio(fill, foreground)}:1, under 4.5:1. ` +
      'White here measures 3.23:1, which is how this fails in practice — but so does any label ' +
      'too light for the fill. The ink is the mechanism, not a style choice.',
  );
});

test('the drawn role clears AA as text on every light surface it lands on', () => {
  const strong = token(':root', 'primary-strong');

  for (const surface of ['card', 'background', 'secondary']) {
    const value = token(':root', surface);
    assert.ok(
      contrast(strong, value) >= 4.5,
      `--primary-strong on --${surface} is ${ratio(strong, value)}:1, under 4.5:1. ` +
        'The drawn role is text; it has to clear AA on all three light surfaces. ' +
        `(--primary itself is ${ratio(token(':root', 'primary'), value)}:1 there, which is why ` +
        'the roles are split.)',
    );
  }
});

test('the fill and the drawn role cannot be collapsed into one value', () => {
  const fill = token(':root', 'primary');
  const strong = token(':root', 'primary-strong');

  // Not a spelling comparison: this asserts they are far enough apart to be
  // doing different jobs. Two values a hair apart pass `notEqual` while the
  // split is functionally undone.
  assert.ok(
    contrast(fill, strong) >= 1.5,
    `light --primary and --primary-strong are ${ratio(fill, strong)}:1 apart. ` +
      'That is close enough that one of them is not doing its job — the fill must be bright ' +
      'enough to carry ink, the drawn role dark enough to be text on a light card.',
  );
});

test('dark aliases the two on purpose, rather than inventing a second value', () => {
  assert.equal(
    token('.dark', 'primary'),
    token('.dark', 'primary-strong'),
    'dark --primary-strong should be an alias of --primary. Dark surfaces are dark, so one light ' +
      'value already works as a fill (ink on it) and as text (on the dark card).',
  );
});

test('every accent that carries a label states one, and the label is legible in both themes', () => {
  // ⚠️ DERIVED, not pinned. This was a hand-written list of three families, which
  // is a regression pin rather than a guard: the next accent added with a
  // `-foreground` would not be covered — which is exactly how `--credits`
  // shipped without one and drew a 1.75:1 label in dark. `--info` was added in
  // the same range and was likewise absent from the list.
  const families = [...block(':root').matchAll(/--([\w-]+)-foreground:/g)].map((m) => m[1]);
  assert.ok(families.length >= 3, `expected several *-foreground tokens, found ${families.length}`);

  for (const selector of [':root', '.dark']) {
    for (const family of families) {
      const fill = token(selector, family);
      const label = token(selector, `${family}-foreground`);
      assert.ok(
        contrast(fill, label) >= 4.5,
        `${selector} --${family}-foreground on --${family} is ${ratio(fill, label)}:1, under 4.5:1.`,
      );
    }
  }
});

/**
 * Tokens that legitimately exist only in `:root`: geometry and motion, which do
 * not vary by theme, plus the two kiwi greens, which are deliberately identical
 * in both. Anything else added to `:root` alone resolves to an invalid colour in
 * dark — silently, with no build error.
 *
 * ⚠️ `elevation-1` and `elevation-2` were listed here under that same "does not
 * vary by theme" rationale, and the Ink rail palette falsified it: light
 * elevation is a near-black blur at 6% alpha, which is invisible on a dark card,
 * so dark now takes its own value plus an inset rim. While they were exempt,
 * deleting the dark block's elevation passed the suite silently and brought back
 * the flat-in-dark boxes the token comment warns about. A shadow is not geometry.
 */
const ROOT_ONLY = new Set([
  'radius',
  'radius-card',
  'radius-control',
  'radius-feature',
  'radius-panel',
  'motion-control',
  'motion-ease-out',
  'motion-large',
  'motion-panel',
  'h-responsive-desktop',
  'h-responsive-mobile',
  'kiwi',
  'pale-kiwi',
]);

test('every themed token is declared in both blocks', () => {
  const names = (selector) =>
    new Set([...block(selector).matchAll(/--([\w-]+):/g)].map((m) => m[1]));
  const root = names(':root');
  const dark = names('.dark');

  const missingFromDark = [...root].filter((name) => !dark.has(name) && !ROOT_ONLY.has(name));
  assert.deepEqual(
    missingFromDark,
    [],
    `these tokens are declared in :root but not in .dark: ${missingFromDark.join(', ')}. ` +
      'A token missing from one block yields hsl(var(--missing)) — an invalid colour that fails ' +
      'silently, with no build error. Add a dark value, or add it to ROOT_ONLY with a reason.',
  );

  const strayInDark = [...dark].filter((name) => !root.has(name));
  assert.deepEqual(strayInDark, [], `these tokens exist only in .dark: ${strayInDark.join(', ')}.`);
});

test('nothing outside tokens.css reaches for the raw fill variable', () => {
  // ⚠️ The class ESLint structurally cannot see: `hsl(var(--primary))` inside a
  // JS string is not a utility class, so no selector matches it. `InfoCard` drew
  // a popover arrow that way and both guards passed.
  const offenders = [];
  for (const path of sourceFiles(join(ROOT, 'src'), { extensions: ['.ts', '.tsx'], skip: [] })) {
    readFileSync(path, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        if (/var\(\s*--primary\s*\)/.test(line)) offenders.push(`${path}:${index + 1}`);
      });
  }

  assert.deepEqual(
    offenders,
    [],
    `these reach for the fill variable directly: ${offenders.join(', ')}. ` +
      'Drawn roles take --primary-strong. A CSS var in a JS string is invisible to the eslint ' +
      'guard, which is why it is checked here.',
  );
});
