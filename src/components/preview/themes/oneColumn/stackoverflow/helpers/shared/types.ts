import type { ThemePalette, UnifiedSectionProps } from '@/components/preview/themes/shared';

export interface StackoverflowPalette extends ThemePalette {
  /** `primary`, `bg` and `text` were dead restatements. */
  dark: string;
  headerBg: string;
}

export type StackoverflowSharedProps<T = unknown> = UnifiedSectionProps<T> & {
  p: StackoverflowPalette;
  labels: Record<string, string>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnifiedSectionComponent<T = any> = React.ComponentType<StackoverflowSharedProps<T>>;
