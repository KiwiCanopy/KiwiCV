import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { splitVariants, walkStringLiterals } from './classStrings.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const STYLES = path.join(ROOT, 'src/styles');

/**
 * In dark, `--muted`, `--secondary` and `--accent` share one value, so a hover to
 * any of them is 1.00:1 on another and faint at low alpha. A solid hover takes
 * `hover:bg-hover-step`; an alpha one states its dark step beside it
 * (`code/DESIGN_LANGUAGE.md` § "Grüne Haarlinie", #89).
 */
const FILL = /^bg-(muted|secondary|accent)(\/.+)?$/;
const HOVER = /^(?:group-)?hover(?:\/.+)?$/;
const DARK_STEPS = ['mist', 'secondary'];

/** Not a hover step, by file. Each entry is a ruling, not a backlog. */
const EXEMPT = {
  // Pins a refused button's hover to its rest fill.
  'src/components/ui/Button.tsx': ['hover:bg-secondary'],
};

/** The hover fills in one class string with no visible step in dark. */
export function faintHovers(classString, exempt = []) {
  const tokens = classString.split(/\s+/).filter(Boolean);
  return tokens.filter((token) => {
    const variants = splitVariants(token);
    const match = FILL.exec(variants.pop().replace(/^!|!$/g, ''));
    if (!match || exempt.includes(token) || variants.includes('dark')) return false;
    const hover = variants.find((variant) => HOVER.test(variant));
    if (hover === undefined) return false;
    if (match[2] === undefined) return true;
    return !DARK_STEPS.some((step) => tokens.includes(`dark:${hover}:bg-${step}`));
  });
}

const hslTriple = (value) => {
  const [h, s, l] = value.trim().split(/\s+/).map(parseFloat);
  const k = (n) => (n + h / 30) % 12;
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  return [0, 8, 4].map((n) => {
    const channel = l / 100 - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
};
const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const contrast = (a, b) => {
  const [hi, lo] = [luminance(hslTriple(a)), luminance(hslTriple(b))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('the predicate rejects a faint hover and accepts its neighbours', () => {
  const flagged = [
    'hover:bg-muted',
    'hover:bg-accent',
    'hover:bg-muted dark:hover:bg-mist',
    'hover:bg-muted!',
    'group-hover:bg-muted',
    'hover:bg-muted/40',
    'hover:bg-secondary/50',
    'group-hover:bg-muted/60',
    'group-hover:bg-muted/60 dark:hover:bg-mist',
    'hover:bg-muted/40 dark:hover:bg-mist/50',
  ];
  const passed = [
    'hover:bg-hover-step',
    'enabled:hover:bg-hover-step',
    'hover:bg-muted/40 dark:hover:bg-mist',
    'hover:bg-secondary/50 dark:hover:bg-secondary',
    'group-hover:bg-muted/60 dark:group-hover:bg-mist',
    'bg-muted',
    'bg-secondary/50',
    'hover:bg-mist',
    'hover:bg-primary/10',
  ];
  for (const value of flagged) assert.notDeepEqual(faintHovers(value), [], value);
  for (const value of passed) assert.deepEqual(faintHovers(value), [], value);
});

test('every hover to a raised fill has a visible step in dark', () => {
  const offenders = [];
  const seen = new Set();
  const usedExemptions = new Set();

  const check = (text, relative, line) => {
    for (const match of text.matchAll(/hover:bg-(muted|secondary|accent)\b/g)) seen.add(match[1]);
    const exempt = EXEMPT[relative] ?? [];
    for (const token of exempt) {
      if (text.split(/\s+/).includes(token)) usedExemptions.add(`${relative} ${token}`);
    }
    const bad = faintHovers(text, exempt);
    if (bad.length > 0) offenders.push(`${relative}:${line} ${bad.join(' ')}`);
  };

  walkStringLiterals(ROOT, check);
  // `@apply` is the one class list outside a string literal.
  for (const name of fs.readdirSync(STYLES).filter((file) => file.endsWith('.css'))) {
    const relative = path.relative(ROOT, path.join(STYLES, name));
    fs.readFileSync(path.join(STYLES, name), 'utf8')
      .split('\n')
      .forEach((text, index) => {
        if (text.trim().startsWith('@apply')) check(text.replace(';', ''), relative, index + 1);
      });
  }

  assert.deepEqual(offenders, [], `${offenders.length} hover fill(s) are faint in dark.`);
  // Pins the walk: a renamed token or a dead pattern would otherwise pass on an empty list.
  assert.deepEqual([...seen].sort(), ['accent', 'muted', 'secondary']);
  assert.deepEqual(
    [...usedExemptions],
    Object.entries(EXEMPT).flatMap(([file, tokens]) => tokens.map((token) => `${file} ${token}`)),
    'A stale EXEMPT entry protects nothing. Delete it.',
  );
});

test('the dark tokens this rule rests on hold their values', () => {
  const tokens = fs.readFileSync(path.join(STYLES, 'tokens.css'), 'utf8');
  const dark = /\.dark\s*\{([\s\S]*?)\n\s*\}/.exec(tokens)?.[1];
  assert.ok(dark, 'tokens.css has no .dark block');
  const read = (name) => new RegExp(`--${name}:\\s*([^;]+);`).exec(dark)?.[1];

  assert.equal(read('muted'), read('secondary'));
  assert.equal(read('accent'), read('secondary'));
  assert.equal(read('hover-step'), 'var(--mist)');
  // Light keeps its hover: the three fills are one value there too.
  assert.equal(/--hover-step:\s*([^;]+);/.exec(tokens)?.[1], 'var(--muted)');
  // Without this mapping every `hover:bg-hover-step` emits no CSS.
  assert.ok(
    fs
      .readFileSync(path.join(ROOT, 'tailwind.config.js'), 'utf8')
      .includes("'hover-step': 'hsl(var(--hover-step))'"),
  );
  // Below this the secondary button's hover stops reading: the palette's `#16271A` was 1.05:1.
  assert.ok(contrast(read('mist'), read('secondary')) >= 1.25);
  assert.ok(contrast(read('border'), read('mist')) >= 1.2, 'press must stay beyond hover');
});
