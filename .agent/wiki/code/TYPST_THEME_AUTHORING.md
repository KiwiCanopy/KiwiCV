# Typst Theme Authoring Guide

> **Last Updated: 2026-07-24**

## Contents

- [Directory & Theme Structure](#directory-theme-structure)
- [Coordinating Shell Setup (`*Serializer.ts`)](#coordinating-shell-setup-serializerts)
- [Core Layout Conventions](#core-layout-conventions)
- [See Also](#see-also)

This page is the **serializer-authoring guide**: how a theme's Typst
serialization logic is laid out, how the coordinating shell routes sections, and
the core layout conventions every serializer must follow. For the **compile
engine and runtime** (WASM worker, font handling, escaping, CLI test-compile)
see [PDF_ENGINE_TYPST.md](./PDF_ENGINE_TYPST.md). For the broader **theme
architecture** — the HTML preview path, serializer registry, and shared helpers
— see [THEME_SYSTEM.md](./THEME_SYSTEM.md).

---

## Directory & Theme Structure

To strictly enforce our **300-Line Limit Rule** and keep theme compilation code highly maintainable, each theme's Typst serialization logic is decomposed into a layout coordinating shell and three granular thematic helper sub-files:

```
src/components/preview/themes/
├── [oneColumn|twoColumn]/[themeName]/
│   ├── [ThemeName]Serializer.ts     # Coordinating Shell (< 250 lines)
│   └── helpers/
│       └── typst/
│           ├── experience.ts        # Career Experience helper (< 250 lines)
│           ├── educationSkills.ts   # Education & Skills helper (< 250 lines)
│           └── achievementsReferences.ts # Achievements & References (< 250 lines)
```

### Granular Responsibility Splitting

Every theme must modularize its section-specific serialization logic across these three files:

1. **`experience.ts`**:
   - Work Experience (`work`)
   - Projects / Private Projects (`projects` / `privateProjects`)
   - Volunteer Work (`volunteer`)
2. **`educationSkills.ts`**:
   - Education (`education`)
   - Skills (`skills`)
   - Languages (`languages`)
3. **`achievementsReferences.ts`**:
   - Awards (`awards`)
   - Certificates (`certificates`)
   - Publications (`publications`)
   - References (`references`)
   - Interests (`interests`)
   - Contact / About / Summary (theme-dependent contact blocks)

---

## Coordinating Shell Setup (`*Serializer.ts`)

The main coordinating shell imports the modular section serializers and routes incoming sections:

```typescript
import {
  serializeAwards,
  serializeCertificates,
  serializeInterests,
  serializePublications,
  serializeReferences,
} from './helpers/typst/achievementsReferences';
import {
  serializeEducation,
  serializeLanguages,
  serializeSkills,
} from './helpers/typst/educationSkills';
import { serializeProjects, serializeVolunteer, serializeWork } from './helpers/typst/experience';

// Inside serializeToTypst...
const serializeSection = (sectionId: string, ctx: typeof context): string => {
  switch (sectionId) {
    case 'work':
      return serializeWork(ctx);
    case 'education':
      return serializeEducation(ctx);
    case 'projects':
    case 'privateProjects':
      return serializeProjects(sectionId, ctx);
    case 'volunteer':
      return serializeVolunteer(ctx);
    case 'skills':
      return serializeSkills(ctx);
    case 'languages':
      return serializeLanguages(ctx);
    case 'awards':
      return serializeAwards(ctx);
    case 'certificates':
      return serializeCertificates(ctx);
    case 'publications':
      return serializePublications(ctx);
    case 'references':
      return serializeReferences(ctx);
    case 'interests':
      return serializeInterests(ctx);
    default:
      return '';
  }
};
```

---

## Core Layout Conventions

### 1. Unified Fonts Stack

All themes must use the centralized font resolver helpers from [typstUtils.ts](../../../src/components/preview/themes/shared/typstUtils.ts) to define their Typst `#set text(font: ...)` stack.
This resolves warnings and ensures proper fallback font stacks:

```typescript
#set text(font: ${getTypstFontList('sans')}) // resolves to ("Inter", "Noto Sans CJK SC", "Noto Sans CJK JP", "Noto Sans", "DejaVu Sans")
```

### 2. Global Resume Text Rhythm

All migrated Typst serializers must use `getTypstResumeSpacingSettings()` from `@/components/preview/themes/shared/typstUtils` immediately after the global `#set text(...)` declaration:

```typescript
#set text(
  font: ${getTypstFontList('sans')},
  size: ${9 * fontScale}pt,
  hyphenate: true,
  lang: "${cvLocale.code}"
)
${getTypstResumeSpacingSettings()}
```

The helper emits:

```typst
#set par(leading: 0.18em, spacing: 0.4em)
#set list(tight: false, spacing: 0.4em)
```

`leading: 0.2em` targets a total line height of roughly `1.2x` the active text size, and `list(spacing: 0.4em)` adds a resume-appropriate gap between bullet items. Because both settings use `em`, they scale automatically with the active Typst text size, including KiwiCV `fontScale` and local `#set text(size: ...)` overrides inside entries.

Highlight lists should inherit this global rhythm. Keep theme-specific markers, colors, and text sizes, but do not add per-list `tight` or `spacing` arguments unless a theme has a deliberate documented exception.

### 3. Page Break Control

Manual user page-breaks are supported at section boundaries by checking metadata configurations. When a break is configured and the section has visible items, insert a `#pagebreak()`:

```typescript
const hasBreak = hasPageBreak(meta, 'oneColumn', sectionId);
if (hasBreak && hasItems) {
  markup += `\n#pagebreak()\n`;
}
```

### 4. Section Header Orphan Prevention

All Typst serializers must prevent section headers from being stranded alone at the bottom of a page. Use the shared TypeScript guard helpers from `typstSectionGuards.ts` instead of reimplementing this logic per theme.

For list sections, build item markup first and lock the header with the first entry:

```typescript
import { keepTypstHeaderWithFirstEntry } from '@/components/preview/themes/shared/typstSectionGuards';

return keepTypstHeaderWithFirstEntry({
  header: `#theme-section("${escapeTypstString(label)}")`,
  entries,
});
```

For grid/card sections, lock the header with only the first rendered row, not the whole grid:

```typescript
import { keepTypstHeaderWithFirstGridRow } from '@/components/preview/themes/shared/typstSectionGuards';

return keepTypstHeaderWithFirstGridRow({
  header: `#theme-section("${escapeTypstString(label)}")`,
  cards,
  columns: '(1fr, 1fr)',
  firstRowCount: 2,
  columnGutter: `${20 * fontScale}pt`,
  rowGutter: `${12 * fontScale}pt`,
  remainingPrefix: `#v(${12 * fontScale}pt)\n`,
});
```

Single-block sections such as About or compact Contact may pass the whole section body as a single entry to `keepTypstHeaderWithFirstEntry`. Theme-specific entry/card markup remains local to each theme; only the pagination guard is shared.

### 5. Highlight List Spacing

Typst `#list(tight: true, ...)` compresses the vertical gap between bullet items and can make separate highlight bullets sit closer together than wrapped lines inside one bullet. Do not set `tight` or `spacing` on normal Work/Projects/Volunteer highlight lists; inherit the global `#set list(tight: false, spacing: 0.4em)` emitted by `getTypstResumeSpacingSettings()` instead:

```typst
#list(
  marker: text(...)[•],
  ...items
)
```

Only override this if a theme's serializer intentionally renders dense bullet lists and the exception is documented in that serializer/helper.

---

## See Also

- [PDF_ENGINE_TYPST.md](./PDF_ENGINE_TYPST.md) — the compile engine and runtime:
  WASM worker, font handling, escaping gotchas, and the local CLI test-compile.
- [THEME_SYSTEM.md](./THEME_SYSTEM.md) — the theme architecture: HTML preview,
  serializer registry, and shared helpers.
