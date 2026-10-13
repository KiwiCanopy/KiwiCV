# Theme System

> **Last Updated: 2026-09-05**

## Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Theme Registries](#theme-registries)
- [Shared Helpers (`themes/shared/`)](#shared-helpers-themesshared)
- [Reference Implementations](#reference-implementations)
- [Adding a Theme](#adding-a-theme)
- [Core Principles](#core-principles)

## Overview

The KiwiCV theme system is a modular, registry-based architecture. Every theme
renders the **same** `ResumeData` into **two independent outputs** from a single
source of truth:

1. **On-screen HTML preview** — a React-DOM component (`{Name}HTML.tsx`) styled
   with normal CSS/inline styles, rendered live in the editor.
2. **PDF** — a `{Name}Serializer.ts` module that emits a **Typst markup string**,
   which is compiled to PDF in the browser via WebAssembly.

There is **no `@react-pdf/renderer`** anywhere in the app (`react-pdf` is not in
`package.json`). Themes contain no react-pdf primitives (`<View>`, `<Text>`,
`<Link>`, `StyleSheet.create`, `PdfIcon`, `PDFFooter`, `{Name}PDF.tsx`). PDF
output is produced entirely by serializing to Typst — see
[Typst PDF Rendering Engine](PDF_ENGINE_TYPST.md) for the WASM compiler, fonts,
and worker pipeline.

## Directory Structure

Themes live in `src/components/preview/themes/`:

- `oneColumn/` — single main column: `elegant`, `javascript`, `plain`, `plain2`,
  `stackoverflow`, `timeless`.
- `twoColumn/` — main column + sidebar: `foggy`, `lunar`, `misty`, `skyline`,
  `soft`, `swiss-grid`.
- `shared/` — cross-theme helpers, re-exported through `shared/index.ts` (and the
  backwards-compatible `themes/shared.ts` barrel).

12 themes total (6 + 6).

### Per-Theme Layout

Each theme folder (e.g. `twoColumn/foggy/`) contains exactly two entry files
plus a `helpers/` tree:

- **`{Name}HTML.tsx`** — HTML preview entry (React DOM). Maps section IDs to the
  theme's HTML section components and lays out the columns.
- **`{Name}Serializer.ts`** — exports `serializeToTypst(data: ResumeData): string`.
  A coordinating shell that routes sections to its Typst helpers and returns the
  full Typst document string.
- **`helpers/`**:
  - `HTML/` — per-section React components for the web preview (`main/`, and
    `side/` for two-column themes).
  - `typst/` — per-section Typst serializers, split into `experience.ts`,
    `educationSkills.ts`, and `achievementsReferences.ts` (the 300-line-limit
    split documented in [PDF_ENGINE_TYPST.md](PDF_ENGINE_TYPST.md)).
  - `shared/` — theme-local `constants.ts` (palettes), `types.ts`, and
    `CommonHTML.tsx` (shared HTML section primitives for that theme).

## Theme Registries

`ALL_THEME_IDS` in **`src/components/preview/themeIds.ts`** is the **single
declaration** of the theme inventory; `ThemeId` is derived from it
(`(typeof ALL_THEME_IDS)[number]`) and every id-keyed map is
`Record<ThemeId, …>`.

That module has **no imports at all**, and that is the point of it. It lived in
`ThemeRegistry.ts` until 2026-07-25, which meant asking _which layout a
theme uses_ pulled in twelve React component trees — and from `utils/layout/` it
could not be asked at all, because the import would close a cycle:

```
ThemeRegistry.ts:8 → themes/shared (barrel) → shared/layout.ts
  → utils/layoutMetadata (barrel) → utils/layout/predicates.ts
```

⚠️ Note the route. It is tempting to describe this cycle as going through the
twelve `*HTML.tsx` components, and it does — but the **short** path is the one
above, and `ThemeRegistry.ts:8` (`import { getThemeTranslations } from
'@/components/preview/themes/shared'`) closes it on its own. Lazy-loading the
theme components would not break this cycle.

It publishes three things:

- `ALL_THEME_IDS` / `ThemeId` — the inventory.
- `THEME_LAYOUTS` — `Record<ThemeId, 'one-column' | 'two-column'>`, written
  `as const satisfies` so the values stay literal.
- `TwoColumnThemeId` — the two-column ids, **derived** from `THEME_LAYOUTS` by
  mapped type. It is what makes `TWO_COLUMN_THEME_DEFAULTS`
  (`utils/layout/constants.ts`) a real `Record`: missing key `TS2741`, extra key
  `TS2353`.

Anything that only needs an id or a layout imports `themeIds.ts`; the registry
below is for metadata and components. Selection is driven by **two** id-keyed
maps:

1. **`src/components/preview/ThemeRegistry.ts`** — `ThemeRegistry`, a
   `Record<ThemeId, ThemeMeta>`. The source of truth for theme **metadata** and
   the **HTML** entry point:
   - `id`, `nameKey`, `author`, `license`
   - `palettes` (UI swatch definitions)
   - `HTMLComponent` — the `{Name}HTML.tsx` React component
   - `supportsImage`, `layout` (`'one-column' | 'two-column'`), `previewImage`
2. **`src/components/preview/ThemeSerializers.ts`** — `SERIALIZERS`, a
   `Record<ThemeId, (resume: ResumeData) => string>` mapping each theme id to its
   `serializeToTypst`.

Fonts are **not** registry metadata. `ThemeMeta` carried a dead, drifted
`fonts: { default, alt }` until 2026-07-25; the live map is `THEME_FONTS` in
`themes/shared/fonts.ts`, also `Record<ThemeId, …>`. So is
`COVER_LETTER_PAGE_WORDS` in `letterCapacity.ts` — the measured one-page
capacity of each theme's letter, which a new theme has to earn with a render
(see [PDF_ENGINE_TYPST.md](PDF_ENGINE_TYPST.md)).

Consumers look a theme up by `themeMeta.id` in both maps: the preview
(`features/dashboard/preview/Viewer.tsx`, `utils/preview-utils.tsx`) renders
`HTMLComponent` for the on-screen view and calls `SERIALIZERS[id]` to produce
Typst for the PDF; download and cloud-sync paths
(`hooks/useDownloadWorkflow.ts`, `hooks/sync/*`) use `SERIALIZERS[id]` too.
`getThemeMeta` narrows an arbitrary stored or imported string with
`resolveThemeId` and falls back to `DEFAULT_THEME`, so `themeMeta.id` is always
a real id.

⚠️ **`resolveThemeId` (`themeIds.ts`) is the ONE normalisation of a stored theme
name, and everything that answers a question about one must go through it.**
There used to be three: `getThemeMeta` matched the exact id and fell
back, `isTwoColumnTheme` did `name.toLowerCase()`, and
`getDefaultTwoColumnLayout` did `name.toLowerCase().replace(/-/g, '_')`.
Measured: **any** stored name that is not an exact id rendered an
**empty CV** — the component falls back to lunar, which is two-column, while
`isTwoColumnTheme` answered `false`, so `getTwoColumnSections` returned two empty
columns. Markup 18032 characters down to 4857 for `'swiss-grid'`,
`'Swiss-Grid'` and `'zzz'` alike. The names that worked did so by luck:
`'Lunar'` lowercases to a two-column id _and_ falls back to a two-column theme;
`'Timeless'` lowercases to a one-column id and falls back to two-column lunar,
and rendered nothing. `DEFAULT_THEME` lives in `themeIds.ts` beside it and is
re-exported from `ThemeRegistry.ts`; `isOneColumnTheme` is deleted (zero
production callers). Pinned in
`components/preview/__tests__/themeNameResolution.test.ts`, whose fixture
deliberately reaches both layouts — a sweep of capitalised two-column names
cannot see the defect.

⚠️ `Record<ThemeId, ThemeMeta>` constrains the registry's **keys**, not
`value.id` — and the two outputs resolve differently: HTML takes
`HTMLComponent` off the entry found by key (`ResumeHTML.tsx`), while the PDF
looks up `SERIALIZERS` by `themeMeta.id` (`Viewer.tsx`). An entry keyed `foggy`
with `id: 'misty'` type-checks and ships one theme's preview beside another's
PDF, so `__tests__/typstCompile.test.ts` asserts key equals id.

So the registry is **not** a plain `Record`. `ThemeRegistryMap` binds three
fields to the key they sit under: `id`, `nameKey` and `layout`. The last of
those is what lets `THEME_LAYOUTS` live in a separate module without becoming a
copy — an entry disagreeing with it is `TS2322` at the registry's own
definition site.

⚠️ All three bindings live on the `: ThemeRegistryMap` **annotation**, and
dropping it drops all three silently. That is why `typstCompile.test.ts` keeps
a runtime half asserting key, name key **and** layout together, rather than
treating the compile guard as sufficient.

⚠️ **Both maps were `Record<string, …>` until 2026-07-25, and drift between
them was invisible.** A theme registered without a serializer stayed selectable
and rendered in the HTML preview but had **no PDF at all** — `Viewer.tsx` takes
the `hasSerializer` path and suppresses retry. Keying them to `ThemeId` makes
both directions compile errors, because exhaustiveness is checked at the
definition site.

A third copy, `TWO_COLUMN_THEMES` (`utils/layout/constants.ts`), was a hand-kept
array of the two-column ids, guarded only at runtime because a _subset_ cannot
be a `Record<ThemeId, …>`. **It is deleted**: `isTwoColumnTheme` reads
`THEME_LAYOUTS` directly, and the subset is now a derived _type_,
`TwoColumnThemeId`. Both runtime tests that guarded it are gone with it — the
compiler holds what they asserted. What is still a runtime test in
`utils/__tests__/layout.test.ts` is the one thing no type expresses: that each
theme's defaults are a **partition of the section inventory**.

⚠️ That test is driven off `ALL_THEME_IDS.filter(isTwoColumnTheme)`, **not**
off `Object.keys(TWO_COLUMN_THEME_DEFAULTS)`. Iterating the map under test
would go quiet rather than red, and here that is reachable: drop `as const`
from `THEME_LAYOUTS` and `TwoColumnThemeId` resolves to `never`, which
`Record<never, …>` satisfies with `{}` — an empty map, and zero cases run.

> Note: theme ids use underscores where the folder uses a hyphen — the
> `swiss-grid` folder registers as id `swiss_grid` in both maps. ⚠️ A stored
> `'swiss-grid'` is **not** silently corrected to `swiss_grid` any more:
> it is not an id, so it resolves to `DEFAULT_THEME` — which is what actually
> renders. The old `.replace(/-/g, '_')` handed back swiss_grid's column split
> for a résumé displaying lunar.

## Shared Helpers (`themes/shared/`)

All helpers are re-exported from `shared/index.ts`. The i18n-aware,
output-agnostic ones are used by both the HTML components and the serializers.

**Visibility & data:**

- `getVisibleData(data)` — filter all sections by hidden IDs/sections
- Visibility lives in `@/utils/visibility`, not here, because the public JSON export applies the same rule: `isVisible(section, item, hiddenIds, hiddenSections)`, `isImageVisible(hiddenIds)`, and `visibleSections(resume)`, which `getVisibleData` spreads.
- `hasPageBreak(meta, column, sectionId)` — manual page break at a section
  boundary (`column`: `'main' | 'sidebar' | 'oneColumn'`)
- `getTwoColumnSections(meta, data)` → `{ main, sidebar }` /
  `getOneColumnSections(meta, data)` — ordered section IDs per column;
  `isTwoColumnLayout(meta)`. ⚠️ **One getter for both two-column columns**,
  replacing `getMainSections`/`getSideSections`, which each ran the same
  shared computation and discarded half of it — all 12 call sites had the two
  calls on adjacent lines. It owns the `isTwoColumnLayout` gate;
  `getRenderableTwoColumnSections` in `utils/layout/getters.ts` deliberately does
  not, so the layout layer stays free of the presentation question.

**Custom sections:** `resolveLayoutSection(sectionId, data, { v, labels })`
(`shared/customSections.ts`) is the one entry point every theme's HTML registry
lookup and Typst `serializeSection` goes through. A built-in key passes through;
a `custom:<id>` token comes back as `key: 'volunteer'` with `v.volunteer` = the
section's visible entries (`position` ← entry name, `organization` empty),
`labels.volunteer` = its title, and `isCustom: true`. So a custom section renders
with the theme's own volunteer design, main and side, in both outputs.

- ⚠️ **A blank title falls back to the CV-language `customSection` label**
  ("Additional details"), never to a theme's `labels.volunteer || 'volunteer'`.
- ⚠️ **`isCustom` swaps the volunteer glyph** for the neutral `layout-list` icon
  (`CUSTOM_SECTION_TYPST_ICON`, `isCustomSection` prop) in the four themes that
  draw one (foggy, skyline, soft, javascript). A new theme whose volunteer
  renderer carries an icon must read it too.
- A theme whose volunteer entry leads with `organization` must fall back to
  `position` when it is empty (plain, soft, swiss-grid do).
- ⚠️ **It inherits volunteer's sidebar rule** (owner, 2026-10-05): in a two-column
  sidebar a custom section shows name and dates only, since the volunteer side
  renderers drop `summary`/`highlights` (`MAIN_COLUMN_ONLY_FIELDS.volunteer`). The
  editor says so with `withCustomSectionMainColumnHints`; change the volunteer rule
  and custom sections change with it.
- The title is free user text and reaches Typst as a heading: every heading call
  must go through `escapeTypstString` (elegant did not, and a `"` broke the PDF).
- Pinned by `customSectionRendering.test.ts` (12 themes × both columns × both
  outputs, untitled fallback, hidden entry, no heart).

**Dates (i18n-aware):**

- `formatDate` / `formatDateRange`
- `useBoundFormatters(data)` — **HTML hook**: `{ cvLocale, cvTitle, formatCVDate,
formatCVDateRange }`
- `getBoundFormatters(data)` — **non-hook** equivalent, called by serializers
  (they run outside React)

**Labels, levels, address:**

- `getSectionLabels(baseSections, userOverrides)`, `getThemeTranslations(locale)`
- `getLevelInfo(level, 'skill' | 'language')`, `getLanguageLevelLabel`,
  `getSkillLevelLabel`, `getLanguageLabel`
- `formatFullAddress(location, cvLocale)` — ⚠️ takes the **`CVLocaleMetadata`
  object**, not a locale code. It reads `cvLocale.addressSchema`, so
  the object must come from `getBoundFormatters`/`useBoundFormatters(data)` — one
  built by `getThemeTranslations(code)` can only say `{ mode: 'default' }` and
  will silently format every address in default mode. An unusable custom schema
  falls back to default mode rather than yielding `''`.
- `getCityCountry(location, localeCode)` — the PDF footer's location line, and it
  ignores `addressSchema` **on purpose** (decided with the owner
  2026-07-26). A footer is a running header rather than the contact block, so
  `City, Country` is a fixed convention there. It keeps a locale **code** rather
  than taking its sibling's `cvLocale` precisely so the schema is not in scope —
  passing the object would make ignoring it look like a bug at every call site.
  ⚠️ It was once called `getShortAddress`; the rename is the point, since
  "short address" reads as _the same address, shorter_ and invites someone to
  thread `cvLocale` through it.

**Palettes:**

- ⚠️ **`ThemePalette` has zero optional fields, and that is the contract.**
  Omitting one from a palette literal is `TS2741`; declaring one the theme's own
  `*Palette` does not name is `TS2353` (there is no index signature). A
  colour only some themes want goes on **those themes'** interfaces —
  `primaryLight` on `SkylinePalette`, `textLight` on the five that read it. An
  optional here gives neither guarantee, which is how lunar shipped a read of a
  colour none of its palettes declared.
- ⚠️ Enforced by `_PaletteHasNoOptionals` in `themes/shared/types.ts`, a type, not
  by `paletteInterfaces.test.ts`'s source scan — a trailing comment defeats the
  scan's line regex and cannot defeat the type.
- ⚠️ **Deadness is per map, not per theme.** `SkylinePalettePDF extends
SkylinePalette` exists because `textLight` reaches the output through
  `SkylineSerializer.ts` alone. foggy uses sibling interfaces instead
  (`FoggyPalette`/`FoggyPalettePDF`) because its PDF map is not a superset.
- ⚠️ **No file under `themes/` may import `@/store/…` or `@/hooks/useTranslation`**
  — ESLint `THEME_PURITY_PATTERNS`, backed by
  `preview/__tests__/themeStoreIsolation.test.ts`. Theme rendering is a pure
  function of the résumé it is handed.

**Fonts:**

- `resolveHTMLFontStack(themeId)` — CSS font stack for the HTML preview.
- The **Typst** font stack is resolved separately by `getTypstFontList('sans' |
'serif')` in `typstUtils.ts`; the WASM font registration is handled by the
  worker (see [PDF_ENGINE_TYPST.md](PDF_ENGINE_TYPST.md)). There is no react-pdf
  font registration — `registerFonts()` survives only as an inert no-op stub.

**Accessibility:**

- `ThemeHeading` — renders a configurable heading tag with `role="heading"` /
  `aria-level` when not an `h1` (`ThemeHeadingContext` supplies `as`).

### Typst-Only Serializer Helpers

These are used exclusively by `{Name}Serializer.ts` and its `helpers/typst/`
files (the word "PDF" in some names refers to the **PDF output**, not react-pdf):

- `typstUtils.ts` — `escapeTypst`, `escapeTypstString`, `sanitizeUrl`,
  `getTypstFontList`, `getTypstResumeSpacingSettings`, `getCommonTypstMacros`,
  `getContactItems`, `getTypstDocumentMetadata`, and entry/gap helpers.
- `markdownTypst.ts` — `markdownToTypst(markdown)` converts rich-text fields to
  Typst markup.
- `iconSerializer.ts` — `serializeIconsMap(resume, fills)` renders lucide-react
  icon nodes to SVG strings and returns a name→SVG map embedded in the Typst doc.
  `fills` is `paletteIconFills(themeId, paletteId)` (`ThemeRegistry.ts`) — the
  palette's `iconUi` plus the `iconUiMuted` used for `external-link`. The
  function knows **no theme names**: it once dispatched on
  `meta.theme.name` and overrode the colour it was handed for lunar, timeless and
  javascript, which is why a swatch (`ThemePaletteMeta.ui`) is not an icon fill —
  on those three the swatch is a _background_.
- `typstFooter.ts` — footer/signature markup (`getTypstFooterParts`,
  `renderTypstSignatureFooter`, `renderTypstPageRightFooter`).
- `typstSectionGuards.ts` — header-orphan pagination guards
  (`keepTypstHeaderWithFirstEntry`, `keepTypstHeaderWithFirstGridRow`).
- `coverLetterTypst.ts` — `buildCoverLetterTypst(data, opts)`. The letter is
  PDF-only: no HTML component renders it, so the only way to look at a change is
  to compile (`RENDER_FIXTURE=letter-long` / `letter-classic`). Beyond colours
  and `themeHeader`, a theme styles it through five optional hooks:
  - `subjectColor` — accent fill for the subject line, defaulting to `textColor`.
  - `renderSubject(subject, {size, color})` — replaces the subject's text run
    outright, for a badge or a tracked upper-case treatment. Supersedes
    `subjectColor`.
  - `renderSender(sender)` — a themed sender tag rendered _above_ `wrapBody`'s
    wrapper rather than inside the chain.
  - `wrapBody(content)` — the card macro around sender/recipient/subject/body.
  - `pageBackground` — page `background` content, replacing `background: none`
    (a full-page edge rule, for example). `pageFill` stays the flat colour.

  The signature footer sits **outside** `wrapBody`, after a `#v(1fr)`. That is
  what bottom-anchors it on a short letter, and it has to be fractional spacing
  rather than `#place(bottom, ..)`: on a letter that already fills the page the
  `1fr` collapses to zero and the footer flows onto the next page, where
  `#place` would have printed it over the body. A wrapper of automatic height
  would swallow the `1fr`, hence the footer's position outside it.

- `pdf.ts` — `injectBreakHints(str, strategy)` inserts zero-width spaces so long
  URLs/emails wrap in the compiled PDF.
- `profiles-pdf.ts` — `getProfileIconPDF` / `getProfileDisplayPDF` map a social
  network name to an icon name + display text for the serializer.

For Typst escaping rules, spacing conventions, page-break control, and the
CLI compile check, follow [PDF_ENGINE_TYPST.md](PDF_ENGINE_TYPST.md) and the
["PDF Rendering (Typst)" section of CONVENTIONS.md](CONVENTIONS.md) rather than
duplicating them here.

## Reference Implementations

- **Two-column**: `src/components/preview/themes/twoColumn/foggy/` (primary).
- **One-column**: `src/components/preview/themes/oneColumn/elegant/`.

Both are the canonical HTML + Serializer patterns to copy.

> [!IMPORTANT]
> The obligations here — `satisfies` over an annotation, ATS source order, and
> that a green suite proves only that Typst parsed — are in
> `.claude/rules/themes.md`, which loads on any edit under
> `src/components/preview/`. The procedure is the `theme-generator` skill.

## Adding a Theme

Because a theme is now two coordinated outputs, the real steps are:

1. **Create the folder** under `oneColumn/` or `twoColumn/`. The fastest start
   is to copy a reference theme (foggy / elegant) and rename — see the
   `theme-generator` skill (`.claude/skills/theme-generator/SKILL.md`) for the
   step-by-step copy workflow.

2. **Route every layout entry through `resolveLayoutSection`** in both outputs
   (see Shared Helpers § Custom sections), or custom sections render nothing.

3. **HTML preview** — build `{Name}HTML.tsx` plus `helpers/HTML/` section
   components. Define palettes and types in `helpers/shared/constants.ts` and
   `helpers/shared/types.ts`. Standard HTML styling and rgba are fine here.

   ⚠️ The palette map must end `} satisfies Record<string, {Name}Palette>;` and
   publish its keys — `export type {Name}PaletteId = keyof typeof PALETTES;`.
   An **annotation** (`: Record<string, {Name}Palette>`) instead, which
   is what all twelve looked like before, collapses that id type to `string` and
   silently unbinds every guard below. Name the map `PALETTES`; use
   `PALETTES_HTML`/`PALETTES_PDF` only if the PDF genuinely resolves a different
   colour, in which case key the second one `Record<{Name}PaletteId, …>`.

4. **Typst serializer** — build `{Name}Serializer.ts` exporting
   `serializeToTypst(data)`, with the three `helpers/typst/` section modules.
   Use the shared Typst helpers (escaping, fonts, spacing, guards) — see
   [PDF_ENGINE_TYPST.md](PDF_ENGINE_TYPST.md).

5. **Add the id to `ALL_THEME_IDS` and its layout to `THEME_LAYOUTS`**, both in
   `src/components/preview/themeIds.ts`, then register in both maps:
   `HTMLComponent` + metadata in `ThemeRegistry.ts`, and the `serializeToTypst`
   entry in `ThemeSerializers.ts`. The id must be the same in all of them, and
   `tsc -b` fails until it is.

   Two **further** compile-guarded tables (they replace
   `THEME_PALETTES` in `__tests__/palettes.test.ts`, which was deleted —
   if you are following an older copy of this page, that file no longer exists):

   - `PaletteIdMap` in `src/components/preview/themePaletteIds.ts` — map the new
     id to the `{Name}PaletteId` you exported in step 2. Omitting it fails on
     `ThemePaletteIds`; a stranger key fails `_PaletteIdMapHasNoStrangers`
     (`TS2344`).
   - `themes.palettes` in `src/locales/en/themes.ts` — one display name per
     palette, alongside the theme's own name in `themes.names`. Missing is
     `TS2739`, a name for a palette that does not exist is `TS2353`. Then
     propagate with `npm run i18n:sync` and register the keys in
     `scripts/i18n/handoff-catalog.cjs`, per
     [ops/I18N.md](../ops/I18N.md).

   Follow the build errors rather than a checklist: setting `THEME_LAYOUTS` to
   `'two-column'` makes `TWO_COLUMN_THEME_DEFAULTS`
   (`utils/layout/constants.ts`) fail to compile until the theme has a default
   column split, and the registry entry's own `layout` field is pinned to the
   same table, so it cannot disagree. That whole chain is
   compile-guarded — there is no longer a `TWO_COLUMN_THEMES` array to remember.

   The theme's palette ids must match `ThemeRegistry[id].palettes` exactly. That
   pair used to be the one part of the palette inventory duplicated on purpose
   and runtime-guarded; it is now bound at the definition site by
   `paletteMetas(themeId, { … })`, whose swatch record is keyed by the theme's
   own `{Name}PaletteId`. Missing is `TS2345`, extra is `TS2353`, and the
   palette's `id` is derived from the record key rather than written out.
   ⚠️ Pass the theme id as the **first argument**; an earlier form took it as a
   type argument, and a type argument is something a new theme's author can
   simply not write, at which point nothing is bound at all.

   Declare the theme's own extra colours on its `*Palette` interface:
   `ThemePalette` has no index signature, so an undeclared colour is a build
   error.

6. **Preview image** — add `{themeId}.png` under `public/images/previews/` and
   point `previewImage` at it.

7. **Verify**:

   ```bash
   npm run lint -- src/components/preview/themes/[type]/<ThemeName>/
   npm run build
   npm test
   ```

   `npm test` now compiles every theme's Typst across six input shapes — see
   [PDF_ENGINE_TYPST.md](PDF_ENGINE_TYPST.md) — so a new theme is compiled
   automatically once its id is in `ALL_THEME_IDS`, with no per-theme test to
   write. It checks only that the compiler **accepts** the markup, not that the
   result is warning-free or looks right. To look at the output, render one
   theme to a PDF: `RENDER_THEME=<themeId> npm run pdf:render` writes
   `scratch/<themeId>-single.pdf` and prints the path (add
   `RENDER_FIXTURE=placeholder` for the new-user resume, the fixture with a
   profile image). ⚠️ Neither `npm test` nor `pdf:render` checks the compile is
   **warning-free** — nothing in the repository inspects compiler diagnostics,
   so an invented font family passes both silently.

## Core Principles

1. **Single data source, two renderers** — HTML and Typst both consume the same
   filtered `ResumeData`; keep them visually consistent.
2. **Modular section components** — each section (Work, Education, …) is its own
   file, on both the HTML and Typst sides.
3. **Shared logic is centralized** — filtering, dates, visibility, levels, and
   labels come from `themes/shared/`; do not reimplement per theme.
4. **Registry pattern** — a theme is selected purely by id via `ThemeRegistry`
   (HTML) and `SERIALIZERS` (Typst).
5. **ATS-friendly order** — render the main column before the sidebar in source
   order for both outputs.
