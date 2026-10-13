/**
 * Whether the resting row has spilled onto a second line.
 *
 * Compares the row's height against its tallest child, because that is the one
 * question with no locale, font or zoom assumption in it: a single flex line is
 * exactly as tall as the tallest thing on it, and a second line can only make
 * the row taller. The row carries no padding of its own — the band's `py-*`
 * sits on the `section` above — so its height is the line box and nothing else.
 *
 * ⚠️ **Do not "simplify" this to comparing children's `offsetTop`.** That was
 * the first version and it is wrong: the row is `items-center`, so a 44px
 * button and a 20px chip sit at different offsets *on the same line*. It
 * reported every row as wrapped, which silently drove the cascade to its last
 * level and dropped the mode toggle at widths with 78px to spare. It looked
 * right, it typechecked, and only measuring the rendered row caught it.
 *
 * ⚠️ Returns `false` in jsdom, where every box is 0x0 and nothing can wrap.
 * That is the correct answer there: with no layout there is no overflow, so the
 * suite sees the widest row — the same thing `relaxed` gives on first paint.
 */
export const rowHasWrapped = (row: HTMLElement): boolean => {
  const children = Array.from(row.children) as HTMLElement[];
  if (children.length < 2) return false;
  const tallestChild = Math.max(...children.map((child) => child.getBoundingClientRect().height));
  // A pixel of tolerance: sub-pixel line boxes are common at fractional zoom,
  // and a false positive here costs a control the row had room for.
  return row.getBoundingClientRect().height > tallestChild + 1;
};
