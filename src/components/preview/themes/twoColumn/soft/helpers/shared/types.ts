import React from 'react';

import type {
  CVLocaleMetadata,
  ThemePalette,
  UnifiedSectionProps,
} from '@/components/preview/themes/shared';

export interface SoftPalette extends ThemePalette {
  secondary: string;
  /**
   * ⚠️ Required, not optional. Soft reads it at **22** HTML sites across 17 files
   * and once in `SoftSerializer.ts`, and it was `ThemePalette.textLight?` until
   * An optional that gave soft no guarantee its own palettes declared the
   * colour it reads unguarded. Both of soft's palettes do.
   *
   * ⚠️ This said "20" on first writing; both reviewers counted 22 independently.
   * Recount rather than copy — `grep -c` per file, not per directory (four files
   * hold two or three reads each).
   */
  textLight: string;
  bgSoft?: string;
}

export interface SoftSharedProps<T = unknown> extends UnifiedSectionProps<T> {
  p: SoftPalette;
  labels: Record<string, string>;
  icon?: React.ReactNode;
  cvLocale: CVLocaleMetadata;
  formatCVDate: (date?: string) => string;
  formatCVDateRange: (start?: string, end?: string) => string;
  styles?: Record<string, never>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnifiedSectionComponent<T = any> = React.ComponentType<SoftSharedProps<T>>;
