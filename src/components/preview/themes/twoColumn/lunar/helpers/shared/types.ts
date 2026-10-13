import type {
  CVLocaleMetadata,
  SectionLabelKey,
  ThemePalette,
  UnifiedSectionProps,
} from '@/components/preview/themes/shared';

/**
 * Lunar was the only theme without a palette interface of its own — it aliased
 * `ThemePalette` and leaned on that type's `[key: string]: any`, so its eight
 * sidebar/main/tag colours were checked by nothing. Declaring them is what let
 * the index signature go, which is what makes a re-added `nameKey` (or
 * a typo'd `sidebarBoder`) a build error rather than a silent `undefined`.
 *
 * `fg` and `accent` are optional because only the HTML map carries them; the
 * PDF map is the same palettes without those two.
 */
export interface LunarPalette extends ThemePalette {
  sidebarBg: string;
  sidebarText: string;
  sidebarHeading: string;
  sidebarBorder: string;
  sidebarItemBg: string;
  mainItemBg: string;
  mainBorder: string;
  tagBg: string;
  fg?: string;
  accent?: string;
}

export interface LunarSharedProps<T = unknown> extends UnifiedSectionProps<T> {
  p: LunarPalette;
  labels: Record<SectionLabelKey, string>;
  cvLocale: CVLocaleMetadata;
  formatCVDate: (date?: string) => string;
  formatCVDateRange: (start?: string, end?: string) => string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnifiedSectionComponent<T = any> = React.ComponentType<LunarSharedProps<T>>;
