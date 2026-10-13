import React from 'react';

import type {
  CVLocaleMetadata,
  SectionLabelKey,
  ThemePalette,
  UnifiedSectionProps,
} from '@/components/preview/themes/shared';

export interface SkylinePalette extends ThemePalette {
  /**
   * ⚠️ Skyline is the **only** reader of `primaryLight` in the repo — 18 HTML
   * sites plus `SkylineSerializer.ts`. It was once optional on
   * `ThemePalette`, which bought nothing: foggy and misty declared it in twenty palette
   * entries that no output read, and skyline got no guarantee it was there.
   * Required here, both maps must carry it and nobody else may.
   */
  primaryLight: string;
  primaryVeryLight: string;
  primaryMesh: string;
  meshColor1: string;
  meshColor2: string;
  meshColor3: string;
}

/**
 * ⚠️ Skyline's two maps differ in what they are *read for*, not only in their
 * values. `textLight` reaches the output through `SkylineSerializer.ts` alone —
 * no skyline HTML component reads it — so it is required on the PDF map and
 * unspeakable on the HTML one, where its three values were dead.
 *
 * ⚠️ Deadness is per **map**, not per theme, and this is the shape: the same
 * field is load-bearing on one path and inert on the other.
 */
export interface SkylinePalettePDF extends SkylinePalette {
  textLight: string;
}

export interface SkylineSharedProps<T = unknown> extends UnifiedSectionProps<T> {
  p: SkylinePalette;
  labels: Record<SectionLabelKey, string>;
  icon?: React.ReactNode;
  cvLocale: CVLocaleMetadata;
  formatCVDate: (date?: string) => string;
  formatCVDateRange: (start?: string, end?: string) => string;
  styles?: Record<string, never>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnifiedSectionComponent<T = any> = React.ComponentType<SkylineSharedProps<T>>;
