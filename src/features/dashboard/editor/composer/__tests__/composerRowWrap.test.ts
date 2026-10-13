// @vitest-environment jsdom
import { rowHasWrapped } from '@/features/dashboard/editor/composer/rowHasWrapped';
import { describe, expect, it } from 'vitest';

/**
 * `rowHasWrapped` is the whole of the composer row's cascade now: the row drops
 * the title, then the run label, then the mode toggle, and this is the only
 * thing that decides when. It replaced a table of hardcoded pixel widths that
 * were measured in English and silently wrong in every other locale.
 *
 * ⚠️ **The first version of this function compared children's `offsetTop`**,
 * which is wrong for a reason no typecheck can see: the row is `items-center`,
 * so a 44px button and a 20px chip sit at different offsets *on the same line*.
 * It reported every row as wrapped, drove the cascade straight to its last
 * level, and dropped the mode toggle at widths with room to spare.
 *
 * The two cases that pin it are the **single-line** ones — "does not call a
 * single line wrapped" and "tolerates a sub-pixel line box" — and only those
 * two. Verified by sabotage: restoring the offsetTop version fails exactly
 * them. The two-line case passes under both implementations and proves nothing
 * about the regression, which is worth saying so nobody deletes the right
 * cases and keeps the reassuring one.
 */
const rect = (height: number): DOMRect =>
  ({
    height,
    width: 0,
    top: 0,
    bottom: height,
    left: 0,
    right: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }) as DOMRect;

/**
 * `offsetTop` is stubbed as well as the rect, and that is load-bearing: jsdom
 * reports 0 for every element, so without it the `offsetTop` implementation
 * this function replaced would pass the single-line case by accident and the
 * regression would not be pinned at all.
 */
const box = (height: number, offsetTop: number): HTMLElement => {
  const node = document.createElement('div');
  node.getBoundingClientRect = () => rect(height);
  Object.defineProperty(node, 'offsetTop', { value: offsetTop, configurable: true });
  return node;
};

/** `[height, offsetTop]` per child. */
const rowOf = (height: number, children: [number, number][]): HTMLElement => {
  const row = document.createElement('div');
  row.getBoundingClientRect = () => rect(height);
  for (const [h, top] of children) row.appendChild(box(h, top));
  return row;
};

describe('rowHasWrapped', () => {
  it('does not call a single line wrapped just because its children differ in height', () => {
    // The real resting row on ONE line: a 44px disclosure, a 0px flex spacer, a
    // 44px mode toggle, a 24px cost chip and a 44px entry button. `items-center`
    // centres them, so their offsets differ (0, 22, 0, 10, 0) while the row is
    // still a single 44px line. This is the case the offsetTop version got
    // wrong, and it is why the offsets are spelled out rather than left at 0.
    const oneLine = rowOf(44, [
      [44, 0],
      [0, 22],
      [44, 0],
      [24, 10],
      [44, 0],
    ]);
    expect(rowHasWrapped(oneLine)).toBe(false);
  });

  it('reports a wrap when the row grows past its tallest child', () => {
    // Two 44px lines plus a 12px gap. The offsets differ here too — which is
    // exactly why they cannot be what the answer is read from.
    const twoLines = rowOf(100, [
      [44, 0],
      [0, 22],
      [44, 56],
      [24, 66],
      [44, 56],
    ]);
    expect(rowHasWrapped(twoLines)).toBe(true);
  });

  it('tolerates a sub-pixel line box rather than dropping a control that fits', () => {
    expect(
      rowHasWrapped(
        rowOf(44.6, [
          [44, 0],
          [24, 10],
        ]),
      ),
    ).toBe(false);
  });

  it('reports no wrap when nothing has been laid out, as in jsdom', () => {
    // Every box is 0x0 here, so there is no overflow to find — the correct
    // answer, and what keeps the rest of the composer suite on the widest row.
    expect(
      rowHasWrapped(
        rowOf(0, [
          [0, 0],
          [0, 0],
          [0, 0],
        ]),
      ),
    ).toBe(false);
  });

  it('reports no wrap for a row that cannot wrap', () => {
    expect(rowHasWrapped(rowOf(44, [[44, 0]]))).toBe(false);
    expect(rowHasWrapped(rowOf(0, []))).toBe(false);
  });
});
