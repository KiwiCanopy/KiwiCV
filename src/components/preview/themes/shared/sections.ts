import { isTwoColumnLayout } from '@/components/preview/themes/shared/layout';
import type { ResumeData, ResumeMeta, ResumeSectionItem } from '@/types/resume';
import { type LayoutMode, applyVariant } from '@/utils/componentVariants';
import type { SectionKey as DataSectionKey } from '@/utils/layout/constants';
import type { LayoutSectionId } from '@/utils/layout/customSections';
import {
  getRenderableTwoColumnSections,
  getSortedSectionsForOneColumn,
} from '@/utils/layoutMetadata';
import { isImageVisible, visibleSections } from '@/utils/visibility';

/**
 * Everything a theme can put a section **header** on: the twelve data sections,
 * plus two the themes synthesise rather than read from `ResumeData` — `about`
 * (the basics summary) and `contact` (the basics contact block).
 *
 * ⚠️ **`SectionLabelKey`, renamed from `SectionKey`.** It was a second
 * exported type of that name meaning a *different set*, which forced this file to
 * alias the canonical one to `DataSectionKey` to be able to mention it at all —
 * and left every reader of a `SectionKey` annotation under `themes/` having to
 * check which module it came from. The set it denotes is unchanged, and so are
 * the label semantics; only the name moved. The sole consumers
 * are `ThemeTranslations.sections`, `getSectionLabels`, `DEFAULT_SECTION_LABELS`
 * and the twelve themes' `labels: Record<…, string>` — i.e. label maps, which is
 * what the new name says.
 *
 * ⚠️ The `export const SectionKey = undefined` that sat here is gone too. Its
 * comment claimed it was needed "to satisfy strict ESM loaders"; nothing imported
 * it as a value, and deleting it costs zero errors under `tsc -b` and a
 * production build.
 *
 * ⚠️ **Ten `labels[id as SectionKey]` casts across six theme HTML files, and all
 * ten are now gone.** `id` already arrives as a `DataSectionKey` from the section
 * getters and the label map is keyed on the *wider* union, so nine of them
 * narrowed nothing. The tenth, Elegant's, was load-bearing only because its
 * `renderSection` took a bare `string` — a signature the first sweep chose not to
 * touch, not an irreducible boundary. Narrowing that parameter to `SectionKey`
 * removed the last cast and closed the same `TS2678` hole the getters close elsewhere.
 * ⚠️ Two earlier drafts of this line were wrong: "five of six casts" conflated
 * files with casts, and "Elegant's is real" described a choice as a constraint.
 * Recount before quoting.
 *
 * ⚠️ **They are labels, not sections, and they are not "the two-column
 * sidebars".** This said so for two rounds and it is wrong three ways, measured
 * from the call sites: soft emits **both** in its *main* column, swiss-grid puts
 * `contact` in the sidebar and `about` in the *main* column, and **timeless is
 * one-column** and reads `labels.about` in both its outputs. Only lunar matches
 * the old description. Three themes render a synthesised About (soft,
 * swiss-grid, timeless) and three a synthesised Contact (soft, swiss-grid,
 * lunar); the rest render neither.
 *
 * ⚠️ Because `ResumeData` has no `about` or `contact` array, `sectionExists`
 * rejects them and no section getter can ever yield them — so a dispatch arm for
 * either is dead code. Ten such arms had accumulated across six serializers
 * before the getters were narrowed. They return `DataSectionKey[]` now, so writing one is
 * `TS2678`.
 *
 * The wider union is meaningful; the *restatement* was not. Deriving the twelve
 * from `ALL_SECTION_KEYS` (the canonical inventory) means a section added
 * there widens this automatically, and `Record<SectionLabelKey, string>` — chiefly
 * `DEFAULT_SECTION_LABELS` in `translations.ts` — turns a missing label into a
 * build error instead of a header reading `privateProjects`. (That read
 * `Record<SectionKey, string>` until the rename; a stale name inside the docblock
 * whose own subject is the rename.)
 *
 * This does not reintroduce the old import cycle. `constants.ts` no longer
 * imports nothing — its first line is a `TwoColumnThemeId`
 * import — but that import is **type-only** and its target, `themeIds.ts`, is
 * itself a leaf with no imports at all, so no edge is added at runtime.
 */
// `customSection` heads a user-defined section left untitled.
export type SectionLabelKey = DataSectionKey | 'about' | 'contact' | 'customSection';

/**
 * Get all visible items for all sections in the resume data.
 */
export function getVisibleData(data: ResumeData) {
  return {
    ...visibleSections(data),
    imageVisible: isImageVisible(data.meta?.content?.hiddenIds || []),
  };
}

/**
 * Both two-column columns, for a theme that renders them side by side. Falls
 * back to two empty arrays when the meta is not a two-column layout.
 *
 * ⚠️ **This replaces `getMainSections` and `getSideSections`, and the
 * reason is not the halved work.** Those two were separate functions that had to
 * agree, each calling one shared computation and discarding half of it — the "N
 * copies of one rule" shape this repo keeps collapsing. Every one of the twelve
 * production call sites (six two-column themes × HTML component + serializer)
 * had the two calls on *adjacent lines*, so nothing wanted them apart. An earlier
 * note that deduplicating the shared work "needs a cache keyed on object
 * identity, with its own invalidation question" was wrong for exactly that
 * reason: adjacent callers need no cache.
 *
 * ⚠️ **The `isTwoColumnLayout` gate is folded back in here.** It was once moved out
 * of the callee and into the two callers, leaving `getRenderableTwoColumnSections`
 * willing to return filtered two-column arrays for a one-column meta — a function
 * whose name promises a condition it does not check.
 *
 * ⚠️ That was **latent, not live**, and an earlier draft of this line called it a
 * live hazard. At the time the ungated callee had exactly two callers and *both*
 * gated, so nothing could reach it wrongly. A hazard shape and a live defect are
 * different claims and this branch spent a round on the difference. Found by the
 * code-reviewer pass. That is precisely the shape that left
 * `filterLayoutMetadataByData`'s one-column branch dead code for several rounds
 * with nobody noticing. One gate, in one function, in the presentation layer;
 * `utils/layout/getters.ts` stays free of it.
 *
 * ⚠️ **`DataSectionKey[]`, not `string[]` — this narrowing is the guard.**
 *
 * Every section dispatch in the twelve themes is driven by one of these three
 * getters, and every one of them ends at a length check on `data[key]`. So a key
 * with no array on `ResumeData` can never come out — which is what made ten
 * `case 'about':` / `case 'contact':` arms across six serializers dead code,
 * and what still makes the `id === 'profiles'` feeders dead in swiss-grid
 * and timeless.
 *
 * ⚠️ **They do not all gate on the same predicate** — this said they all routed
 * through one function for two rounds, and they never did.
 * `getOneColumnSections` calls `getSortedSectionsForOneColumn` and gates on
 * `sectionExists` (no `hiddenSections` check); the two two-column getters call
 * `getRenderableTwoColumnSections` and gate on `sectionHasRenderableContent`
 * (which does check). The hidden-section difference is real and load-bearing —
 * `emptySections.test.ts` depends on it.
 *
 * Returning `string[]` meant nothing said so at the call sites: a dispatch arm
 * for an impossible key compiled, ran never, and read as live. Narrowed, both
 * shapes are build errors — `TS2367` on a comparison that can never be true, and
 * `TS2678` on a `switch` arm outside the union. Found by a review pass,
 * which located two surviving instances the key-name search had missed.
 *
 * The runtime boundary is the predicate, not a cast: the stored order is
 * arbitrary JSON, and `sanitizeResumeData` filters it against `ALL_SECTION_KEYS`
 * only on the `setResume` paths. ⚠️ `persist` rehydration does **not** run it, so
 * these filters are the sole gate on the common path — which is exactly why they
 * are the thing the guard in `utils/__tests__/layout.test.ts` pins.
 *
 * ⚠️ **This claim was once FALSE for one value, and the defect was LIVE.**
 * `sectionExists` opened with `if ((sectionKey as string) === 'basics') return
 * true`, so a stored `'basics'` passed the gate and arrived here typed
 * `DataSectionKey`, which excludes it — measured: an order of `['profiles',
 * 'work', '__proto__', 'not_a_section', 'basics', 'constructor']` filtered to
 * `['work', 'basics']`.
 *
 * ⚠️ The first write-up called that latent because the Typst markup and the
 * `renderToStaticMarkup` output are byte-identical with and without it on all
 * twelve themes. True, and the wrong oracle: the damage was in the **page-break
 * state**, not the dispatch. `getSortedSectionsForOneColumn` also feeds
 * `getFirstRenderedSection`, so `'basics'` at the head of an order became "the
 * first rendered section" and the break on the genuinely first one survived
 * sanitization — a `#pagebreak()` before the first section, i.e. a blank leading
 * page, persisted. See `sectionExists`'s docblock and
 * `store/resume/__tests__/pageBreaks.test.ts`.
 *
 * ⚠️ **All three getters are compiler-held now, and the reason the two
 * two-column ones were not is not the reason this docblock gave.** It said they
 * "cannot cheaply be", because they read the order back off a `ResumeMeta` whose
 * `order` fields are `string[]` by design. True of `ResumeMeta`, and beside the
 * point: the narrowed arrays already existed inside `filterLayoutMetadataByData`
 * — its `isRenderable` computes exactly them — and were discarded by being
 * stored into a `string[]` structure and read back. The obstacle was a function
 * whose only two callers want two arrays returning a whole `ResumeMeta`.
 * `getRenderableTwoColumnSections` returns them; `ResumeMeta` and the store's
 * order writers are untouched.
 *
 * ⚠️ That does not retire `layout.test.ts`'s stale-key-**with-data** fixture. A
 * `SectionKey[]` return type stops the narrowing being *widened* — measured,
 * reverting it to `string[]` is `TS2322` at both getters — and says nothing
 * about the predicate inside still filtering, which is the runtime boundary.
 * Both reviewer passes showed the original fixture caught neither.
 *
 * ⚠️ Nor does it make a dead dispatch arm a build error where it was not: all
 * twelve `serializeSection` parameters were narrowed by round seventeen, so
 * `case 'about':` is already `TS2678` everywhere. Re-checked rather than
 * inherited.
 */
export function getTwoColumnSections(
  meta: ResumeMeta | undefined,
  data?: ResumeData,
): { main: LayoutSectionId[]; sidebar: LayoutSectionId[] } {
  if (!meta || !isTwoColumnLayout(meta) || !data) {
    return { main: [], sidebar: [] };
  }
  return getRenderableTwoColumnSections(meta, data);
}

/**
 * Get sections to render for 1-column layout.
 * Delegates to `getSortedSectionsForOneColumn`: the stored order first, then
 * any section with data that the stored order is missing, in theme-default
 * order. Empty sections are dropped.
 */
export function getOneColumnSections(
  meta: ResumeMeta | undefined,
  data: ResumeData,
): LayoutSectionId[] {
  if (!meta) {
    return [];
  }
  // ⚠️ **No cast, unlike the two above.** `getSortedSectionsForOneColumn`
  // returns `SectionKey[]` now, so on this path the docblock's claim is a
  // *proof* rather than an assertion — reintroducing an `as` inside that function
  // is `TS2322`. The two-column getters still cast, because they read the order
  // back off a `ResumeMeta` whose `order` fields are `string[]` by design; there
  // the claim rests on the runtime `isSectionKey` filter and on `layout.test.ts`.
  return getSortedSectionsForOneColumn(meta, data);
}

/**
 * Apply layout mode variant transformation to section items
 * This hides/shows fields based on whether they're in main or side column
 */
export function applyLayoutVariant<T extends ResumeSectionItem>(
  items: T[],
  sectionKey: string,
  layoutMode: LayoutMode,
): T[] {
  return applyVariant(items, sectionKey, layoutMode) as T[];
}
