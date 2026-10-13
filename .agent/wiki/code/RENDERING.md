# Rendering Principles

> **Last Updated: 2026-08-29**

[Typst PDF Engine](PDF_ENGINE_TYPST.md)

Each theme renders the same `ResumeData` two ways: a **React-DOM HTML preview**
(`{Name}HTML.tsx`) and a **Typst markup string** (`{Name}Serializer.ts`) that is
compiled to PDF in the browser. There is no `@react-pdf/renderer` — no `<View>`,
`<Text>`, `<Link>`, `PdfIcon`, `StyleSheet.create`, or `{Name}PDF.tsx`. Keep the
two outputs visually consistent from the single shared data source.

## General Principles

1. **Defensive Rendering**: Use `?.` and `&&` guards for all resume data.
2. **Date Standardization**: Use bound formatters (`formatCVDate`,
   `formatCVDateRange`) instead of raw functions. HTML components get them from
   the `useBoundFormatters(data)` hook; serializers use `getBoundFormatters(data)`
   (non-hook, since they run outside React).
3. **Single Data Source**: Both renderers consume the same `getVisibleData(data)`
   and the same section order (`getMainSections` / `getSideSections` /
   `getOneColumnSections`).
4. **Overlap Prevention (HTML)**: Use `flex: 1` on titles/names and
   `flex-shrink: 0` on secondary info (dates/labels).
5. **ATS-Friendly Source Order**: Render the **main** column before the
   **sidebar** in source order, in both outputs.

## HTML Preview (React DOM)

- The `{Name}HTML.tsx` entry maps section IDs to the theme's React section
  components (`helpers/HTML/main/`, and `helpers/HTML/side/` for two-column
  themes) and lays out the columns.
- Style with normal CSS / inline styles; rgba, gradients, and shadows are fine.
- Resolve the font stack with `resolveHTMLFontStack(themeId)`.
- **Links**: `<a target="_blank" rel="...">` wrapping the text plus a
  lucide-react icon (e.g. `ExternalLink`).
- Use the theme's `ThemeHeading` for accessible section headings.

## Fonts

**A font file in `public/fonts` is not a font the app can use.** Each renderer
has its own registry and neither reads the other's:

| Renderer          | Registered in                                | Adding a family means        |
| :---------------- | :------------------------------------------- | :--------------------------- |
| Browser (preview) | `@font-face` in `styles/tokens.css`          | a block per weight and style |
| Typst (PDF)       | `EAGER_FONT_FILES`, or `lazy-font-info.json` | a filename, then regenerate  |

Both failures are silent. The browser substitutes a system face for an
unregistered family without a word; Typst logs `unknown font family: x` and
still emits a PDF. So a theme can render in the wrong typeface indefinitely, and
the preview and the export can disagree, with a green suite either way — which
is what was once found in three themes, and in a shared stack.

- `themes/shared/fonts.ts` drives **only the HTML preview**. Its `THEME_FONTS`
  never reaches a serializer; per-theme PDF font choice lives in the serializer's
  own `getTypstFontList('sans' | 'serif')` call. Keeping the two in agreement is
  manual, per theme.
- Both maps in that file are pinned to a `ThemeFontFamily` union, so a theme
  naming a family with no CSS stack is a build error. Note the shape this must
  take: `satisfies Record<ThemeId, string>` plus a derived
  `(typeof MAP)[ThemeId]` **degenerates to `string`** and checks nothing — write
  the union out.
- `preview/__tests__/fontFamilyRegistration.test.ts` renders every theme both
  ways and checks the families that come back out. It is scoped by the rendered
  output rather than by any module name, because the font stacks have no shared
  spelling to scan for.
- A CSS stack's later entries (`-apple-system`, `'Segoe UI'`, the generics) are
  fallbacks and are _supposed_ to be unregistered — only the primary is checked.
  Typst has no system fallback, so **every** entry in a Typst stack is checked.
- A bare generic (`monospace`, `serif`) in an inline preview style names no face
  the PDF can match, and the guard skips generics, so it cannot flag the drift.
  When one element wants its own face, name a registered family on both sides —
  Swiss Grid's section numbers asked for `Courier` in Typst and `monospace` in
  the preview, and the PDF set them in Inter.
- The HTML export inherits the app's own `@font-face` rules through its `<base>`
  tag. It needs no web-font `<link>`, and once had a stale Google Fonts one.

## PDF Rendering (Typst)

The `{Name}Serializer.ts` shell returns a full Typst document string, delegating
sections to `helpers/typst/{experience,educationSkills,achievementsReferences}.ts`
and building icons/footers/cover-letter markup from the shared helpers.

- **Escaping**: use `escapeTypst` for markup (`[...]`) contexts and
  `escapeTypstString` for string-literal (`"..."`) contexts; route every link
  destination through `sanitizeUrl`.
- **Fonts & rhythm**: `getTypstFontList('sans' | 'serif')` for the font stack and
  `getTypstResumeSpacingSettings()` for global spacing. Picking `serif` here is
  what makes a theme's PDF match a Lora preview — see [Fonts](#fonts) — and a
  theme that writes its own stack instead of calling this must still only name
  registered families.
- **Icons**: `serializeIconsMap` embeds SVG icons; `getProfileDisplayPDF`
  resolves social-network icon names.
- **Pagination**: use the `typstSectionGuards.ts` helpers
  (`keepTypstHeaderWithFirstEntry`, `keepTypstHeaderWithFirstGridRow`) to prevent
  orphaned section headers; insert `#pagebreak()` when `hasPageBreak(...)`.
- **Footer**: build via `typstFooter.ts` helpers.

Do **not** duplicate the Typst rules here — follow the
["PDF Rendering (Typst)" section of CONVENTIONS.md](CONVENTIONS.md) and the
compiler/font/worker pipeline in [PDF_ENGINE_TYPST.md](PDF_ENGINE_TYPST.md).

## Common Components (HTML)

Each theme's `helpers/shared/CommonHTML.tsx` provides shared HTML section
primitives:

- `SectionHeader`: standardized title and icon rendering.
- `TimelineEntry`: for chronological data (Work, Education, Volunteer).
- `LevelBar` / `DiscreteLevelBar`: visual proficiency indicators (Skills,
  Languages).

The equivalent PDF markup lives in each theme's `helpers/typst/` serializers, not
in a shared PDF component.

## Section Logic Overview

| Section       | Key Component   | Notes                                               |
| :------------ | :-------------- | :-------------------------------------------------- |
| **Work/Edu**  | `TimelineEntry` | Main: Paragraphs/Bullets. Side: Compact titles.     |
| **Skills**    | `LevelBar`      | Normalizes 1-5 or 1-10 levels to percentages.       |
| **Projects**  | `Projects`      | Both `projects` and `privateProjects` share this.   |
| **Languages** | `LevelBar`      | Includes fluency labels and certificate sub-labels. |

### Chronological Sections (Work, Volunteer, Education)

- **Reference**: Foggy `TimelineEntry` component.
- **Main Column**:
  - **Level 1**: Name/Company and Position on first line. Date range badge on the right.
  - **Level 2**: Subtitle line renders the existing subtitle plus `location` with a `·` separator when both are present.
  - **Level 3**: Summary paragraph and bulleted highlights.
- **Sidebar Column**:
  - **Compactness**: Hide summaries and highlights.
  - **Date Badge**: Position at the very top of the item for scannability.
  - **Level 2**: Keep the same subtitle/location pattern in the compact header so the entry stays scannable without losing place context.

### Awards & Projects

- **Awards**: Show `location` on the subtitle/meta line with the same `·` separator when present.
- **Projects**: Show `location` on the meta line next to the project entity/type, using the same separator rule and suppressing the separator when location is empty.

### Skills & Languages

- **Normalization**: Use `getLevelInfo(level, 'skill' | 'language')` to get `{ value, max }`.
- **ATS Note**: Always include the text label for the level/fluency (e.g., "Native", "Fluent") next to visual bars.
- **Languages**: Use `getLanguageLabel(level, fluency, localeCode)` for combined "Level (Certificate)" text.

### Projects

- **Unified Component**: Both `projects` and `privateProjects` MUST use the same `Projects` component.
- **Icons**:
  - `projects`: Use `'folder'` icon.
  - `privateProjects`: Use `'rocket'` icon.
- **Link**: Wrap the project name in a `Link` if a URL is provided.

### Other Sections (Interests, References, Certificates, Awards)

- **Simple Items**: Use simple `SectionHeader` + List or Paragraph format.
- **References**: Often displayed in a grid or two-column sub-layout within the main column.
- **Awards/Certificates**: Similar to `TimelineEntry` but usually more compact (single line title + date).

---

_Derived from legacy rendering/sections/_

---

_Derived from legacy rendering/general.md and checklist.md_
