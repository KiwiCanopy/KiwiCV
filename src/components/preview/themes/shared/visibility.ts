import type { ResumeMeta } from '@/types/resume';
import type { LayoutSectionId } from '@/utils/layout/customSections';

/**
 * Check if a section has a manual page break before it.
 */
export function hasPageBreak(
  meta: ResumeMeta | undefined,
  column: 'main' | 'sidebar' | 'oneColumn',
  sectionId: string,
): boolean {
  if (!meta?.content?.pageBreaks) return false;

  if (column === 'oneColumn') {
    return !!meta.content.pageBreaks.oneColumn?.includes(sectionId);
  }

  const twoCol = meta.content.pageBreaks.twoColumn;
  if (!twoCol) return false;

  if (column === 'main') {
    return !!twoCol.main?.includes(sectionId);
  }

  return !!twoCol.sidebar?.includes(sectionId);
}

/**
 * Emits a column of sections, with manual page breaks and inter-section
 * separators, skipping the ones that serialize to nothing.
 *
 * ## Why this exists
 *
 * "Does this section contribute anything" was answered five different ways
 * across the twelve serializers, and **four** of them got it wrong — lunar,
 * misty, swiss_grid and soft — in ways a green suite could not see. Those four
 * are the adopters; the other eight already satisfied the property, measured
 * rather than assumed.
 *
 * The state at issue is a section that is **still in the order** — it has
 * items, so `sectionHasRenderableContent`'s length check keeps it — but whose
 * items are each individually hidden, so it renders empty. An earlier fix handled the
 * page break for that case; the *separator* was left, because touching it
 * would have churned every serializer string test for what looked cosmetic.
 * It is not quite cosmetic: lunar, misty and swiss_grid appended nothing and
 * then still emitted their `#v(…)`, leaving a doubled gap where the section
 * had been.
 *
 * ## The single gate
 *
 * `render` returning `''` is the only definition of "empty" here. An empty
 * section costs its break, its separator **and** its index — which is what
 * fixes swiss_grid's second bug: it numbered by position in the *unfiltered*
 * list, so hiding every education entry numbered a CV 01, 02, **04**.
 *
 * ⚠️ `render` receives the index among **emitted** sections, not the position
 * in `sectionIds`. That is the whole point of the signature; a caller that
 * wants the raw position must not use this.
 *
 * ## Ordering
 *
 * Separator **before** break, and neither before the first emitted section.
 * That reproduces the existing byte order — the old loops emitted the
 * separator at the tail of the previous iteration and the break at the head of
 * the next — while dropping the trailing separator the old `idx < length - 1`
 * form left behind whenever the last sections were empty.
 */
export function emitSectionsWithBreaks(
  sectionIds: readonly LayoutSectionId[],
  options: {
    meta: ResumeMeta | undefined;
    column: 'main' | 'sidebar' | 'oneColumn';
    /** Emitted before a section the user set a manual break on. */
    breakToken: string;
    /** Emitted between two rendered sections. Never leading or trailing. */
    separator: string;
    /** Returns the section's markup, or `''` if it contributes nothing. */
    render: (sectionId: LayoutSectionId, emittedIndex: number) => string;
  },
): string {
  const { meta, column, breakToken, separator, render } = options;
  const parts: string[] = [];

  for (const sectionId of sectionIds) {
    // `parts.length` is the emitted count by construction — nothing empty is
    // ever pushed — which is why this needs no separate counter.
    const body = render(sectionId, parts.length);
    if (!body) continue;

    parts.push(hasPageBreak(meta, column, sectionId) ? breakToken + body : body);
  }

  // ⚠️ Deferred to `joinBlocks` so "never leading, never trailing" has **one**
  // implementation. It used to be a second `if (emitted > 0) push(separator)`
  // here, and a copy of a rule is how one fix closed half of it and another the rest.
  // Folding the break into the part it precedes preserves the documented byte
  // order — separator before break — because the separator now goes between.
  return joinBlocks(parts, separator);
}

/**
 * Join a column's top-level blocks, dropping the empty ones.
 *
 * `emitSectionsWithBreaks` guarantees no separator leads or trails the
 * *sections*. It cannot say anything about the blocks a theme puts **around**
 * them — the profile image, the name header, the contact block — and those are
 * exactly where the second half lived: lunar and swiss_grid appended `separator + sections`
 * whenever `sections` was non-empty, without asking whether anything preceded
 * it, so a resume with no contact data opened its sidebar on a bare `#v()`.
 * Soft had the mirror image, a `#v()` emitted with the header and left dangling
 * when every sidebar section was hidden.
 *
 * Writing it as `content += content ? sep + next : next` at each site works and
 * is one `content ?` away from being wrong again. Collecting the blocks and
 * joining makes a leading or trailing separator unrepresentable *in a joined
 * column*, which is the house preference: delete the shape rather than guard
 * it. `emitSectionsWithBreaks` defers to this for the same reason.
 *
 * ⚠️ **A block must not carry its own separator.** That is what defeats the
 * join, and it is the form every instance of this bug has taken: lunar's
 * profile image ended with the spacer that should have separated it, so with no
 * contact data and every sidebar section hidden the column closed on it. Pass
 * the block, let the join place the separator.
 *
 * ⚠️ The property **is** checkable on the emitted markup, contrary to what an
 * earlier draft of this comment claimed — see `__tests__/columnSpacers.test.ts`.
 * A naive regex is not: a dangling separator and a legitimate leading spacer
 * inside a `#block(…)[…]` are the same bytes. Scoping it to *bare* content
 * groups at bracket depth zero — a Typst grid cell, which only the serializers
 * write — separates them, and gives a baseline of **zero** rather than a
 * "may only shrink" number.
 *
 * Empty means falsy: a block that renders `''`. A block that is only
 * whitespace is *not* empty, and deliberately so — no caller produces one, and
 * treating whitespace as empty would silently swallow a real spacer.
 */
export function joinBlocks(blocks: readonly string[], separator: string): string {
  return blocks.filter(Boolean).join(separator);
}
