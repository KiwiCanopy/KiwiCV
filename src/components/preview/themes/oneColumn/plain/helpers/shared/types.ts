import type {
  CVLocaleMetadata,
  SectionLabelKey,
  ThemePalette,
  UnifiedSectionProps,
} from '@/components/preview/themes/shared';
import type { ResumeMeta } from '@/types/resume';

export type PlainStyles = Record<string, never>;

/**
 * plain adds no colours of its own. `plain2` has been in this form all along;
 * plain and swiss-grid joined it later.
 *
 * The alias is kept rather than inlining `ThemePalette` at the use sites — 7 `p:`
 * annotations across the two themes, 19 references in all. ⚠️ Not the "~40" once
 * claimed, which was the 40 theme × palette verification figure
 * leaking into a sentence about prop sites. The real reason is not churn: nine of
 * twelve themes own a named `*Palette`, so inlining these would make three
 * structurally different from nine and push the shared base type into theme-local
 * prop types, reopening every site the first time swiss-grid wants a colour. An
 * alias duplicates a *name*; a restatement duplicates a *fact* and can drift.
 *
 * ⚠️ Do not re-expand it into an `interface … extends ThemePalette` that restates
 * required fields — nor into `= ThemePalette & { … }` doing the same. Both forms
 * are checked by `preview/__tests__/paletteInterfaces.test.ts`. Declare a field
 * only when this theme needs something `ThemePalette` does not give it.
 */
export type PlainPalette = ThemePalette;

export interface PlainSharedProps<T = unknown> extends UnifiedSectionProps<T> {
  p: PlainPalette;
  labels: Record<SectionLabelKey, string>;
  cvLocale: CVLocaleMetadata;
  formatCVDate: (date?: string) => string;
  formatCVDateRange: (start?: string, end?: string) => string;
  styles: PlainStyles;
  meta?: ResumeMeta;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnifiedSectionComponent<T = any> = React.ComponentType<PlainSharedProps<T>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PlainSectionComponent<T = any> = UnifiedSectionComponent<T>;
