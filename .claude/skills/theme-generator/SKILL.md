---
name: theme-generator
description: Scaffold a new KiwiCV CV theme — HTML preview plus Typst serializer — and register it everywhere the compiler demands.
---

Add a new CV theme. There is **no boilerplate script**: the old generator
emitted a `@react-pdf/renderer` scaffold, and that engine is gone. This is a
copy-and-adapt procedure.

`.claude/rules/themes.md` loads alongside this and carries what binds while you
write the code. This is the order of operations.

## Why this is a skill

A theme is **two coordinated outputs and six registration sites**. The version
of this procedure that lived in `.agent/skills/project/` listed two of the six
and was never loaded by anything, so it could not be corrected by being wrong.

## 1. Copy a reference theme

- Two-column: `src/components/preview/themes/twoColumn/foggy/`
- One-column: `src/components/preview/themes/oneColumn/elegant/`

Rename the folder and its `{Name}HTML.tsx` / `{Name}Serializer.ts` entry files.

## 2. Adapt the HTML preview

`{Name}HTML.tsx` plus `helpers/HTML/` section components. Palettes and types go
in `helpers/shared/constants.ts` and `helpers/shared/types.ts`. Standard CSS and
rgba are fine on this side.

The palette map must end `} satisfies Record<string, {Name}Palette>` and publish
`export type {Name}PaletteId = keyof typeof PALETTES;`. An annotation instead
unbinds every guard in step 4 — see the rule.

## 3. Adapt the Typst serializer

`{Name}Serializer.ts` exporting `serializeToTypst(data)`, plus the
`helpers/typst/` section modules. Use the shared escaping, font, spacing and
guard helpers rather than writing your own.

## 4. Register it in all seven places

Add the id and its layout to `src/components/preview/themeIds.ts`
(`ALL_THEME_IDS`, `THEME_LAYOUTS`), then:

| Site                                         | What                                                            |
| -------------------------------------------- | --------------------------------------------------------------- |
| `src/components/preview/ThemeRegistry.ts`    | HTML component + metadata                                       |
| `src/components/preview/ThemeSerializers.ts` | the `serializeToTypst` entry                                    |
| `src/components/preview/themePaletteIds.ts`  | id → your `{Name}PaletteId`                                     |
| `src/locales/en/themes.ts`                   | `themes.names` + `themes.palettes`                              |
| `src/components/preview/letterCapacity.ts`   | `COVER_LETTER_PAGE_WORDS` — measured, never guessed (see below) |

The id must be identical everywhere, and `tsc -b` fails until it is.

**Run `tsc -b` and follow the errors** rather than working this table. Each site
has a distinct failure — `TS2344` for a stranger palette key, `TS2739` for a
missing display name, `TS2353` for a name with no palette, `TS2345` for a
missing swatch. The chain is designed to be walked.

Then propagate the new locale keys: `npm run i18n:sync`, and register them in
`scripts/i18n/handoff-catalog.cjs`. `.claude/rules/i18n.md` covers that part.

The `COVER_LETTER_PAGE_WORDS` row is how many words of prose fit on the new
theme's letter page in each layout. Add a placeholder to get past `tsc`, then
run `MEASURE_LETTER=1 npx vitest run coverLetterCapacity` and paste the theme's
row from its output there and into the `SWEEP` literal in
`src/utils/__tests__/coverLetterLength.test.ts` — `npm test` renders the row
from both sides and fails on a guess in either direction.

## 5. Preview image

`public/images/previews/{themeId}.png`, pointed at by `previewImage`.

## 6. Verify — and look at the PDF

```bash
npm run lint -- src/components/preview/themes/<type>/<ThemeName>/
npm run build
npm test
RENDER_THEME=<themeId> npm run pdf:render
```

`npm test` compiles the new theme automatically once its id is in
`ALL_THEME_IDS` — no per-theme test to write.

⚠️ **A green suite here means Typst parsed, nothing more.** It does not check
the compile is warning-free: `$typst.pdf` resolves on warnings and nothing
inspects diagnostics, so a font family you invented passes silently. Check the
stack against `public/fonts`, then open
`scratch/<themeId>-single.pdf` and compare it against the preview side by side.

`RENDER_FIXTURE=placeholder` renders the new-user resume — the fixture that has
a profile image, and the one where a sidebar theme usually breaks first.
