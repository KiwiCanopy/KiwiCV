# Key Conventions

> **Last Updated: 2026-07-24**

## General Principles

- **Never trust `tsc --noEmit` here**: the root `tsconfig.json` is `"files": []` plus project references, so a bare `npx tsc --noEmit` type-checks **nothing** and exits 0 on code that does not compile. Use `npx tsc -b` (what `npm run build` runs, and what Netlify runs). A change that passes `tsc --noEmit` and `vitest` can still fail the deploy preview.
- **Defensive Rendering**: Always use optional chaining (`?.`) and logical AND (`&&`) guards. Resume data is often partial or missing.
- **Strict Import Aliasing**: Always use the `@/` module alias. Avoid relative paths like `../` even if in the same directory.
- **Responsive Height Pattern**: Modals and scrollable containers MUST use the `h-responsive` utility (defined in `index.css`). Use `ModalContainer` with `scrollable={true}` (default). To ensure the scrollbar is correctly positioned at the edge and height constraints are respected, **AVOID** adding padding to the `ModalContainer` itself via `className`. Instead, wrap the content in an inner `div` with padding (e.g., `<div className="p-6">`).
- **300 Line Limit**: Files MUST NOT exceed 300 lines. If a component, hook, or utility grows beyond this, it must be modularized following the decomposition patterns (Hook/Item/Logic).
- **Overflow & Dropdowns**: Root card containers (`AccordionItem`, `ProfileItem`) must NOT use `overflow-hidden` to avoid clipping absolute-positioned dropdowns. Use `overflow-hidden` only on nested containers that handle truncation.
- **Cloud Backup Naming (Dual-Naming Architecture)**:
  - Always use `resume.json` for the primary "Manual Backup" (latest state).
  - Use `{backupFileName}.json` for project-specific snapshots (e.g., `MyResume_position_Engineer_company_Google_theme_standard.json`) to preserve full metadata. Store all backups under `backups/{lang}/` to ensure restoration discovery works correctly.
  - For generated export folders and ZIP files, strictly use `getCleanProjectName()` to strip metadata keys (e.g., `MyResume_Engineer_Google`), preventing ugly paths and false collisions on file systems.

## Performance & Lazy Loading

- **Route-Level Splitting**: Use `React.lazy()` strictly at the route level (in `App.tsx`). This is the primary mechanism for isolating heavy dependencies like the Typst WASM compiler (`@myriaddreamin/typst.ts`), which is loaded in a worker off the main bundle.
- **UX Stability (Anchor Links)**: Avoid lazy loading components _within_ a single page (e.g., landing page sections). All components belonging to a single vertical scroll view must be available in the same chunk to ensure anchor-link navigation ("ghost jumps") is instant and free of layout shifts.
- **Suspense Wrappers**: Every lazy route must be wrapped in a `<Suspense>` boundary using the shared `<RouteLoader>` component to maintain visual consistency.

## Date Granularity & Precision

- **Progressive Selection**: Dates in the editor use a `Year -> Month -> Day` flow. Users can stop at any level of precision.
- **Stored Formats**:
  - Year only: `YYYY`
  - Month precision: `YYYY-MM`
  - Day precision: `YYYY-MM-DD`
- **Semantic "Current" Dates**: End-date fields that are "present" or "ongoing" are stored as empty strings (`''`). The `DatePicker` provides an explicit action to clear the value for these cases.

## PDF Rendering (Typst)

- **Global Hyphenation**: Always enable hyphenation and dynamic language setting globally in the main `#set text(...)` block of theme serializers to prevent long words from overflowing column boundaries (especially in multi-column or sidebar layouts):
  ```typst
  #set text(
    font: ...,
    size: 9pt,
    hyphenate: true,
    lang: "${cvLocale.code}"
  )
  ```
- **Code Mode vs Markup Mode Syntax**: Inside function argument lists of layout blocks (like `grid(...)` or `stack(...)`), you are in Typst code mode; do not prefix function calls with `#` (e.g., use `align` or `text` instead of `#align` or `#text`). However, inside bracket parameters `[...]` (which enter Typst markup mode), you MUST prefix function calls with `#` (e.g., `#text(...)`), otherwise Typst renders them as literal plain text.
- **Line Breaks & Escapes**: Always add a trailing space after line breaks (`\\ ` instead of just `\\`) when followed immediately by `#` characters. This prevents Typst from parsing the backslash and hash as `\#` (which is the escape sequence to print a literal hash symbol).
- **Dynamic Colored Icons**: All standard, social, and link icons take their colour from the active palette. Pass `paletteIconFills(themeMeta.id, resume.meta?.theme?.params?.palette)` to `serializeIconsMap(resume, fills)` — never a hand-picked colour, and never the palette's swatch (`ui`), which on lunar, timeless and javascript is a _background_. A theme whose icons need a different colour declares `iconUi` on its registry palettes; the serializer has no per-theme branches and must not grow any.
- **Anti-Orphan Header Binding**: Section headers must never be orphaned at the bottom of pages. Wrap BOTH the section header block and the first entry (or the entire grid call) inside a single non-breakable block: `#block(width: 100%, breakable: false)[ ... ]`.

## HTML Rendering

- **Link Pattern**: Use `<a target="_blank">` wrapping both the text and an `ExternalLink` icon.
- **Formatters**: Use `useBoundFormatters(data)` (React hook).

## Netlify Functions

- **ESM Extension**: All functions MUST use the `.mjs` extension to ensure ESM compatibility.
- **Extension Imports**: Imports MUST include the full file extension (e.g., `./utils.js`).
- **Descriptive Logging**: Every non-200 return MUST be preceded by a `console.warn` (for client errors/4xx) or `console.error` (for server/config errors) to ensure visibility in the Netlify Log Viewer.
- **Log Format**: Use the format `[Module/Action] Reason (Details)` for easy filtering in the Netlify portal.
- **Environment Validation**: Validate required environment variables at the top of the file or library and log a `console.error` if missing.

## Theme specific

- **Footer**: A theme's serializer emits the shared footer via `typstFooter` (`themes/shared/typstFooter.ts`); there is no `<PDFFooter>` component (react-pdf is gone).
- **Manual Page Breaks**: Use `hasPageBreak(meta, column, sectionId)` to check for user-defined breaks.
- **Icons**:
  - Projects: Use `'folder'`.
  - Private Projects: Use `'rocket'`.
  - Icon-name strings are resolved to embedded SVGs by `serializeIconsMap(resume, fills)` (`themes/shared/iconSerializer.ts`). The old react-pdf `@/assets/pdf-icons/Icons` (`PdfIcon`) is dead — do not import it.

---

_Derived from legacy core/conventions.md_
