import type {
  CVLocaleMetadata,
  ThemePalette,
  UnifiedSectionProps,
} from '@/components/preview/themes/shared';

/**
 * swiss-grid adds no colours of its own. The rationale for keeping the alias, and
 * the rule against re-expanding it, are on `PlainPalette`
 * (`themes/oneColumn/plain/helpers/shared/types.ts`); enforcement is in
 * `preview/__tests__/paletteInterfaces.test.ts`.
 */
export type SwissGridPalette = ThemePalette;

export type SwissGridSharedProps<T = unknown> = UnifiedSectionProps<T> & {
  p: SwissGridPalette;
  labels: Record<string, string>;
  cvLocale: CVLocaleMetadata;
  formatCVDate: (date?: string) => string;
  formatCVDateRange: (start?: string, end?: string) => string;
  scale: number;
  styles?: Record<string, never>;
  num?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SwissGridSectionComponent<T = any> = React.ComponentType<SwissGridSharedProps<T>>;
