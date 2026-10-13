import { THEME_LAYOUTS, resolveThemeId } from '@/components/preview/themeIds';
import type { ResumeData, ResumeMeta } from '@/types/resume';
import { ALL_SECTION_KEYS, type SectionKey } from '@/utils/layout/constants';

/**
 * Checks whether the theme a stored name resolves to is 2-column.
 *
 * Reads `THEME_LAYOUTS` directly rather than a hand-kept list of two-column
 * ids. `themeIds.ts` exists so this import does not close the cycle
 * `ThemeRegistry.ts:8 → themes/shared → shared/layout.ts →
 * utils/layoutMetadata → predicates`.
 *
 * ⚠️ **The question is about the RESOLVED theme, not the stored string.**
 * This used to lowercase the name and look it up, which is a *different*
 * normalisation from the one `getThemeMeta` uses to choose the component — and
 * a name that is not an exact id renders lunar. So `'Timeless'` answered
 * `false` here while lunar (two-column) was on screen, and the CV rendered with
 * no sections at all. See `resolveThemeId` for the measurement.
 *
 * ⚠️ `!themeName` no longer needs its own arm: `resolveThemeId` maps an absent
 * name to `DEFAULT_THEME`, which is what an absent name renders. Returning
 * `false` for it was the same disagreement one input over.
 */
export const isTwoColumnTheme = (themeName?: string): boolean =>
  THEME_LAYOUTS[resolveThemeId(themeName)] === 'two-column';

/**
 * Narrows an arbitrary key to one of the twelve résumé sections.
 *
 * Reads `ALL_SECTION_KEYS` rather than restating the twelve, so a section added
 * there is covered here with no edit — which is the whole point. It
 * replaced `LayoutManagedSection`, a hand-written twelve-member union that every
 * use site *cast* to and which therefore enforced nothing in either direction.
 *
 * One caller is `applySectionPlacement` in `store/resume/utils.ts`: its
 * `section` arrives as `VisibilitySection`, which is
 * `SectionKey | 'profiles' | 'basics:image'` — so `profiles` and `basics:image`
 * reach it and `basics`, `coverLetter` and `meta` no longer can. The other two
 * callers are the layout editors (`OneColumnLayoutEditor`,
 * `useTwoColumnLayoutEditor`), where `sectionId` is a bare `string` off the
 * rendered order and this predicate replaced an `as VisibilitySection` cast.
 *
 * ⚠️ **Do not read this as "the non-section keys are no-ops".** An earlier draft
 * of this comment said so, on the grounds that the stored order can only hold
 * the twelve because `sanitizeResumeData` whitelists it — which is false, and
 * `themes/shared/sections.ts` says so two files away: the whitelist runs on the
 * `setResume` paths only, and `persist` rehydration does not run it. A stale
 * `'profiles'` in `meta.content.order.twoColumn` is reachable and used to be
 * scrubbed on the next visibility toggle. `applySectionPlacement` keeps that
 * scrub explicitly; see its docblock.
 */
export const isSectionKey = (sectionKey: string): sectionKey is SectionKey =>
  (ALL_SECTION_KEYS as readonly string[]).includes(sectionKey);

/**
 * Checks if a specific section key exists in the resume data.
 *
 * ⚠️ **No `'basics'` special case, and its removal is a behaviour change on one
 * input.** Both this function and `sectionHasRenderableContent` used to
 * open with `if ((sectionKey as string) === 'basics') return true` — a line that
 * only makes sense for a value the parameter type forbids, and the four callers
 * that could supply one all cast a raw string off `meta.content.order` to get
 * there. Those casts are now `isSectionKey` narrowings, so `'basics'` cannot
 * arrive; the branch would be dead, and a dead branch that reads as live is the
 * defect this module was written to remove.
 *
 * ⚠️ It really was reachable, and `'basics'` was the **only** stale order entry
 * that survived. Measured before the change: with
 * `order.oneColumn = ['profiles', 'work', '__proto__', 'not_a_section', 'basics',
 * 'constructor']`, the two-column filter returned `['work', 'basics']` —
 * every other non-section key is dropped by the length check, and `'basics'`
 * passed on this branch alone. It then reached eleven of the twelve serializers'
 * section dispatch typed `SectionKey`, which excludes it, so their docblocks
 * claiming the getters "can only yield the twelve `ResumeData` sections" were
 * false for exactly this value.
 *
 * ⚠️ **THIS WAS A LIVE, USER-VISIBLE DEFECT, AND THE FIRST WRITE-UP CALLED IT
 * LATENT ON THE STRENGTH OF AN ORACLE THAT COULD NOT SEE IT.** Both reviewer
 * passes found that independently. The reasoning was: injecting `'basics'` into
 * the orders gives byte-identical Typst markup and `renderToStaticMarkup` output
 * on all twelve themes, so nothing moves. The measurement is correct; the
 * inference is not, because the damage is not in the section dispatch. It is in
 * the **page-break state**:
 *
 * `getSortedSectionsForOneColumn` also feeds `getFirstRenderedSection`, whose
 * answer is what `sanitizePageBreaks` uses to strip the forbidden break on the
 * first rendered section. With `'basics'` at the head of a stored order,
 * `firstOne` became `'basics'` — so the break on the section that genuinely
 * renders first **survived**, persisted (that pass runs on
 * `onRehydrateStorage`), and the serializers emitted `#pagebreak()` before the
 * first section: a blank leading page in the PDF. Measured on both commits, same
 * fixture: `sanitizePageBreaks().oneColumn` was `['work']` before and `[]` after.
 *
 * ⚠️ This is the exact trap `layout.test.ts`'s `about`/`contact` block already
 * documents about this same oracle — *"the measurement rules out the other
 * half"*. Pinned properly in `store/resume/__tests__/pageBreaks.test.ts`, which
 * is the assertion that was missing.
 */
export const sectionExists = (sectionKey: SectionKey, data: ResumeData): boolean => {
  const items = data[sectionKey as keyof ResumeData];
  return Array.isArray(items) && items.length > 0;
};

/**
 * Checks if a section is both existing in data and NOT hidden in metadata.
 *
 * See `sectionExists` above for why there is no `'basics'` arm.
 */
export const sectionHasRenderableContent = (
  sectionKey: SectionKey,
  data: ResumeData,
  meta: ResumeMeta,
): boolean => {
  if (!sectionExists(sectionKey, data)) return false;

  const isHidden = meta.content.hiddenSections?.includes(sectionKey);
  return !isHidden;
};
