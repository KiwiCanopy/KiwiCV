import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { splitVariants, walkStringLiterals } from './classStrings.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * In dark, every status tint is the raised surface, not its colour at low alpha.
 * Tailwind cannot carry that from a token, so each resting tint states
 * `dark:bg-secondary` beside it (`code/DESIGN_LANGUAGE.md` § "Grüne Haarlinie").
 */
const STATUS = '(?:success|warning|danger|destructive|info)/.+';
const PALETTE =
  '(?:red|rose|green|emerald|amber|yellow|blue)-(?:50|100|\\d+/(?:\\d|1\\d|20))(?:/\\d+)?';
const TINT = new RegExp(`^(bg|from)-(${STATUS}|${PALETTE})$`);
const INTERACTIVE = /^(?:group-|peer-)?(?:hover|active|focus|focus-visible|focus-within)(?:\/.+)?$/;

/** Decorative or non-status tints, by file. Each entry is a ruling, not a backlog. */
const EXEMPT = {
  // Topic badges: no state to report.
  'src/components/modals/TranslationInviteModal.tsx': ['bg-blue-500/10', 'bg-emerald-500/10'],
  // Hairlines beside a label, not a fill.
  'src/components/modals/ProfileMissingModal.tsx': ['bg-rose-500/10'],
  // The light branch of an explicit `isDark` ternary.
  'src/pages/MigrationGateway.tsx': ['bg-amber-50'],
  // The grant-permission control's own fill, beside its converted chip.
  'src/components/modals/CloudSyncGatewayModal.tsx': ['bg-amber-500/10'],
};

/** The tokens in one class string that keep their colour in dark. */
export function untintedTokens(classString, exempt = []) {
  const tokens = classString.split(/\s+/).filter(Boolean);
  return tokens.filter((token) => {
    const variants = splitVariants(token);
    const utility = variants.pop().replace(/^!|!$/g, '');
    const match = TINT.exec(utility);
    if (!match || exempt.includes(token)) return false;
    if (variants.some((variant) => INTERACTIVE.test(variant))) return false;
    if (variants.includes('dark')) return true;
    return !tokens.includes(`dark:${match[1]}-secondary`);
  });
}

test('the predicate rejects a bare tint and accepts its neighbours', () => {
  const flagged = [
    'bg-danger/10',
    'bg-success/10 md:dark:bg-secondary',
    'bg-success/10 dark:bg-secondary/50',
    'md:bg-warning/10',
    'dark:bg-success/10',
    'bg-warning/[0.08]',
    'from-warning/20 to-warning/5',
    'bg-red-50',
    'bg-green-50/90',
    'bg-amber-500/5',
    'from-amber-500/20',
  ];
  const passed = [
    'bg-success/10 dark:bg-secondary',
    'from-warning/20 dark:from-secondary',
    'bg-red-50 dark:bg-secondary',
    'hover:bg-destructive/10',
    'group-hover:bg-destructive/10',
    'bg-success',
    'bg-primary/10',
    'bg-premium/10',
    'bg-blue-600/80',
  ];
  for (const value of flagged) assert.notDeepEqual(untintedTokens(value), [], value);
  for (const value of passed) assert.deepEqual(untintedTokens(value), [], value);
});

test('every resting status tint takes the raised surface in dark', () => {
  const offenders = [];
  const seen = new Set();

  walkStringLiterals(ROOT, (text, relative, line) => {
    for (const match of text.matchAll(/\bbg-(success|warning|danger|destructive|info)\//g)) {
      seen.add(match[1]);
    }
    const bad = untintedTokens(text, EXEMPT[relative]);
    if (bad.length > 0) offenders.push(`${relative}:${line} ${bad.join(' ')}`);
  });

  assert.deepEqual(
    offenders,
    [],
    `${offenders.length} status tint(s) keep their colour in dark. Add \`dark:bg-secondary\`.`,
  );
  // Pins the walk: a renamed token or a dead pattern would otherwise pass on an empty list.
  assert.deepEqual([...seen].sort(), ['danger', 'destructive', 'info', 'success', 'warning']);
});
