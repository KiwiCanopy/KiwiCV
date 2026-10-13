import {
  DEFAULT_THEME,
  THEME_LAYOUTS,
  type ThemeId,
  type ThemeLayout,
  resolveThemeId,
} from '@/components/preview/themeIds';
import type { ThemePaletteIds } from '@/components/preview/themePaletteIds';
import { ElegantHTML } from '@/components/preview/themes/oneColumn/elegant/ElegantHTML';
import { JavaScriptHTML } from '@/components/preview/themes/oneColumn/javascript/JavaScriptHTML';
import { Plain2HTML } from '@/components/preview/themes/oneColumn/plain2/Plain2HTML';
import { PlainHTML } from '@/components/preview/themes/oneColumn/plain/PlainHTML';
import { StackOverflowHTML } from '@/components/preview/themes/oneColumn/stackoverflow/StackOverflowHTML';
import { TimelessHTML } from '@/components/preview/themes/oneColumn/timeless/TimelessHTML';
import { FoggyHTML } from '@/components/preview/themes/twoColumn/foggy/FoggyHTML';
// ─── Theme Imports ───────────────────────────────────────────

import { LunarHTML } from '@/components/preview/themes/twoColumn/lunar/LunarHTML';
import { MistyHTML } from '@/components/preview/themes/twoColumn/misty/MistyHTML';
import { SkylineHTML } from '@/components/preview/themes/twoColumn/skyline/SkylineHTML';
import { SoftHTML } from '@/components/preview/themes/twoColumn/soft/SoftHTML';
import { SwissGridHTML } from '@/components/preview/themes/twoColumn/swiss-grid/SwissGridHTML';
import type { ResumeData } from '@/types/resume';

// ─── Theme Props ─────────────────────────────────────────────

/**
 * ⚠️ A second, structurally identical declaration of `themes/shared/types.ts`'s
 * `ThemeProps`. Kept in step by hand; edit both.
 *
 * ⚠️ **No `cvLocale`** — see the doc block on the shared one. It carried a
 * `getThemeTranslations` object, which can only ever say
 * `addressSchema: { mode: 'default' }`, and every theme shadowed it.
 */
export interface ThemeProps {
  data: ResumeData;
  formatCVDate: (date?: string) => string;
  formatCVDateRange: (start?: string, end?: string) => string;
}

// ─── Theme Metadata ──────────────────────────────────────────

export interface ThemePaletteMeta {
  id: string;
  /**
   * The picker's swatch colour. **Not** the icon fill — see `iconUi`.
   *
   * ⚠️ **One colour, not a list**. `ColorPicker` used to branch on
   * `ui.length` into a solid swatch, a two-stop linear gradient or a conic one;
   * all forty registry palettes declared exactly one colour, so two of the three
   * branches had never run. Typing it `string[]` also cost `ui?.[0] ||
   * '#718096'` at six call sites, where the grey read as a necessary fallback.
   * A palette that wants a gradient swatch can have the branches back — with a
   * second colour to render, which is what was missing.
   *
   * ⚠️ Not derivable from the theme's palette map: this differs from that
   * palette's `primary` on **10 of the 40**, and all seven timeless swatches are
   * the *background* rather than the accent. Measured during a review pass.
   *
   * ⚠️ That last sentence is exactly why this is no longer the icon fill.
   * On lunar, timeless and javascript the swatch **is** a background — lunar's
   * `#1a1a2e` is its own dark sidebar — so drawing an icon in it draws an
   * invisible icon. Those three used to be corrected by a hardcoded per-theme
   * `if` chain inside `serializeIconsMap`; the colour role they need lives here
   * now, beside the one they were being confused with.
   */
  ui: string;
  /**
   * The fill the PDF's icons are actually drawn with.
   *
   * A **second colour role**, not a variant of `ui`. `ui` answers "what square
   * does the picker show for this palette"; this answers "what colour is legible
   * for an icon painted on the surface this palette produces". They coincide on
   * nine themes and cannot on the three whose swatch is a background.
   *
   * ⚠️ **Per palette, not per theme, and that is deliberate.** lunar's seven all
   * say `#ffffff` and timeless's seven all say `#1a1a1a`, which reads like a
   * restated constant asking to be hoisted to a theme-level default. It is not:
   * a theme-level default is inherited *silently* by palette number eight, and
   * an eighth lunar palette with a light sidebar is precisely the case that
   * would ship invisible icons. Written per palette, adding one is a build error
   * until its author answers the question. The seven agreeing values are seven
   * decisions that agree, not one decision copied seven times.
   */
  iconUi: string;
  /**
   * The fill for de-emphasised icons — today only `external-link`.
   *
   * The PDF's stand-in for what the HTML previews express as `opacity: 0.4`–
   * `0.5` on `currentColor`: every theme's `ExternalLink` is drawn faded next to
   * the value it decorates, and Typst is handed flat SVGs with no inherited
   * colour to fade. lunar is the one theme that had a hand-written value for it
   * (`#888888` against `#ffffff`); everywhere else it equals `iconUi`, which is
   * what omitting it in `paletteMetas` gives you.
   */
  iconUiMuted: string;
}

/**
 * The palette's two icon fills, as `serializeIconsMap` takes them.
 *
 * Deliberately **not** `ThemePaletteMeta` — see `paletteIconFills`. Named fields
 * rather than two positional `string`s for the reason `paletteId` is
 * required: two adjacent parameters of the same type are interchangeable by
 * definition, and swapping these paints every icon in the de-emphasised grey.
 */
export interface IconFills {
  icon: string;
  muted: string;
}

interface PaletteSwatchDetail {
  ui: string;
  iconUi?: string;
  iconUiMuted?: string;
}

/**
 * What a theme declares for one palette: the bare swatch, or the swatch plus the
 * icon fill where the two are different colours.
 *
 * ⚠️ **The object form requires `iconUi`.** A `{ ui }` object would be the
 * string form spelled longer, and the half-filled object is the shape that
 * invites "I set the swatch, I'll come back to the icons". The two forms are a
 * decision each: a string says *the icons are drawn in the swatch*, which is
 * true wherever the swatch is an accent, and false wherever it is a background.
 */
type PaletteSwatch = string | (PaletteSwatchDetail & { iconUi: string });

/**
 * Binds a theme's registry palette list to the palette map that actually renders
 * it, at the definition site.
 *
 * The inventory exists **twice** and only one copy is reachable from the picker.
 * `ThemeRegistry[id].palettes` is what the user sees and chooses from — the
 * swatches in `ColorPicker.tsx` and the id written into
 * `meta.theme.params.palette`. Each theme's own `PALETTES`/`PALETTES_HTML` is
 * what renders: every consumer goes through `resolvePalette`, which falls back to
 * a hardcoded id on a miss — `default` on eleven themes, `light` on javascript.
 * So a registry palette with no per-theme entry does not crash and does not warn,
 * it **silently renders the fallback palette's colours** while the picker shows
 * the chosen swatch as selected.
 *
 * Naming the theme closes both directions: the id set comes from
 * `ThemePaletteIds[K]`, so a **missing** palette is `TS2345` and an **extra** one
 * `TS2353`, and the two inventories cannot drift. This replaces the runtime
 * key-set assertion `palettes.test.ts` carried (deleted with the file, whose
 * only other assertion had already moved into the compiler).
 *
 * ⚠️ **The theme id is a value parameter, and that is the whole point.** The
 * first version took the id set as an explicit *type* argument — the shape
 * `paletteMetas<ThemePaletteIds['lunar']>({ … })` — and a type argument binds
 * nothing a thirteenth theme's author is obliged to write. Measured on the
 * review pass: **dropping it and then adding a palette the map does not have
 * compiled clean**, and so did handing the `foggy` entry misty's id set. That is
 * the same annotation-fragility `ThemeRegistryMap` documents below, one field
 * over — and `palettes` is the one field `ThemeRegistryMap` cannot bind to `K`,
 * because it is produced by a call rather than written as a literal. As an
 * argument there is nothing left to forget: omitting it is `TS2554`.
 * `_themeId` is unread at runtime; it exists solely to infer `K`.
 *
 * ⚠️ **Neither the id nor the name is written by hand any more.** `id` comes off
 * the record key, so the `{ id: 'ocean', … }` restating-its-own-key shape cannot
 * come back; and a palette carries no `nameKey` at all — the display name
 * is looked up as `themes.palettes.<themeId>.<paletteId>`, composed where it is
 * read. It was a plain English display string masquerading as a locale key, so
 * `t()` missed on it in all fifteen locales and the `||` fallback printed the
 * literal. `locales/en/themes.ts` owes a name for each of the forty and both
 * drift directions there are build errors, which is a stronger guarantee than a
 * stored key gave.
 *
 * ⚠️ **A derived key set has TWO degenerate forms and they need separate
 * guards.** `…PaletteId` is `keyof typeof PALETTES`, so it collapses if the map
 * it is derived from ever stops being a literal:
 *
 * - **`never`**, if a palette map were emptied. `Record<never, string>` is
 *   satisfied by `{}` (a recorded trap here) and this would return an
 *   **empty** list typed as a non-empty tuple.
 * - **`string`**, if a `constants.ts` reverted from `satisfies Record<string,
 *   XPalette>` to the annotation `: Record<string, XPalette>` — which is what
 *   all twelve once looked like, so it is the likeliest regression of
 *   the lot. `Record<string, string>` accepts anything, and a registry palette
 *   with no map entry compiles clean. Found by the review pass; the `never`
 *   guard alone did **not** cover it, because `[string] extends [never]` is
 *   false.
 *
 * Both are closed by making the parameter `never` in either case, so the call
 * site fails rather than the guard silently widening. Mutation-verified for both.
 *
 * The non-empty tuple return is what lets the seven `themeMeta.palettes?.[0]`
 * dances go; it is sound because the id set is proven neither `never` nor
 * `string` above, so `Record<…>` has at least one literal key.
 */
function paletteMetas<K extends ThemeId>(
  _themeId: K,
  swatches: string extends ThemePaletteIds[K]
    ? never
    : [ThemePaletteIds[K]] extends [never]
      ? never
      : Record<ThemePaletteIds[K], PaletteSwatch>,
): [ThemePaletteMeta, ...ThemePaletteMeta[]] {
  const [first, ...rest] = Object.entries(swatches as Record<string, PaletteSwatch>).map(
    ([id, swatch]) => {
      const detail: PaletteSwatchDetail = typeof swatch === 'string' ? { ui: swatch } : swatch;
      const { ui, iconUi = ui, iconUiMuted = iconUi } = detail;
      return { id, ui, iconUi, iconUiMuted };
    },
  );
  return [first, ...rest];
}

export interface ThemeMeta {
  id: ThemeId;
  nameKey: `themes.names.${ThemeId}`;
  author: string;
  license: string;
  /**
   * Non-empty and required. All twelve themes have always had at least
   * one palette; the optionality was costing a `?.`/`?.[0]` dance at seven call
   * sites and `palettes.test.ts` a runtime `toBeGreaterThan(0)` to say so.
   * `paletteMetas` is the only producer and cannot return an empty list.
   */
  palettes: [ThemePaletteMeta, ...ThemePaletteMeta[]];
  HTMLComponent: React.ComponentType<ThemeProps>;
  supportsImage: boolean;
  layout: ThemeLayout;
  previewImage: string;
}

/**
 * The registry's own type, and it does more than `Record<ThemeId, ThemeMeta>`.
 *
 * A `Record` constrains the **keys** and nothing about how a value relates to
 * the key it sits under, so `foggy: { id: 'misty', nameKey: 'themes.names.misty' }`
 * type-checked. That is not hypothetical drift: the two outputs resolve
 * differently — the HTML preview takes `HTMLComponent` off the entry found by
 * **key** (`ResumeHTML.tsx`), the PDF looks up `SERIALIZERS` by **`themeMeta.id`**
 * (`Viewer.tsx`) — so such an entry ships one theme's preview beside another's
 * PDF.
 *
 * Binding `id` and `nameKey` to `K` makes both a build error at the definition
 * site. The runtime assertions in `typstCompile.test.ts` stay as the second
 * half, for the same reason the `SERIALIZERS` set-equality test does.
 *
 * `layout` is bound the same way. It is the fact `utils/layout/` needs
 * and cannot import from here, so `THEME_LAYOUTS` publishes it separately —
 * and pinning the field to that table is what keeps the two from drifting
 * without a runtime test to say so.
 */
type ThemeRegistryMap = {
  [K in ThemeId]: ThemeMeta & {
    id: K;
    nameKey: `themes.names.${K}`;
    layout: (typeof THEME_LAYOUTS)[K];
  };
};

// ─── Registry ────────────────────────────────────────────────

export const ThemeRegistry: ThemeRegistryMap = {
  lunar: {
    id: 'lunar',
    nameKey: 'themes.names.lunar',
    author: 'Maikel Hajiabadi',
    license: 'AGPL-3.0-only',
    /**
     * ⚠️ Every swatch here is lunar's **sidebar** colour, and the sidebar is
     * where its icons sit — so `iconUi` is white on all seven and
     * `external-link` is de-emphasised to grey, the flat equivalent of the 0.5
     * opacity `LunarHTML` gives it. Painting an icon in the swatch was once
     * reachable; that override now lives in `iconUi`, outside `serializeIconsMap`.
     */
    palettes: paletteMetas('lunar', {
      default: { ui: '#1a1a2e', iconUi: '#ffffff', iconUiMuted: '#888888' },
      cyan: { ui: '#163030', iconUi: '#ffffff', iconUiMuted: '#888888' },
      mint: { ui: '#3a4d4d', iconUi: '#ffffff', iconUiMuted: '#888888' },
      lilac: { ui: '#484c6d', iconUi: '#ffffff', iconUiMuted: '#888888' },
      lavender: { ui: '#4a4352', iconUi: '#ffffff', iconUiMuted: '#888888' },
      orchid: { ui: '#2d2a32', iconUi: '#ffffff', iconUiMuted: '#888888' },
      berry: { ui: '#3e2a35', iconUi: '#ffffff', iconUiMuted: '#888888' },
    }),
    HTMLComponent: LunarHTML,
    supportsImage: true,
    layout: 'two-column',
    previewImage: '/images/previews/lunar.png',
  },
  plain2: {
    id: 'plain2',
    nameKey: 'themes.names.plain2',
    author: 'Maikel Hajiabadi',
    license: 'AGPL-3.0-only',
    palettes: paletteMetas('plain2', {
      default: '#000000',
    }),
    HTMLComponent: Plain2HTML,
    supportsImage: true,
    layout: 'one-column',
    previewImage: '/images/previews/plain2.png',
  },
  elegant: {
    id: 'elegant',
    nameKey: 'themes.names.elegant',
    author: 'Maikel Hajiabadi',
    license: 'AGPL-3.0-only',
    palettes: paletteMetas('elegant', {
      default: '#4a5568',
    }),
    HTMLComponent: ElegantHTML,
    supportsImage: false,
    layout: 'one-column',
    previewImage: '/images/previews/elegant.png',
  },
  stackoverflow: {
    id: 'stackoverflow',
    nameKey: 'themes.names.stackoverflow',
    author: 'Maikel Hajiabadi',
    license: 'AGPL-3.0-only',
    palettes: paletteMetas('stackoverflow', {
      default: '#f48024',
      dark: '#242729',
    }),
    HTMLComponent: StackOverflowHTML,
    supportsImage: false,
    layout: 'one-column',
    previewImage: '/images/previews/stackoverflow.png',
  },
  plain: {
    id: 'plain',
    nameKey: 'themes.names.plain',
    author: 'Maikel Hajiabadi',
    license: 'AGPL-3.0-only',
    palettes: paletteMetas('plain', {
      default: '#000000',
    }),
    HTMLComponent: PlainHTML,
    supportsImage: true,
    layout: 'one-column',
    previewImage: '/images/previews/plain.png',
  },
  javascript: {
    id: 'javascript',
    nameKey: 'themes.names.javascript',
    author: 'Maikel Hajiabadi',
    license: 'AGPL-3.0-only',
    /**
     * ⚠️ The two swatches are the editor background this theme imitates, so the
     * icons take the slate the comments are set in. This is the one theme whose
     * icon fill genuinely varies with the palette, and the one whose old
     * override read the stored palette id a **third** way (`params?.palette ||
     * 'light'`, neither `resolvePalette` nor `getActivePalette`) —
     * problem 2, gone with the branch.
     */
    palettes: paletteMetas('javascript', {
      light: { ui: '#ffffff', iconUi: '#cbd5e1' },
      dark: { ui: '#000000', iconUi: '#484f58' },
    }),
    HTMLComponent: JavaScriptHTML,
    supportsImage: true,
    layout: 'one-column',
    previewImage: '/images/previews/javascript.png',
  },
  skyline: {
    id: 'skyline',
    nameKey: 'themes.names.skyline',
    author: 'Maikel Hajiabadi',
    license: 'AGPL-3.0-only',
    palettes: paletteMetas('skyline', {
      default: '#4cb2e6',
      sunset: '#f87171',
      green: '#059669',
    }),
    HTMLComponent: SkylineHTML,
    supportsImage: true,
    layout: 'two-column',
    previewImage: '/images/previews/skyline.png',
  },
  foggy: {
    id: 'foggy',
    nameKey: 'themes.names.foggy',
    author: 'Maikel Hajiabadi',
    license: 'AGPL-3.0-only',
    palettes: paletteMetas('foggy', {
      default: '#1a7a4a',
      ocean: '#196ee6',
      sunset: '#e25c2a',
      purple: '#6d28d9',
      pink: '#d946ef',
    }),
    HTMLComponent: FoggyHTML,
    supportsImage: true,
    layout: 'two-column',
    previewImage: '/images/previews/foggy.png',
  },
  soft: {
    id: 'soft',
    nameKey: 'themes.names.soft',
    author: 'Maikel Hajiabadi',
    license: 'AGPL-3.0-only',
    palettes: paletteMetas('soft', {
      default: '#6366f1',
      ocean: '#0ea5e9',
    }),
    HTMLComponent: SoftHTML,
    supportsImage: true,
    layout: 'two-column',
    previewImage: '/images/previews/soft.png',
  },
  swiss_grid: {
    id: 'swiss_grid',
    nameKey: 'themes.names.swiss_grid',
    author: 'Maikel Hajiabadi',
    license: 'AGPL-3.0-only',
    palettes: paletteMetas('swiss_grid', {
      default: '#ff5722',
      rose: '#e11d48',
      blue: '#2563eb',
      green: '#059669',
    }),
    HTMLComponent: SwissGridHTML,
    supportsImage: true,
    layout: 'two-column',
    previewImage: '/images/previews/swiss_grid.png',
  },
  timeless: {
    id: 'timeless',
    nameKey: 'themes.names.timeless',
    author: 'Maikel Hajiabadi',
    license: 'AGPL-3.0-only',
    /**
     * ⚠️ All seven swatches are the page **background** (a review pass
     * measured that), and timeless is monochrome by design — so its icons are
     * near-black on every one of them, and the swatch is the last colour they
     * could be drawn in.
     */
    palettes: paletteMetas('timeless', {
      default: { ui: '#fffcf5', iconUi: '#1a1a1a' },
      white: { ui: '#ffffff', iconUi: '#1a1a1a' },
      green: { ui: '#f4f8f4', iconUi: '#1a1a1a' },
      blue: { ui: '#f4f7fa', iconUi: '#1a1a1a' },
      orange: { ui: '#fff9f0', iconUi: '#1a1a1a' },
      rose: { ui: '#fff5f5', iconUi: '#1a1a1a' },
      lavender: { ui: '#f8f5ff', iconUi: '#1a1a1a' },
    }),
    HTMLComponent: TimelessHTML,
    supportsImage: false,
    layout: 'one-column',
    previewImage: '/images/previews/timeless.png',
  },
  misty: {
    id: 'misty',
    nameKey: 'themes.names.misty',
    author: 'Maikel Hajiabadi',
    license: 'AGPL-3.0-only',
    palettes: paletteMetas('misty', {
      default: '#1a7a4a',
      ocean: '#196ee6',
      sunset: '#e25c2a',
      purple: '#6d28d9',
      pink: '#d946ef',
    }),
    HTMLComponent: MistyHTML,
    supportsImage: true,
    layout: 'two-column',
    previewImage: '/images/previews/misty.png',
  },
};

/**
 * Re-exported, not declared. `DEFAULT_THEME` lives in `themeIds.ts` beside
 * `resolveThemeId`, because `utils/layout/` needs both to answer a
 * stored theme name the same way this module does, and importing the registry
 * from there would close the cycle `themeIds.ts` exists to break. Two
 * declarations agreeing by hand is the defect this placement prevents.
 */
export { DEFAULT_THEME };

// ─── Helpers ─────────────────────────────────────────────────

/*
 * `isThemeId` used to be declared here, keyed on `ThemeRegistry`, while
 * `resolveThemeId` held a second membership test written inline and keyed on
 * `THEME_LAYOUTS`. It lives in `themeIds.ts` now — and is **not**
 * re-exported from here, because nothing imported it from this module: the
 * review pass deleted the re-export and got `tsc -b` exit 0 with the whole
 * preview suite green. A second import path to one predicate is the same shape
 * as the second implementation the change removed.
 */

/**
 * Resolves a theme name to its metadata, falling back to `DEFAULT_THEME`.
 *
 * This is the boundary: the name comes off persisted state and imported JSON,
 * so it is a plain string and needs a runtime check rather than a cast. The
 * check is `Object.hasOwn`, not the `ThemeRegistry[themeId] || …` this used to
 * be — that form resolved a stored name of `constructor` or `toString` to an
 * inherited `Function`, returned it as a `ThemeMeta`, and left `.id` undefined.
 *
 * ⚠️ **Through `resolveThemeId`, so the layout readers cannot answer
 * about a different theme than this one returns.** The check was
 * `isThemeId(themeId) ? … : ThemeRegistry[DEFAULT_THEME]`, which is the same
 * rule written a second time — and `isTwoColumnTheme` wrote it a third way, so
 * a name like `'Timeless'` rendered lunar here while the layout said
 * one-column and the CV came out with no sections at all. `ThemeRegistry` and
 * `THEME_LAYOUTS` are both `Record<ThemeId, …>`, so the two `Object.hasOwn`
 * checks were always over the same key set; that they were two was the problem.
 */
export function getThemeMeta(themeId: string): ThemeMeta {
  return ThemeRegistry[resolveThemeId(themeId)];
}

export function getThemeList(): ThemeMeta[] {
  return Object.values(ThemeRegistry);
}

/**
 * The active palette for a theme — the one the picker shows as selected.
 *
 * ⚠️ This is the registry-array counterpart of `themes/shared/palette.ts`'s
 * `resolvePalette`, which does the same job against a theme's colour **map**.
 * They must agree on the fallback or a résumé's icons take one palette's colour
 * while its text takes another's: `resolvePalette` falls back to the theme's own
 * fallback key (`default`, or `light` on javascript, which has no `default`) and
 * this falls back to the **first** registry palette, which is that same entry on
 * all twelve themes — javascript lists `light` first. That alignment is
 * checkable: the two inventories now share a key set by construction.
 *
 * ⚠️ That makes the fallback depend on **object-literal key order** in
 * `ThemeRegistry`, which no type checks. It is asserted behaviourally instead:
 * reordering lunar's swatches so `cyan` comes first compiles clean and fails two
 * cases in `paletteResolution.test.tsx` (verified on the review pass).
 *
 * `paletteId` is **required**, not optional, even though it is usually a
 * `string | undefined` off the store. A caller with nothing to pass writes
 * `undefined` deliberately; see `paletteIconFills` for what the optional form
 * cost.
 *
 * `find` rather than an index because `paletteId` is unvalidated (`palette?:
 * string` off persisted state and imported JSON), so a prototype key resolves to
 * nothing here rather than to an inherited value.
 */
export function getActivePalette(
  themeId: ThemeId,
  paletteId: string | undefined,
): ThemePaletteMeta {
  const { palettes } = ThemeRegistry[themeId];
  return palettes.find((palette) => palette.id === paletteId) ?? palettes[0];
}

/**
 * The two fills `serializeIconsMap` draws a résumé's icons with.
 *
 * ⚠️ **This _is_ "the colour the icons are drawn in" now, on all forty palettes
 * — and the previous version of this comment was written to say the opposite**,
 * because it was true. `serializeIconsMap` used to override its argument for
 * lunar, timeless and javascript, so the value reached the SVGs on 24 of the 40
 * and was discarded on the other 16, which is how five doc comments on the
 * palette-id branch came to be wrong about a quarter of the catalogue. A later fix
 * moved that override onto `ThemePaletteMeta.iconUi`, where the colour it corrects
 * (`ui`) already lives, so there is no longer a second place for the two to
 * disagree and no theme name in the serializer at all.
 *
 * ⚠️ **Returning a pair rather than the palette is the point.** The serializer
 * must not be able to reach `ui` — for those same three themes `ui` is a
 * *background*, i.e. the one colour an icon must not be painted in, and handing
 * it over "unused" is a trap with a countdown on it. Two named fills are the
 * whole of what that function needs.
 *
 * ⚠️ **One helper for what was six copies** of `palettes?.find(…) ||
 * palettes?.[0]` / `?.ui?.[0] || '#718096'` — `Viewer.tsx`,
 * `utils/preview-utils.tsx`, `useDownloadWorkflow.ts`, `googleDriveSync.ts`,
 * `githubSync.ts` and `test/typstCompile.ts` — the last three of which have
 * since collapsed into `hooks/export/buildExportArtifacts.ts`. Every
 * `?.` in them existed only
 * because `palettes` was optional; the grey `'#718096'` was never a
 * registered theme's colour, and the render tool served it to every icon it
 * *did* colour until a review caught it. There is nothing left for it to fall back
 * to, so it is gone.
 *
 * ⚠️ **`paletteId` is required.** The first version made it optional, and the
 * review pass then dropped it at all five production call sites — every
 * downloaded, synced and previewed PDF painting its icons with the theme's first
 * palette regardless of the selection — with `tsc`, the full suite and lint all
 * clean. It was wrong on 15 of the 40 palettes and nothing saw it. A caller with
 * genuinely no palette to pass writes `undefined`, which is a decision on the
 * page rather than an omission.
 */
export function paletteIconFills(themeId: ThemeId, paletteId: string | undefined): IconFills {
  const { iconUi, iconUiMuted } = getActivePalette(themeId, paletteId);
  return { icon: iconUi, muted: iconUiMuted };
}

/**
 * The locale key holding a palette's display name.
 *
 * ⚠️ Composed rather than stored. `ThemePaletteMeta` used to carry a
 * `nameKey` that was a plain English display string — `'Arctic Mint'`,
 * `'Midnight Berry'` — so `t(p.nameKey)` missed in **all fifteen** locales and
 * the `|| p.nameKey` fallback printed the literal. A stored key would also be a
 * third spelling of the palette id, free to drift from it; composing it here
 * makes that impossible and puts the completeness guarantee where it belongs, on
 * `locales/en/themes.ts`'s `palettes` table, which owes a name for each of the
 * forty and rejects one for a palette that does not exist.
 *
 * ⚠️ The lookup is dynamic, so `scripts/i18n/check-usage.cjs` cannot see it. The
 * two call sites are registered in `config.cjs`'s `DYNAMIC_CALL_ALLOWLIST` **by
 * exact expression** — not as a `DYNAMIC_PREFIXES` entry, because the prefix
 * lives inside this function rather than at the call. (An earlier draft of this
 * comment said the opposite and also claimed `themes.names.` is a registered
 * prefix; neither is in that array. Both were wrong.) Registration is a hole by
 * construction either way: the `satisfies` on the locale table and the
 * forty-key resolution test in `paletteResolution.test.tsx` are what actually
 * hold the property.
 *
 * ⚠️ **`themeId` is a `ThemeId`, not a `string`, and that is load-bearing.** The
 * review pass swapped the two arguments at `DesignTab.tsx` — rendering the raw
 * key `themes.palettes.default.lunar` in all fifteen locales — and it passed
 * `tsc`, the entire suite and lint. `i18n:check` was the only thing that caught
 * it, and `i18n:check` runs in no hook and no CI job. Typing the first parameter
 * makes the swap `TS2345`, because a palette id is only ever a `string`.
 */
export function paletteNameKey(themeId: ThemeId, paletteId: string): string {
  return `themes.palettes.${themeId}.${paletteId}`;
}
