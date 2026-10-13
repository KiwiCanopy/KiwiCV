---
paths:
  - 'src/components/preview/**'
---

# CV themes

`code/THEME_SYSTEM.md`, `code/TYPST_THEME_AUTHORING.md` and
`code/PDF_ENGINE_TYPST.md` are the reference — registries, shared helpers, the
Typst runtime, layout conventions. This is what binds when you touch a theme.

Adding a whole theme is a procedure, not a rule: use the `theme-generator`
skill.

## One data source, two renderers

HTML preview and Typst serializer consume the same filtered `ResumeData`. **A
change to one is a parity bug until the other matches** — a field that renders
in the preview and not in the PDF is the single most common defect class in this
subsystem, and it is invisible to every automated check here.

Filtering, dates, visibility, levels and labels come from
`src/components/preview/themes/shared/`. Do not reimplement them per theme; a
local copy is how two themes start disagreeing about what "current" means.

**ATS order: render the main column before the sidebar in source order**, in
both outputs, whatever the visual layout is.

## The palette map ends in `satisfies`, never an annotation

```ts
} satisfies Record<string, {Name}Palette>;
export type {Name}PaletteId = keyof typeof PALETTES;
```

An annotation (`: Record<string, {Name}Palette>`) collapses the id type to
`string` and **silently unbinds every compile guard downstream** — `PaletteIdMap`,
the locale palette names, `paletteMetas`. All twelve themes once looked like
this. Nothing failed; the guards simply stopped guarding.

Name the map `PALETTES`. Use `PALETTES_HTML`/`PALETTES_PDF` only when the PDF
genuinely resolves a different colour, and key the second
`Record<{Name}PaletteId, …>`.

Declare a theme's extra colours on its own `*Palette` interface. `ThemePalette`
has no index signature, so an undeclared colour is a build error.

⚠️ Pass the theme id to `paletteMetas` as the **first argument**. An earlier form
took it as a type argument, and a type argument is something an author can
simply not write — at which point nothing is bound at all.

## Follow the build errors, not a checklist

The registration tables are compile-guarded and disagree loudly:
`ThemePaletteIds`, `_PaletteIdMapHasNoStrangers` (`TS2344`), `TS2739` for a
missing palette display name, `TS2353` for a name for a palette that does not
exist, `TS2345` for a missing swatch.

Setting `THEME_LAYOUTS` to `'two-column'` makes `TWO_COLUMN_THEME_DEFAULTS` in
`src/utils/layout/constants.ts` fail until the theme has a default column split.
There is no `TWO_COLUMN_THEMES` array to remember.

## Nothing here checks that the PDF is right

`npm test` compiles every theme's Typst across six input shapes, automatically,
once the id is in `src/components/preview/themeIds.ts`. That is the whole of the
automated coverage, and it proves only that **the compiler accepted the markup**.

⚠️ **It does not check the compile is warning-free.** `$typst.pdf` resolves on
warnings and nothing in this repository inspects diagnostics, so an
`unknown font family` from a font name you invented passes `npm test` and
`pdf:render` in silence. Check the stack against `public/fonts` by hand.

To look at output:

```bash
RENDER_THEME=<themeId> npm run pdf:render
```

It writes `scratch/<themeId>-single.pdf` and prints the path. Add
`RENDER_FIXTURE=placeholder` for the new-user resume — the fixture with a
profile image.

**Open the PDF.** A parity claim that rests on a green suite is a claim about
whether Typst parsed, not about what the page looks like.
