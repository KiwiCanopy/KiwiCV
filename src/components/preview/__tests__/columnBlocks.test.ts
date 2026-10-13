import { joinBlocks } from '@/components/preview/themes/shared/visibility';
import { describe, expect, it } from 'vitest';

/**
 * `joinBlocks` — the composer that makes a dangling column separator
 * unrepresentable.
 *
 * ⚠️ **This is a unit test on purpose, and the reason is the interesting part.**
 * The property "a separator must have content on both sides" is *not*
 * expressible as an assertion on the emitted Typst. A dangling separator and a
 * legitimate leading spacer inside a `#block[…]` are the same bytes, so the
 * obvious regex — a `#v()` with nothing but a bracket on one side — matches
 * **149** places across the twelve themes' correct output. Measured, not
 * guessed; it was the first thing tried, and a "may only shrink" baseline of
 * 149 is exactly the vacuous shape the first separator guard shipped with.
 *
 * So the defect was closed structurally instead: the three affected sidebars
 * (soft, lunar, swiss_grid) collect their blocks and join, rather than
 * appending a separator behind a hand-written `if`. What that leaves testable
 * is this function, and the *production* fix is evidenced by hashing all twelve
 * themes' markup against `main` — six lines changed, every one of them a
 * removed dangling spacer, `base` byte-identical everywhere. See PR.
 *
 * Both halves of the property, per the both-halves rule (`.claude/rules/testing.md`):
 *
 * 1. **Missing** — an empty block must take its separator with it. This is the
 *    bug: the first fix gated the separator on the block *after* it and not on the block
 *    *before*, so lunar and swiss_grid opened their sidebar on a bare `#v()`
 *    whenever the contact block rendered nothing, and soft closed on one
 *    whenever every sidebar section was hidden.
 * 2. **Narrowed** — a separator must still appear between two blocks that both
 *    render. A `filter(Boolean).join()` that dropped the separator entirely
 *    would satisfy half 1 outright.
 */
describe('joinBlocks', () => {
  it('separates blocks that all render', () => {
    expect(joinBlocks(['a', 'b', 'c'], '|')).toBe('a|b|c');
  });

  it('drops an empty block and its separator together, wherever it sits', () => {
    expect(joinBlocks(['', 'b', 'c'], '|')).toBe('b|c');
    expect(joinBlocks(['a', '', 'c'], '|')).toBe('a|c');
    expect(joinBlocks(['a', 'b', ''], '|')).toBe('a|b');
    expect(joinBlocks(['', 'b', ''], '|')).toBe('b');
  });

  it('emits nothing at all when every block is empty', () => {
    expect(joinBlocks(['', '', ''], '|')).toBe('');
    expect(joinBlocks([], '|')).toBe('');
  });

  it('never leads or trails with the separator', () => {
    // The property stated directly, over every arrangement of three blocks.
    for (const a of ['', 'A']) {
      for (const b of ['', 'B']) {
        for (const c of ['', 'C']) {
          const out = joinBlocks([a, b, c], '|');
          expect(out.startsWith('|')).toBe(false);
          expect(out.endsWith('|')).toBe(false);
          expect(out).not.toContain('||');
        }
      }
    }
  });

  /**
   * ⚠️ Whitespace is content, deliberately. The themes' blocks are Typst
   * markup, and a block that is genuinely only a spacer would be silently
   * swallowed by a `.trim()`-based emptiness test — a different bug in the same
   * family. No caller produces one today; this pins the decision so a later
   * "tidy-up" does not quietly change it.
   */
  it('treats a whitespace-only block as content', () => {
    expect(joinBlocks(['a', ' ', 'c'], '|')).toBe('a| |c');
    expect(joinBlocks(['\n'], '|')).toBe('\n');
  });
});
