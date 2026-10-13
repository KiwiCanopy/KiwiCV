import { type ResumeData, type ResumeMeta, type VisibilitySection } from '@/types/resume';
import {
  type LayoutSectionId,
  type SectionKey,
  findCustomSection,
  getDefaultTwoColumnLayout,
  getSortedSectionsForOneColumn,
  isCustomSectionToken,
  isLayoutSectionId,
  isSectionKey,
  isTwoColumnTheme,
} from '@/utils/layoutMetadata';
import { isVisible } from '@/utils/visibility';

/**
 * Gets the first visible section in a specific layout/column.
 * First visible sections are forbidden from having manual page breaks.
 *
 * ⚠️ **All three columns are narrowed with `isSectionKey`, and the two-column
 * ones are the live half of the stale-key defect.** This function is `sanitizePageBreaks`'s only
 * source of `firstOne`/`firstMain`/`firstSide`, so a stale key at the head of a
 * stored order becomes "the first rendered section" — and the break on the
 * section that *is* actually first then survives sanitization, which is precisely
 * the state this pass exists to forbid. `visibility.ts` and the serializers then
 * emit `#pagebreak()` before the first section: a **blank leading page**, in the
 * PDF, persisted, because `sanitizePageBreaks` runs on `onRehydrateStorage`.
 *
 * Measured, `main = ['profiles', 'work']` with one visible profile and
 * `pageBreaks.twoColumn.main = ['work']`: `firstMain` was `'profiles'` and the
 * break on `work` was **kept**; with `main = ['work']` it is scrubbed. `'profiles'`
 * in a stored order is not hypothetical — `validation.ts`'s order whitelist names
 * it as the stale key it removes, and `applySectionPlacement`'s docblock records
 * it being measured there.
 *
 * ⚠️ **The one-column column was fixed indirectly and the two-column ones were
 * not, which is why they needed a separate edit.** `getSortedSectionsForOneColumn`
 * returns `SectionKey[]`; these two read `meta.content.order.twoColumn`
 * **raw** and never pass through `getRenderableTwoColumnSections`, so narrowing that
 * function did nothing for them. Found by the architect pass, after the first
 * draft of the fix called the whole thing latent on the strength of a markup-identity
 * measurement — which cannot see this, because the damage is in the page-break
 * state rather than in the section dispatch.
 *
 * ⚠️ The `id === 'profiles'` arm that used to sit below is **gone**, not moved.
 * Once the columns are narrowed it is unreachable (`TS2367`), and it was wrong
 * anyway: `getTwoColumnSections` drops `profiles`, so no theme renders
 * it, and naming it "the first rendered section" contradicted this function's own
 * contract that its answer cannot disagree with what the document shows. Same
 * shape as the ten dead `case 'about':` arms deleted earlier.
 */
export const getFirstRenderedSection = (
  resume: ResumeData,
  layout: 'oneColumn' | 'main' | 'sidebar',
): string | null => {
  const meta = resume.meta;
  const hiddenSections = meta.content.hiddenSections || [];
  const hiddenIds = meta.content.hiddenIds || [];

  const isPlaceable = (id: string): id is LayoutSectionId => isLayoutSectionId(id, resume);
  let sectionIds: LayoutSectionId[] = [];
  if (layout === 'oneColumn') {
    // The same effective order the one-column themes render, so that "first
    // rendered section" cannot disagree with what the document actually shows.
    sectionIds = getSortedSectionsForOneColumn(meta, resume);
  } else if (layout === 'main') {
    sectionIds = (meta.content.order?.twoColumn?.main || []).filter(isPlaceable);
  } else if (layout === 'sidebar') {
    sectionIds = (meta.content.order?.twoColumn?.sidebar || []).filter(isPlaceable);
  }

  // Find first section that is NOT hidden AND has visible items
  const firstVisible = sectionIds.find((id) => {
    if (hiddenSections.includes(id)) return false;

    // ⚠️ The `Array.isArray` check is load-bearing and is NOT made redundant by
    // the narrowing above. `id` being one of the twelve does not make `resume[id]`
    // an array at runtime — the type says so, persisted JSON does not, and a
    // résumé rehydrated without the key would throw on `.length` where it falls
    // through to the `return true` below instead.
    const items = isCustomSectionToken(id)
      ? findCustomSection(resume, id)?.items
      : (resume[id] as unknown[] | undefined);
    if (Array.isArray(items)) {
      return (
        items.length > 0 &&
        items.some((item) =>
          isVisible(id, item as Record<string, unknown>, hiddenIds, hiddenSections),
        )
      );
    }

    // Default to true for a section whose array is missing from persisted state.
    return true;
  });

  return firstVisible || null;
};

/**
 * Sanitizes all page breaks based on the current visibility and ordering.
 * Removes breaks for hidden sections, for sections the one-column layout does
 * not render at all, and for the first visible section of each column.
 */
export const sanitizePageBreaks = (
  resume: ResumeData,
): NonNullable<ResumeMeta['content']['pageBreaks']> => {
  const meta = resume.meta;
  const hiddenSections = meta.content.hiddenSections || [];
  const cb = meta.content.pageBreaks || {
    oneColumn: [],
    twoColumn: { main: [], sidebar: [] },
  };

  const firstOne = getFirstRenderedSection(resume, 'oneColumn');
  const firstMain = getFirstRenderedSection(resume, 'main');
  const firstSide = getFirstRenderedSection(resume, 'sidebar');

  // A break on a section that is not rendered is inert while the section is
  // empty and would come back to life the moment it is filled in again, so it
  // is dropped the same way a hidden section's break is.
  // ⚠️ `Set<string>`, explicitly. `getSortedSectionsForOneColumn` returns
  // `SectionKey[]`, and `cb.oneColumn` holds *stored* page-break ids —
  // arbitrary JSON on the same rehydration path the order is. So the membership
  // test is "is this untrusted string one of the rendered sections", and inferring
  // `Set<SectionKey>` here makes that `TS2345` rather than expressing it.
  const renderedOneColumn = new Set<string>(getSortedSectionsForOneColumn(meta, resume));

  return {
    oneColumn: (cb.oneColumn || []).filter(
      (id) => id !== firstOne && !hiddenSections.includes(id) && renderedOneColumn.has(id),
    ),
    twoColumn: {
      main: (cb.twoColumn?.main || []).filter(
        (id) => id !== firstMain && !hiddenSections.includes(id),
      ),
      sidebar: (cb.twoColumn?.sidebar || []).filter(
        (id) => id !== firstSide && !hiddenSections.includes(id),
      ),
    },
  };
};

/**
 * ⚠️ Not exported, and that is the guard rather than tidiness. Both reviewer
 * passes noted the same thing: after the five copies were collapsed, these two
 * had zero references outside this file while staying `export`ed and
 * canonically named — so a sixth slice could import `syncSectionPlacement`,
 * write the order, skip `sanitizePageBreaks`, and rebuild exactly the half of
 * the block that made it correct. `applySectionPlacement` is the only way in.
 * Make the wrong object unreachable, not merely unused.
 */
const hasSectionPlacementData = (resume: ResumeData, section: SectionKey): boolean => {
  const items = resume[section] as unknown[] | undefined;
  return Array.isArray(items) && items.length > 0;
};

const syncSectionPlacement = (resume: ResumeData, section: SectionKey) => {
  if (!isTwoColumnTheme(resume.meta.theme.name)) {
    return {
      main: resume.meta.content.order?.twoColumn.main || [],
      sidebar: resume.meta.content.order?.twoColumn.sidebar || [],
    };
  }

  let main = [...(resume.meta.content.order?.twoColumn.main || [])];
  let sidebar = [...(resume.meta.content.order?.twoColumn.sidebar || [])];
  const hasPlacementData = hasSectionPlacementData(resume, section);

  if (!hasPlacementData) {
    return {
      main: main.filter((s) => s !== section),
      sidebar: sidebar.filter((s) => s !== section),
    };
  }

  const inMain = main.includes(section);
  const inSide = sidebar.includes(section);

  if (inMain || inSide) {
    return { main, sidebar };
  }

  const defaults = getDefaultTwoColumnLayout(resume.meta.theme.name);
  if (defaults.main.includes(section)) {
    main = [...main, section];
  } else if (defaults.sidebar.includes(section)) {
    sidebar = [...sidebar, section];
  }

  return { main, sidebar };
};

/**
 * Writes `section`'s two-column placement back into the draft and re-derives the
 * page breaks that depend on it.
 *
 * ⚠️ **The two writes belong together.** `syncSectionPlacement` can move a
 * section between the columns or drop it entirely, and `sanitizePageBreaks`
 * reads the order it just wrote — a caller that syncs the placement and forgets
 * the page-break pass leaves a break pinned to a column the section is no longer
 * in. That rule once had five implementations and no name
 * (`updateSection` and `initializeSection` in `dataSlice`, `toggleItemVisibility`,
 * `toggleSectionVisibility` and `setSectionVisibility` in `visibilitySlice`).
 *
 * ⚠️ The five were semantically identical, **not textually**: `dataSlice`'s two
 * went through a local `const order = …` in eight lines, `visibilitySlice`'s
 * three through its pre-existing `content` binding in six. An earlier draft of
 * this comment called them byte-identical; a reviewer diffed them.
 *
 * ⚠️ **Two of the five are since deleted, and that list is history rather than
 * an inventory of callers.** `updateSection` and
 * `setSectionVisibility` went separately, both on the same evidence: two interface
 * declarations, one implementation, one mention in this comment, and no
 * production caller at all. Three remain
 * (`sectionPlacement.test.ts` asserts each through its public action).
 *
 * Taking `VisibilitySection` — the widest thing any of those callers holds — is
 * what removes their five `as LayoutManagedSection` casts. The narrowing they
 * were performing blind now happens once, against `ALL_SECTION_KEYS`.
 *
 * ⚠️ **The domain is two non-section keys, not five.**
 * `VisibilitySection` was `keyof ResumeData | 'profiles' | 'basics:image'`, so
 * `basics`, `coverLetter` and `meta` could be handed to this function; it is now
 * `SectionKey | 'profiles' | 'basics:image'`. That narrowing is what surfaced
 * `updateSection` as dead — it was the sole reason the parameter needed
 * `keyof ResumeData` width — and it is pinned by `@ts-expect-error` in
 * `sectionPlacement.test.ts`, not merely described here.
 *
 * ⚠️ **A non-section key must still be scrubbed from the columns, and this is
 * the finding that cost the most on this change** — `isSectionKey` does not go
 * away with the narrowing, because `'profiles'` stays in the union and is
 * exactly the key a persisted order can hold. The first draft simply
 * skipped the write for those keys, on the argument that
 * `hasSectionPlacementData` is false for all of them so `syncSectionPlacement` was
 * returning the same arrays back. Half of that is true and it does not carry the
 * conclusion: the "no placement data" branch returns the columns **filtered by
 * the key**, which is a no-op only if the columns cannot contain it — and they
 * can. `sanitizeResumeData`'s order whitelist (`validation.ts`, and its own
 * comment names `'profiles'`) runs from `setResume` alone; `onRehydrateStorage`
 * runs `sanitizePageBreaks` only, no migration touches `meta.content.order`, and
 * `layoutSlice`'s five order writers take bare `string`. So a persisted
 * `twoColumn.main` holding `'profiles'` is never filtered, and
 * `getFirstRenderedSection` 130 lines above has an `id === 'profiles'` branch
 * precisely because it reads those arrays. Measured by the reviewer: with
 * `main: ['profiles','work']` and a break on `work`, the old code produced
 * `main: ['work']` and dropped the break; the skipping draft left both. That is
 * a stale break on the first rendered section — the state `sanitizePageBreaks`
 * exists to forbid.
 *
 * So the scrub stays, and is now explicit rather than a side effect of a cast.
 *
 * ⚠️ One deliberate difference from the five it replaced: they called
 * `syncSectionPlacement` **before** defaulting `order.twoColumn`, so a legacy
 * résumé with no `twoColumn` block threw on `order?.twoColumn.main` — the `?.`
 * guards `order`, not `twoColumn`. Defaulting first fixes that, and
 * `sectionPlacement.test.ts` pins it.
 */
export const applySectionPlacement = (resume: ResumeData, section: VisibilitySection): void => {
  const order = resume.meta.content.order;
  if (!order.twoColumn) {
    order.twoColumn = { main: [], sidebar: [] };
  }

  // A custom section keeps the column the user gave it; it is placed when
  // created and only leaves the order when it is removed.
  const placement = isSectionKey(section)
    ? syncSectionPlacement(resume, section)
    : isCustomSectionToken(section)
      ? { main: order.twoColumn.main, sidebar: order.twoColumn.sidebar }
      : {
          main: order.twoColumn.main.filter((id) => id !== section),
          sidebar: order.twoColumn.sidebar.filter((id) => id !== section),
        };

  order.twoColumn.main = placement.main;
  order.twoColumn.sidebar = placement.sidebar;

  resume.meta.content.pageBreaks = sanitizePageBreaks(resume);
};
