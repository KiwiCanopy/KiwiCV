# PDF Rendering Engine (ARCHIVED — @react-pdf/renderer)

> **ARCHIVED 2026-07-23.** This engine is gone: `@react-pdf/renderer` is no
> longer a dependency, and PDF generation runs on Typst — see
> [Typst PDF Engine](../code/PDF_ENGINE_TYPST.md). Kept for historical context
> only; do not treat anything below as current behaviour. The only surviving
> traces in the codebase are stale `react-pdf` comments in
> `src/components/preview/themes/shared/images.ts`.

> **Last Updated: 2026-05-18**

## Overview

PDF generation is powered by **@react-pdf/renderer**. This allows rendering React components directly into PDF documents in the browser.

## Layout Constraints & Rules

PDF rendering has unique constraints compared to web:

- **Zero Inline Styles**: All styling MUST be passed via the `style` prop from a central `StyleSheet`.
- **Source Order vs. Visual Order**: For ATS (Applicant Tracking Systems), the "Main" column must be rendered before the "Sidebar" in the PDF document source, even if the Sidebar is visually on the left.
- **Hex-Only Colors**: `PALETTES_PDF` must use hex (`#RRGGBB` or `#RRGGBBAA`). Named colors or HSL are not supported.
- **No Hyphenation**: Automatic hyphenation is disabled in `shared.ts` to prevent "noglyph" errors.

## Page Breaks & Logic

- `hasPageBreak(meta, column, sectionId)`: Used to determine if a manual page break should be inserted before a section.
- **Anti-Squeezing Rule**: Content should never be "squeezed" to fit a page; prefer standard spacing and let content flow naturally or use manual breaks.

## Typography & Fonts

- `registerFonts()`: Must be called once before rendering the PDF.
- `resolveFont(themeId, locale, data)`: Dynamically selects the correct font stack based on the theme and detected character sets (CJK/Cyrillic support).
- **Fonts used**: Inter, Plus Jakarta Sans, Lora, JetBrains Mono, and Noto Sans family for international support.

## Icons

- **PDF Icons**: Must import from `@/assets/pdf-icons/Icons`. These are SVG paths optimized for `@react-pdf`.
- **Weight**: PDF icons are often post-processed via `scripts/thicken_svg.py` to ensure consistent visual weight.

## ATS Friendliness

- All text is rendered as actual text elements (not images).
- Semantic grouping is preserved where possible.
- Column order is strictly Main -> Sidebar in the source code.
