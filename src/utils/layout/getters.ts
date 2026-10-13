import { isTwoColumnThemeId, resolveThemeId } from '@/components/preview/themeIds';
import type { ResumeData, ResumeMeta } from '@/types/resume';
import {
  ALL_SECTION_KEYS,
  DEFAULT_SECTION_ORDER,
  TWO_COLUMN_THEME_DEFAULTS,
} from '@/utils/layout/constants';
import {
  type LayoutSectionId,
  allLayoutSectionIds,
  customSectionToken,
  isLayoutSectionId,
  layoutSectionExists,
  layoutSectionRenderable,
} from '@/utils/layout/customSections';
import { isTwoColumnTheme } from '@/utils/layout/predicates';
import { migrateToNewLayoutStructure } from '@/utils/layout/structure';

/**
 * Generates the default 2-column layout for the theme a stored name resolves to.
 * Falls back to the generic major/minor split for a one-column theme.
 *
 * ⚠️ **`resolveThemeId`, not a second normalisation of its own.** This
 * did `themeName?.toLowerCase().replace(/-/g, '_')` while `isTwoColumnTheme`
 * did only the lowercasing and `getThemeMeta` — which picks the component that
 * is actually rendered — did neither. Three normalisations of one string, and
 * `'swiss-grid'` (folder `swiss-grid`, id `swiss_grid`) got swiss_grid's
 * two-column defaults here, `false` from the predicate, and lunar on screen.
 * See `resolveThemeId` for what that cost.
 *
 * ⚠️ The consequence for *this* function is that a name outside the inventory
 * now yields the **default theme's** defaults rather than the generic split,
 * because the default theme is what such a name renders. For every exact id —
 * which is every name the app itself writes — `resolveThemeId` is the identity
 * and nothing changes.
 */
export const getDefaultTwoColumnLayout = (
  themeName?: string,
): { main: string[]; sidebar: string[] } => {
  const normalizedThemeName = resolveThemeId(themeName);

  const completeLayout = (layout: { main: string[]; sidebar: string[] }) => {
    const main = Array.from(new Set(layout.main));
    const sidebar = Array.from(
      new Set(layout.sidebar.filter((section) => !main.includes(section))),
    );
    const seen = new Set([...main, ...sidebar]);
    const missing = ALL_SECTION_KEYS.filter((section) => !seen.has(section));

    return {
      main: [...main, ...missing],
      sidebar,
    };
  };

  // This is the gate that decides one column from two. It used to be
  // `Object.hasOwn(TWO_COLUMN_THEME_DEFAULTS, …)` followed by an
  // `as TwoColumnThemeId`, because a `hasOwn` call cannot narrow — the two
  // prototype keys that survive a lowercasing, `'constructor'` and `'__proto__'`,
  // once reached here and *threw* on `[...defaults.main]` with
  // `defaults.main is not iterable`, which is why it is not a truthiness check on
  // the lookup. `resolveThemeId` has made the name a `ThemeId` since then, and
  // `isTwoColumnThemeId` narrows it the rest of the way off
  // `THEME_LAYOUTS` — the same key set `Record<TwoColumnThemeId, …>` gives this
  // map, so the question is unchanged and the cast is gone. Pinned in
  // `layout.test.ts`.
  if (isTwoColumnThemeId(normalizedThemeName)) {
    const defaults = TWO_COLUMN_THEME_DEFAULTS[normalizedThemeName];
    return completeLayout({
      main: [...defaults.main],
      sidebar: [...defaults.sidebar],
    });
  }

  return completeLayout({
    main: ['work', 'education', 'publications', 'projects', 'privateProjects'],
    sidebar: ['certificates', 'references'],
  });
};

/**
 * Returns the default 1-column layout for a theme.
 *
 * ⚠️ **`themeName` is REQUIRED, and the optional form was a live trap.**
 * A change made `isTwoColumnTheme(undefined)` answer `true` — an
 * absent name renders `DEFAULT_THEME`, which is two-column — so a no-argument
 * call stopped returning `DEFAULT_SECTION_ORDER` and started returning lunar's
 * two-column split, flattened. A different order, from a call that reads like a
 * forgotten argument.
 *
 * ⚠️ That change's commit message called dropping the old `themeName &&` guard a
 * deletion "measured identical", and that was **wrong as stated**: it is
 * identical only *together with* the `migration.ts` edit that made its one bare
 * call pass `newThemeName`. Neither edit is inert alone — restoring the bare
 * call fails a pre-existing `migrateLayoutMetadata` case. Both halves were made
 * and the result was measured, so nothing shipped broken; the description of it
 * was a co-change written up as a tidy. Found by the architect pass.
 *
 * Required rather than documented — the required-not-documented rule
 * (`.claude/rules/testing.md`): an optional parameter is the hazard, and
 * `TS2554` is the guard.
 */
export const getDefaultOneColumnLayout = (themeName: string): string[] => {
  if (isTwoColumnTheme(themeName)) {
    const defaults = getDefaultTwoColumnLayout(themeName);
    return [...defaults.main, ...defaults.sidebar];
  }
  return [...DEFAULT_SECTION_ORDER];
};

/**
 * Internal helper to deduplicate array while preserving order
 */
export const dedupeSections = (sections: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const section of sections) {
    if (seen.has(section)) continue;
    seen.add(section);
    result.push(section);
  }

  return result;
};

/**
 * Normalizes a 2-column layout so every renderable section appears once.
 */
export const normalizeTwoColumnLayout = (
  layout: { main: string[]; sidebar: string[] },
  data: ResumeData,
  meta: ResumeMeta,
): { main: string[]; sidebar: string[] } => {
  const main = dedupeSections(layout.main || []);
  const sidebar = dedupeSections(
    (layout.sidebar || []).filter((section) => !main.includes(section)),
  );

  // No cast: `ALL_SECTION_KEYS` is already the domain. The `as unknown as
  // string[]` this used to widen through was only there to make the `as
  // LayoutSectionKey` on the next line look necessary.
  const renderableSections: string[] = allLayoutSectionIds(data).filter((section) =>
    layoutSectionRenderable(section, data, meta),
  );
  const seen = new Set([...main, ...sidebar]);
  const missing = renderableSections.filter((section) => !seen.has(section));

  const defaults = getDefaultTwoColumnLayout(meta.theme.name);
  const missingMain: string[] = [];
  const missingSidebar: string[] = [];

  missing.forEach((section) => {
    if (defaults.sidebar.includes(section)) {
      missingSidebar.push(section);
    } else {
      missingMain.push(section);
    }
  });

  return {
    main: [...main, ...missingMain],
    sidebar: [...sidebar, ...missingSidebar],
  };
};

/**
 * The two two-column columns, **narrowed**, for `themes/shared/sections.ts`'s
 * `getTwoColumnSections`.
 *
 * ⚠️ **No `isTwoColumnLayout` gate here, deliberately.** The caller does it. That
 * is a presentation question — whether the *theme* lays out in two columns —
 * while this function answers a data question, and putting it here would drag
 * `themes/` into the layout layer. It does mean the name promises less than it
 * looks like it promises: hand it a one-column meta with a populated stored
 * two-column order and it will filter and return that order. Exactly one caller
 * exists and it gates (`twoColumnSections.test.ts` asserts both halves).
 *
 * ⚠️ **"Exactly one caller" is a fact, not a guard**, and the function stays
 * exported from the `layoutMetadata` barrel — so a second caller can be added
 * from anywhere with `tsc`, lint and the suite green, and it will get filtered
 * two-column arrays for a one-column meta. That is the shape that left
 * `filterLayoutMetadataByData`'s one-column branch dead for several rounds, cited
 * three paragraphs down. The repo's own move here is `store/resume/utils.ts`'s
 * *"Not exported, and that is the guard rather than tidiness"* — not free in this
 * case, because `layout.test.ts` imports it. Named rather than left implied.
 * Found by the architect pass.
 *
 * ⚠️ **The obstacle earlier docblocks named was the wrong one.** They said those
 * two getters cannot be compiler-held because they read the order back off a
 * `ResumeMeta` whose `order` fields are `string[]` by design. True of
 * `ResumeMeta`, and irrelevant: the narrowed arrays already existed inside
 * `filterLayoutMetadataByData` — its `isRenderable` computed exactly them — and
 * were thrown away by being stored into a `string[]`-typed structure and read
 * back out. The obstacle was a function whose only two callers wanted two arrays
 * returning a whole `ResumeMeta`. Nothing about `ResumeMeta` or the store's order
 * writers changes here. Found by the architect pass.
 *
 * ⚠️ **`filterLayoutMetadataByData` is deleted rather than kept beside this, and
 * re-deriving its consumers is what showed why.** Keep it only if
 * anything else needs a filtered `ResumeMeta`; nothing did. Its only production
 * callers were those two getters, and **its one-column branch was already
 * unreachable before this round** — the getters return `[]` unless
 * `isTwoColumnLayout(meta)`, so a one-column theme never reached it, and
 * `getSortedSectionsForOneColumn` (which gates on `sectionExists`, not on
 * `sectionHasRenderableContent`) is the live one-column path. Keeping it would
 * have left two functions applying one predicate four lines apart, which is this
 * repo's whole recurring bug shape.
 *
 * ⚠️ It is **not** a correctness fix, and the delta is smaller than first claimed.
 * Runtime behaviour has been right since an earlier change narrowed both columns with
 * `isSectionKey`, and a re-added dead dispatch arm was *already* `TS2678` in all
 * twelve themes — round seventeen narrowed the twelfth `serializeSection`
 * parameter, which is the "eleven rather than twelve" the first claim remembered.
 * Re-checked here rather than repeated: all twelve now read `sectionId:
 * SectionKey`.
 *
 * What this actually buys is one step: the narrowing at the two getters is the
 * **callee's return type** instead of an `as DataSectionKey[]` at the call site,
 * so widening it back is a build error rather than a silent assertion. Measured
 * — reverting this signature to `{ main: string[]; sidebar: string[] }` is
 * `TS2322` at both getters in `themes/shared/sections.ts`.
 *
 * ⚠️ **The deep clone: once two per render, now one.**
 * `migrateToNewLayoutStructure` opens with `JSON.parse(JSON.stringify(meta))`,
 * and the first step did not change the call count because each of its two getters called
 * this function. Counted by spying on `JSON.parse` across all twelve themes
 * before and after the merge: **2 → 1** for each of the six two-column
 * themes in *both* the HTML render and the serializer, and **0 → 0** for each of
 * the six one-column ones. It is not on any measurable hot path at résumé
 * scale — a full serialize is ~0.65 ms for a two-column theme against ~0.58 ms
 * for a one-column one, and that gap is the whole two-column layout, not the
 * clones. The halving is a consequence of the structure change, not its point.
 *
 * ⚠️ **"Deduplicating it needs a cache keyed on object identity" was wrong** —
 * all **12** `getMainSections` call sites had a `getSideSections` call on the
 * next line (re-derived rather than inherited), so the callers
 * already held both values at one point and one getter returning both needs no
 * cache and no invalidation question. Done, with the theme gate — which had
 * moved from the callee to the two callers — folded into the single survivor.
 */
export const getRenderableTwoColumnSections = (
  meta: ResumeMeta,
  data: ResumeData,
): { main: LayoutSectionId[]; sidebar: LayoutSectionId[] } => {
  const updated = migrateToNewLayoutStructure(meta);
  const order = updated.content.order;

  /**
   * ⚠️ `isSectionKey`, not a cast. The stored order is arbitrary JSON —
   * `sanitizeResumeData` whitelists it against `ALL_SECTION_KEYS` on the
   * `setResume` paths only, and `persist` rehydration runs `sanitizePageBreaks`
   * alone. So this predicate is the boundary, and an `as` here asserted a domain
   * nothing had established.
   *
   * ⚠️ **"No migration touches it" was false and the truth is stronger.** The
   * store's `persist` migrations genuinely never touch the order — but
   * `migrateToNewLayoutStructure` copies a legacy `content.sectionOrder` into
   * `order.oneColumn` **verbatim and unwhitelisted** (`structure.ts`), and it
   * runs on the line above. That is an in-app writer that can put an arbitrary
   * key into the order after any sanitization, which is what makes the boundary
   * real rather than theoretical. Found by the architect pass.
   */
  const isRenderable = (key: string): key is LayoutSectionId =>
    isLayoutSectionId(key, data) && layoutSectionRenderable(key, data, updated);

  return {
    main: (order.twoColumn.main || []).filter(isRenderable),
    sidebar: (order.twoColumn.sidebar || []).filter(isRenderable),
  };
};

/**
 * Merges a custom section order with a theme's default order so that every
 * section key appears exactly once. Priority: custom order, then the theme
 * default, then any remaining key from `ALL_SECTION_KEYS` — the last tier only
 * contributes when `defaultOrder` is itself partial, which the theme getters
 * never produce but callers may.
 *
 * A stored order may be a **subset** of the sections that have data: the
 * one-column layout editor persists only the sections that existed when the
 * user reordered them, so anything filled in afterwards is missing from it.
 * Appending the leftovers is what keeps those sections renderable.
 */
export const getEffectiveSectionOrder = (
  customOrder: string[] | undefined,
  defaultOrder: string[],
): string[] => {
  const baseOrder = customOrder && customOrder.length > 0 ? customOrder : defaultOrder;

  return dedupeSections([...baseOrder, ...defaultOrder, ...ALL_SECTION_KEYS]);
};

/**
 * Sorts sections for 1-column rendering.
 *
 * Sections missing from the stored order are appended rather than dropped —
 * see `getEffectiveSectionOrder`.
 *
 * ⚠️ **A cast site the original sweep did not list, found by re-deriving the
 * scope rather than reading it.** Counted before the fix, the two predicates were fed through
 * **eight** casts — seven outside `predicates.ts` plus one internal — in
 * **three** distinct spellings:
 *
 * - `as LayoutSectionKey` — four sites, all in this file. The only ones the sweep
 *   named, because it searched for that spelling.
 * - `as SectionKey` — three sites: this function, `EmptySectionsGrid`, and
 *   `sectionHasRenderableContent`'s own internal call.
 * - `as Parameters<typeof sectionExists>[0]` — one site, `OneColumnLayoutEditor`.
 *
 * So scoping the sweep by the cast's spelling would have missed half of them,
 * which is the scope-by-property rule (`.claude/rules/testing.md`) broken again.
 * ⚠️ The first draft of this comment said "four spellings" and "seven sites";
 * both were wrong, from counting files as casts. Recount before quoting.
 *
 * ⚠️ **`SectionKey[]`, not `string[]`, and that return type is the only part of
 * that sweep the compiler can hold.** `getOneColumnSections` used to launder this
 * through `as DataSectionKey[]` — the cast its own docblock called "where the
 * runtime boundary actually is" — so the boundary was an assertion about a
 * `string[]` rather than a proof. Narrowed here, that cast is gone and a revert to
 * `effectiveOrder.filter((s) => sectionExists(s as SectionKey, data))` is
 * `TS2322`: a `string[]` is not a `SectionKey[]`, and `isSectionKey` is the only
 * way to get one without a second cast on the result.
 *
 * ⚠️ The two-column columns get the same protection now, from
 * `getRenderableTwoColumnSections`. This said they could not, because they
 * were read back off a `ResumeMeta` whose `order` fields are `string[]` by design
 * — a true statement about `ResumeMeta` and the wrong diagnosis: the narrowed
 * arrays already existed inside the filter and were being discarded by a round
 * trip through that structure. `ResumeMeta` and the store's order writers are
 * unchanged.
 *
 * ⚠️ **They are held by a test, and the first draft of that test held nothing.**
 * Reverting all of these narrowings to casts left the entire suite green, because
 * every key in the guard's fixture had no array on `ResumeData` and so was dropped
 * by `sectionExists`'s length check either way — the narrowing was never the thing
 * under test. Both reviewer passes found it. `layout.test.ts` now gives one stale
 * key a **non-empty array**, which only the narrowing can stop, and that revert
 * fails. ⚠️ The earlier claim that this was "caught by the `'basics'` case" was
 * false in both halves: that case cannot fire once the `'basics'` arm is deleted.
 */
export const getSortedSectionsForOneColumn = (
  meta: ResumeMeta,
  data: ResumeData,
): LayoutSectionId[] => {
  // Custom sections not yet in the stored order follow the built-in ones.
  const effectiveOrder = dedupeSections([
    ...getEffectiveSectionOrder(
      meta.content.order?.oneColumn,
      getDefaultOneColumnLayout(meta.theme?.name),
    ),
    ...(data.customSections ?? []).map((section) => customSectionToken(section.id)),
  ]);

  return effectiveOrder.filter(
    (s): s is LayoutSectionId => isLayoutSectionId(s, data) && layoutSectionExists(s, data),
  );
};
