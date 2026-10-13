import { areValuesEqual } from '@/store/resume/slices/ai/utils';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

/**
 * `areValuesEqual` exists on both sides of the process boundary: the backend's
 * grades a run billable, the frontend's decides what is written back. Where they
 * disagree a user pays for a proposal with nothing behind it.
 *
 * Compared by BEHAVIOUR, over one table, because a comparator's source text can
 * differ while it agrees and match while it does not. The backend is spawned, as
 * in `aiSanitizerParity.test.ts`: it is ESM outside the app's tsconfig.
 */

/** `undefined` cannot cross JSON, so it travels as this marker and is decoded on both sides. */
const UNDEFINED = '__undefined__';

const PAIRS: Array<[label: string, a: unknown, b: unknown]> = [
  ['identical strings', 'Payments', 'Payments'],
  ['whitespace-only string change', 'Payments', '  Payments\n'],
  ['real string change', 'Payments', 'Payment systems'],
  ['null vs empty string', null, ''],
  ['undefined vs empty string', UNDEFINED, ''],
  ['undefined vs whitespace', UNDEFINED, '   '],
  ['null vs a word', null, 'Payments'],
  ['identical arrays', ['a', 'b'], ['a', 'b']],
  [
    'whitespace-only array change',
    ['Dear team,', 'I ran payments.'],
    ['Dear team, ', ' I ran payments.\n'],
  ],
  ['reordered array', ['a', 'b'], ['b', 'a']],
  ['shorter array', ['a', 'b'], ['a']],
  ['empty array vs undefined', [], UNDEFINED],
  ['empty array vs empty string', [], ''],
  ['array with a null vs an empty string', [null], ['']],
  ['identical objects', { city: 'Berlin' }, { city: 'Berlin' }],
  ['changed objects', { city: 'Berlin' }, { city: 'Munich' }],
  ['arrays of objects', [{ name: 'SEPA' }], [{ name: 'SEPA' }]],
  ['number vs its string', 3, '3'],
  ['equal numbers', 3, 3],
  ['boolean vs string', true, 'true'],
];

const decode = (value: unknown): unknown => (value === UNDEFINED ? undefined : value);

const backendVerdicts = (): boolean[] => {
  const backendUrl = new URL('../../../../../../netlify/functions/lib/ai/utils.js', import.meta.url)
    .href;
  const script = `
    import { areValuesEqual } from '${backendUrl}';
    const decode = (v) => (v === '${UNDEFINED}' ? undefined : v);
    const pairs = JSON.parse(process.env.PAIRS);
    process.stdout.write(JSON.stringify(pairs.map(([, a, b]) => areValuesEqual(decode(a), decode(b)))));
  `;
  const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    encoding: 'utf8',
    env: { ...process.env, PAIRS: JSON.stringify(PAIRS) },
  });
  if (run.status !== 0) {
    throw new Error(`the backend comparator could not be run:\n${run.stderr || run.stdout}`);
  }
  return JSON.parse(run.stdout);
};

describe('the two areValuesEqual copies agree', () => {
  const backend = backendVerdicts();

  it('ran the backend over the whole table', () => {
    expect(backend).toHaveLength(PAIRS.length);
  });

  it.each(PAIRS.map((pair, i) => [...pair, i] as const))('%s', (_label, a, b, i) => {
    expect(backend[i]).toBe(areValuesEqual(decode(a), decode(b)));
  });

  /** Non-vacuity: a table both copies answer `true` for would agree while comparing nothing. */
  it('grades whitespace as no change and a real edit as a change', () => {
    const verdict = (label: string) => backend[PAIRS.findIndex(([l]) => l === label)];
    expect(verdict('whitespace-only array change')).toBe(true);
    expect(verdict('real string change')).toBe(false);
    expect(verdict('reordered array')).toBe(false);
  });
});
