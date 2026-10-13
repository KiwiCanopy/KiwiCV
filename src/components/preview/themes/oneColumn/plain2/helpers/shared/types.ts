import type { ThemePalette, UnifiedSectionProps } from '@/components/preview/themes/shared';

export type Plain2Palette = ThemePalette;

export type Plain2SharedProps<T = unknown> = UnifiedSectionProps<T> & {
  p: Plain2Palette;
  labels: Record<string, string>;
  s?: Record<string, never>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnifiedSectionComponent<T = any> = React.ComponentType<Plain2SharedProps<T>>;
