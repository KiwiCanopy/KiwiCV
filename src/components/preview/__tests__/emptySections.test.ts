import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS, type ThemeId } from '@/components/preview/themeIds';
import { buildSingleItemResume } from '@/test/singleItemResume';
import type { ResumeData } from '@/types/resume';
import { getSectionItemHash } from '@/utils/hash';
import { ALL_SECTION_KEYS, type SectionKey } from '@/utils/layout/constants';
import { describe, expect, it } from 'vitest';

/**
 * A section whose items are **all individually hidden** must serialize exactly
 * as if the section had no items at all.
 *
 * One property, no per-theme string expectations, so it cannot drift from the
 * themes — and it covers the whole empty-section family in one assertion.
 *
 * ## The state it is about
 *
 * `sectionHasRenderableContent` keeps a section in the order on a **length**
 * check, so a section with items survives it. `getVisibleData` then filters the
 * items out. What reaches a serializer is a section that is present, ordered,
 * and renders to nothing — and every theme had to decide what that costs.
 *
 * - Page break — lunar, misty and swiss_grid emitted the manual **page break**.
 * - Spacer — the same three still emitted the inter-section **spacer**, and
 *   swiss_grid additionally **numbered** it, so hiding every education entry
 *   produced 01, 02, **04**. `soft` was recorded as already
 *   correct and was not: it kept `idx < length - 1` over the unfiltered list,
 *   so a trailing separator survived when the *last* section was the empty
 *   one — `publications` and `references`, the last of its default main column
 *   and sidebar.
 *
 * ## ⚠️ The control arm, and why the obvious one is a no-op
 *
 * The first draft built the control by **removing the section from the stored
 * order**. That works for two-column themes and is silently inert for
 * one-column ones: `getEffectiveSectionOrder` (`utils/layout/getters.ts`)
 * appends `...ALL_SECTION_KEYS` to the stored order precisely so a section
 * missing from it stays renderable, and `getSortedSectionsForOneColumn` reads
 * that. The section came straight back, so the control arm rendered it in full
 * while the hidden arm did not — a guaranteed mismatch on all six one-column
 * themes, for a reason that had nothing to do with the property.
 *
 * That produced a *tautology*: those six were parked on a "not yet adopted"
 * baseline that could never have been cleared, and the file claimed to cover
 * an inventory of which it actually tested half.
 *
 * **Emptying the section's data array is the control that works on both
 * paths**, because `sectionExists` is the length check both of them run. Under
 * it all twelve themes pass — the six one-column themes were never in debt,
 * they were miscontrolled.
 *
 * ## ⚠️ What this property cannot see
 *
 * It compares two arms, so anything emitted **unconditionally** appears in
 * both and cancels. A separator that dangles regardless of what follows is
 * therefore invisible here — `soft`'s sidebar `#v()` after the contact block,
 * and lunar's and swiss_grid's when the contact block is itself empty, are
 * exactly that shape and are not covered here — `columnBlocks.test.ts` covers
 * them. Do not read a green run of this file as "no stray spacers".
 */

/** Hides every item of a section, leaving the items themselves in the data. */
function withSectionItemsHidden(themeId: string, section: SectionKey, pageBreaks: boolean) {
  const resume = buildSingleItemResume(themeId, pageBreaks ? { pageBreaks: true } : undefined);
  const items = (resume[section] ?? []) as Record<string, unknown>[];

  resume.meta.content.hiddenIds = items.map((item) => getSectionItemHash(section, item));

  return resume;
}

/**
 * Empties the section, which is what makes it genuinely absent.
 *
 * ⚠️ Not "remove it from the order" — see the note above. `sectionExists` is a
 * length check and is the gate on both the one- and two-column paths, so this
 * is the only control that drops the section from both.
 */
function withSectionEmptied(themeId: string, section: SectionKey, pageBreaks: boolean) {
  const resume = buildSingleItemResume(themeId, pageBreaks ? { pageBreaks: true } : undefined);

  (resume as unknown as Record<string, unknown[]>)[section] = [];

  return resume;
}

const mismatchedSections = (themeId: ThemeId, pageBreaks: boolean) =>
  ALL_SECTION_KEYS.filter(
    (section) =>
      SERIALIZERS[themeId](withSectionItemsHidden(themeId, section, pageBreaks) as ResumeData) !==
      SERIALIZERS[themeId](withSectionEmptied(themeId, section, pageBreaks) as ResumeData),
  );

describe('a section with every item hidden leaves no trace', () => {
  it.each(ALL_THEME_IDS)('%s, with no page breaks set', (themeId) => {
    expect(mismatchedSections(themeId, false)).toEqual([]);
  });

  // ⚠️ The page-break variant is not redundant — it is the **only** case that
  // reaches `emitSectionsWithBreaks`'s `breakToken` branch at all, and so the
  // only one covering the page break. `buildSingleItemResume` populates
  // `meta.content.pageBreaks` solely under this option, so without it
  // `hasPageBreak` is false for every section of every theme and the break
  // could be emitted before the emptiness check with the suite still green.
  it.each(ALL_THEME_IDS)('%s, with a page break set on every section', (themeId) => {
    expect(mismatchedSections(themeId, true)).toEqual([]);
  });
});
