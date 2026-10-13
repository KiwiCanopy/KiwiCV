/**
 * The theme inventory, with **no imports at all**.
 *
 * `ThemeRegistry.ts` is the natural home for this list and cannot be the one
 * that publishes it: anything under `utils/layout/` that asked the registry
 * which layout a theme uses would close a cycle.
 *
 * ⚠️ The short route is the one that matters, and it is **not** through the
 * twelve `*HTML.tsx` components — `ThemeRegistry.ts:8` alone closes it:
 *
 *     ThemeRegistry.ts  →  themes/shared (barrel)  →  shared/layout.ts
 *       →  utils/layoutMetadata (barrel)  →  utils/layout/predicates.ts
 *
 * Worth stating precisely, because the component route invites a fix that does
 * nothing: lazy-loading the theme components would not break this.
 *
 * Splitting the two component-free facts out does break it. Consumers that
 * only need to know *which themes exist* or *how one is laid out* import this
 * module and drag nothing; the registry imports it and stays the place where
 * ids, components and metadata are bound together.
 */

/**
 * The canonical theme inventory.
 *
 * Several structures are keyed by theme and have to stay in step —
 * `ThemeRegistry`, `SERIALIZERS` in `ThemeSerializers.ts`, `THEME_LAYOUTS`
 * below, and `TWO_COLUMN_THEME_DEFAULTS`. They were each typed
 * `Record<string, …>`, which made every kind of drift between them a runtime
 * surprise rather than a compile error: a theme added to the registry with no
 * serializer stays selectable and renders in the HTML preview, but has **no
 * PDF at all** — `Viewer.tsx` takes the `hasSerializer` path and even
 * suppresses retry.
 *
 * The list below is the single declaration; `ThemeId` is derived from it, and
 * the keyed maps are then `Record<ThemeId, …>`. That moves both drift
 * directions to the type checker, because exhaustiveness is verified at the
 * *definition* site: adding an id here without a serializer fails the build,
 * and so does a serializer for an id that is not here. The array form also
 * gives tests a typed inventory to iterate without a cast — the same shape as
 * `ALL_SECTION_KEYS` for the section-key family.
 */
export const ALL_THEME_IDS = [
  'elegant',
  'foggy',
  'javascript',
  'lunar',
  'misty',
  'plain',
  'plain2',
  'skyline',
  'soft',
  'stackoverflow',
  'swiss_grid',
  'timeless',
] as const;

export type ThemeId = (typeof ALL_THEME_IDS)[number];

export type ThemeLayout = 'one-column' | 'two-column';

/**
 * Which column structure each theme renders in.
 *
 * `ThemeRegistry` carries the same fact on `ThemeMeta.layout`, and the two
 * cannot drift: `ThemeRegistryMap` types that field as
 * `(typeof THEME_LAYOUTS)[K]`, so an entry disagreeing with this table is a
 * build error at the registry's own definition site.
 *
 * ⚠️ `as const satisfies`, never a plain annotation. `Record<ThemeId, ThemeLayout>`
 * as an annotation widens every value to the full union, so
 * `(typeof THEME_LAYOUTS)[K] extends 'two-column'` is false for **every** key
 * and `TwoColumnThemeId` below collapses to `never` — not to `ThemeId`, which
 * would at least be loud. `Record<never, …>` is satisfied by `{}`, so
 * `TWO_COLUMN_THEME_DEFAULTS` would compile empty and the test iterating it
 * would run zero cases, green. Verified by compiling the annotated variant.
 */
export const THEME_LAYOUTS = {
  elegant: 'one-column',
  foggy: 'two-column',
  javascript: 'one-column',
  lunar: 'two-column',
  misty: 'two-column',
  plain: 'one-column',
  plain2: 'one-column',
  skyline: 'two-column',
  soft: 'two-column',
  stackoverflow: 'one-column',
  swiss_grid: 'two-column',
  timeless: 'one-column',
} as const satisfies Record<ThemeId, ThemeLayout>;

/**
 * The two-column ids, derived rather than re-listed.
 *
 * `utils/layout/constants.ts` used to hold a hand-written `TWO_COLUMN_THEMES`
 * array beside `TWO_COLUMN_THEME_DEFAULTS`, which is the third copy of the
 * theme inventory and the one nothing could compile-check: a subset cannot be
 * a `Record<ThemeId, …>`. Deriving it makes `Record<TwoColumnThemeId, …>` a
 * real guard — a missing key is `TS2741`, an extra one `TS2353`.
 */
export type TwoColumnThemeId = {
  [K in ThemeId]: (typeof THEME_LAYOUTS)[K] extends 'two-column' ? K : never;
}[ThemeId];

/**
 * The theme a stored `meta.theme.name` actually resolves to.
 *
 * ⚠️ **This is the one normalisation, replacing three that disagreed —
 * but "the one" was FALSE when it was first written here, and the correction is
 * the useful part.** The fix routed `getThemeMeta`, `isTwoColumnTheme` and
 * `getDefaultTwoColumnLayout` through this function and declared the invariant
 * held. It did not: two more readers compared the **raw** stored name, and the
 * architect pass found both. `iconSerializer.ts` matched four theme literals and
 * so painted every icon with the caller's fill on any non-exact name — `#1a1a2e`
 * on lunar, which is its own dark sidebar, i.e. the icons vanished — and three of
 * twelve theme roots handed the raw name to `resolveHTMLFontStack`, so a résumé
 * stored as `'Elegant'` rendered elegant in Inter instead of its serif face.
 * Both are fixed, and `__tests__/themeNameReaders.test.ts` is what makes the
 * claim true by construction rather than by three call sites agreeing: it
 * requires every module mentioning `meta.theme.name` to mention a resolver.
 * **Routing N known callers through one helper is not the same as owning the
 * invariant, and this docblock asserted the second having done the first.**
 * `getThemeMeta` picked the component with `Object.hasOwn(ThemeRegistry, name)`
 * and fell back to `DEFAULT_THEME`; `isTwoColumnTheme` did
 * `name.toLowerCase()`; `getDefaultTwoColumnLayout` did
 * `name.toLowerCase().replace(/-/g, '_')`. The defect was first framed as a
 * hyphen disagreement about `swiss-grid` (folder `swiss-grid`, id `swiss_grid`,
 * a trap `THEME_SYSTEM.md` documents), and it is much worse than that.
 *
 * Measured — **any** stored name that is not an exact id rendered
 * an **empty CV**. The component falls back to lunar, which is two-column, while
 * `isTwoColumnTheme` answered `false`, so `getTwoColumnSections` returned two
 * empty columns and lunar rendered its chrome and nothing else: markup dropped
 * from 18032 characters to 4857 with `main` and `sidebar` both `[]`, for
 * `'swiss-grid'`, `'Swiss-Grid'` and `'zzz'` alike. The cases that worked did so
 * by luck — `'Lunar'` lowercases to a two-column id *and* falls back to a
 * two-column theme, so both answers agreed; `'Timeless'` lowercases to a
 * one-column id and falls back to two-column lunar, and rendered nothing.
 *
 * So the rule is not "tolerate hyphens" or "tolerate case". It is that every
 * question about a stored theme name must be answered about **the theme that
 * will actually be rendered**. Resolve first, then ask.
 *
 * ⚠️ `Object.hasOwn`, not a truthiness check: the name is arbitrary JSON off
 * persisted state, and `'constructor'` and `'__proto__'` are the two
 * `Object.prototype` keys that survive a lowercasing (the rest do not) — the
 * plain lookup resolved them to an inherited `Function` and to
 * `Object.prototype`, which threw `defaults.main is not iterable` in
 * `getDefaultTwoColumnLayout`.
 *
 * Lives here rather than in `ThemeRegistry.ts` because `utils/layout/` needs it
 * and the registry import would close the cycle this module exists to break.
 */
export const DEFAULT_THEME: ThemeId = 'lunar';

/**
 * Narrows a stored or imported theme name to a known id.
 *
 * ⚠️ **`Object.hasOwn`, not a truthiness check on the lookup.** The name is
 * arbitrary JSON off persisted state, and every one of `Object.prototype`'s own
 * property names resolves to an inherited, truthy value — see `resolveThemeId`
 * for what `'constructor'` and `'__proto__'` cost.
 *
 * ⚠️ **Declared here rather than in `ThemeRegistry.ts`, which is where it used
 * to live.** That copy was keyed on `ThemeRegistry` and this file already
 * held a second membership test, written inline inside `resolveThemeId` and
 * keyed on `THEME_LAYOUTS` — two spellings of one rule, and `utils/layout/`
 * could not reach the registry's without closing the cycle this module exists to
 * break. The two key sets never could disagree (both are `Record<ThemeId, …>`),
 * so this is not a bug fix; what it buys is that `resolveThemeId` no longer
 * needs an `as ThemeId`, because a predicate narrows where a `hasOwn` call does
 * not. The registry re-exports this one.
 */
export const isThemeId = (value: string | undefined): value is ThemeId =>
  !!value && Object.hasOwn(THEME_LAYOUTS, value);

/**
 * Narrows a known id to one of the six two-column themes.
 *
 * The counterpart `utils/layout/` was missing: `isTwoColumnTheme` answers a
 * `boolean` about an arbitrary *string*, which cannot narrow, so both callers
 * that then index `TWO_COLUMN_THEME_DEFAULTS` reached for
 * `as TwoColumnThemeId`. `Record<TwoColumnThemeId, …>` means that map and
 * `THEME_LAYOUTS`'s two-column entries have the same key set by construction, so
 * reading the layout table answers the question the cast was asserting.
 *
 * ⚠️ **The equality is what makes the raw index safe, not the parameter type.**
 * `THEME_LAYOUTS['constructor']` and `['__proto__']` resolve to inherited,
 * *truthy* values, so `!!THEME_LAYOUTS[themeId]` would answer `true` for both —
 * that is the mutation which breaks this line. `=== 'two-column'` answers
 * `false`, which is why this needs no `Object.hasOwn` where `isThemeId` above
 * does. The architect pass flagged that note as sitting on the wrong function.
 */
export const isTwoColumnThemeId = (themeId: ThemeId): themeId is TwoColumnThemeId =>
  THEME_LAYOUTS[themeId] === 'two-column';

export const resolveThemeId = (themeName?: string): ThemeId =>
  isThemeId(themeName) ? themeName : DEFAULT_THEME;
