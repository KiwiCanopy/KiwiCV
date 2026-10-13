import type {
  CVLocaleMetadata,
  SectionLabelKey,
  ThemePalette,
  UnifiedSectionProps,
} from '@/components/preview/themes/shared';

export interface ElegantPalette extends ThemePalette {
  /** The only colour elegant adds. `text` and `bg` were dead restatements. */
  accent: string;
}

export interface ElegantSharedProps<T = unknown> extends UnifiedSectionProps<T> {
  p: ElegantPalette;
  labels: Record<SectionLabelKey, string>;
  cvLocale: CVLocaleMetadata;
  formatCVDate: (date?: string) => string;
  formatCVDateRange: (start?: string, end?: string) => string;
  fontFamily?: string;
}

export interface ElegantPDFSharedProps<T = unknown> extends ElegantSharedProps<T> {
  styles: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ElegantSectionComponent<T = any> = React.ComponentType<ElegantSharedProps<T>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ElegantPDFSectionComponent<T = any> = React.ComponentType<ElegantPDFSharedProps<T>>;
