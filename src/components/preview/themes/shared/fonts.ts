import { type ThemeId, isThemeId } from '@/components/preview/themeIds';

/**
 * Every font family a theme is allowed to ask for, written out rather than
 * derived. Both maps below are pinned to it, so adding a family is one edit that
 * fails in two places until it is finished: `THEME_FONTS` cannot name a family
 * that is not here, and `HTML_FONT_STACKS` must carry a stack for each one.
 *
 * ⚠️ **Deriving this from `THEME_FONTS` does not work, and looked like it did.**
 * The obvious spelling — `satisfies Record<ThemeId, string>` on the map, then
 * `type X = (typeof THEME_FONTS)[ThemeId]` — degenerates to `string`: a property
 * contextually typed as `string` infers `string`, not its literal, so `satisfies`
 * has no literal left to preserve. `Record<string, string>` then accepts any key
 * at all. Measured on this file before it was written this way: pointing a theme
 * at an unstacked `Montserrat` and adding a `Montserrat` stack no theme asks for
 * both compiled clean. Only the `ThemeId` half of the check was ever real.
 */
type ThemeFontFamily = 'Inter' | 'Lora' | 'JetBrains Mono';

/**
 * Per-theme font families for the **HTML preview**. `resolveHTMLFontStack` is
 * the only thing that reads this, and the only export of this module.
 *
 * `ThemeMeta` used to carry a parallel `fonts: { default, alt }` per theme.
 * Nothing read it — the only registry fields any consumer touches are `id`,
 * `layout`, `palettes`, `nameKey`, `previewImage` and `HTMLComponent` — and it
 * had drifted: lunar/stackoverflow/skyline/swiss_grid claimed an `alt` of
 * `Roboto` against `Montserrat` here, javascript `Fira Code` against
 * `JetBrains Mono`, plain/plain2 `SourceSansPro` where this map fell through to
 * Inter. `Roboto`, `Fira Code` and `SourceSansPro` are not in `public/fonts` at
 * all, so the dead copy named faces the app cannot render. It is deleted;
 * keying this one to `ThemeId` stops it drifting from the theme inventory.
 *
 * `plain` and `plain2` were absent and resolved through the fallback, so they
 * are written out with exactly the values that fallback produced — no rendering
 * change.
 *
 * ⚠️ **Every family here must be one the browser can actually load** — meaning
 * an `@font-face` in `styles/tokens.css`, not merely a file sitting in
 * `public/fonts`. Nothing used to check that, and the failure is silent:
 * an unloadable family falls through to the generic at the end of the stack, so
 * elegant and timeless rendered as some system serif and javascript as some
 * system mono, each against a PDF containing the real face. `soft` was worse
 * still — it said `Montserrat`, a family loadable on *neither* side, so no
 * export ever contained it. `fontFamilyRegistration.test.ts` is the forward
 * guard, and it covers the Typst stacks in the same pass.
 *
 * ⚠️ **This map does not reach the PDF, and never did.** The serializers pick
 * their own stack — `getTypstFontList('sans' | 'serif')`, or javascript's
 * private `getJavascriptFontList` — so agreement between the two renderers is
 * something a human has to maintain per theme. An audit found two disagreements
 * out of twelve.
 *
 * `satisfies` rather than a `:` annotation, deliberately: it holds the map to
 * exactly the `ThemeId` inventory in **both** directions — a theme with no entry
 * and an entry for no theme are each a build error at this declaration — while
 * an annotation would only catch the first.
 *
 * `ThemeId` comes from `themeIds.ts`, not from the registry: a value import of
 * `ThemeRegistry` here would close a cycle (`ThemeRegistry` → every `*HTML.tsx`
 * → `themes/shared/` → this file). That module imports nothing, so the
 * type-only workaround this note used to describe is no longer load-bearing.
 */
const THEME_FONTS = {
  lunar: 'Inter',
  elegant: 'Lora',
  stackoverflow: 'Inter',
  skyline: 'Inter',
  soft: 'Inter',
  swiss_grid: 'Inter',
  timeless: 'Lora',
  foggy: 'Inter',
  misty: 'Inter',
  javascript: 'JetBrains Mono',
  plain: 'Inter',
  plain2: 'Inter',
} satisfies Record<ThemeId, ThemeFontFamily>;

/**
 * CSS `font-family` per family. Each ends in a generic so a face that fails to
 * load still renders something — but the generic is the failure mode, not the
 * plan: see the `@font-face` block in `styles/tokens.css`.
 *
 * ⚠️ **Nothing that is not in `THEME_FONTS` belongs here.** This used to carry
 * `Montserrat`, `DejaVu Sans`, `Noto Sans SC` and `Noto Sans JP`. The last three
 * were reachable only through script-detection branches in a `resolveFont` whose
 * sole caller passed neither a locale nor any resume data, so they were dead
 * from the day they were written; `Montserrat` lost its last theme in the
 * same change. The key type now makes an unreachable entry an excess-property
 * error rather than something to notice later.
 */
const HTML_FONT_STACKS: Record<ThemeFontFamily, string> = {
  Inter: "'Inter', -apple-system, 'Segoe UI', system-ui, sans-serif",
  Lora: "'Lora', serif",
  'JetBrains Mono': "'JetBrains Mono', monospace",
};

/**
 * Resolve the CSS font-family stack for a theme's HTML preview.
 *
 * The theme name arrives from persisted state and imported JSON, so it is an
 * arbitrary string and the `isThemeId` fallback stays. Past that guard the
 * lookup is total — both maps are pinned to `ThemeFontFamily` — so there is no
 * second fallback here, and a missing stack would be a build error rather than
 * the silent `|| HTML_FONT_STACKS.Inter` this used to end with.
 */
export function resolveHTMLFontStack(themeId: string): string {
  const family: ThemeFontFamily = isThemeId(themeId) ? THEME_FONTS[themeId] : 'Inter';
  return HTML_FONT_STACKS[family];
}
