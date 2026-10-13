import type { ComponentType } from 'react';

import type {
  CVLocaleMetadata,
  SectionLabelKey,
  ThemePalette,
  UnifiedSectionProps,
} from '@/components/preview/themes/shared';

export interface TimelessPalette extends ThemePalette {
  /**
   * ⚠️ **Not a restatement — `ThemePalette` does not declare this at all.**
   * It used to be `textLight?` there, and this was a *narrowing* to
   * required; the field has moved onto the five themes that read it, so timeless
   * now owns it outright. Held by `TS2741` on every palette literal in
   * `constants.ts` — **not** by the serializer read, which a template literal
   * would accept as `string | undefined` in silence. Mutation-verified both ways:
   * dropping this declaration produces zero errors at the read site.
   *
   * ⚠️ Two earlier versions of this comment were wrong about *why*, each caught
   * by a review. It first credited `TimelessSerializer.ts:162` for interpolating
   * `p.textLight` "with no guard"; that read is now `p.textLight || '#71717a'`
   * and could not emit `undefined` on its own. What the declaration buys is that
   * the fallback stays **unreachable** and the colour stays single-sourced in
   * `constants.ts` rather than being restated three files away.
   *
   * `text` beside it *was* a dead restatement and is gone.
   */
  textLight: string;
}

export interface TimelessSharedProps<T = unknown> extends UnifiedSectionProps<T> {
  p: TimelessPalette;
  labels: Record<SectionLabelKey, string>;
  cvLocale: CVLocaleMetadata;
  formatCVDate: (date?: string) => string;
  formatCVDateRange: (start?: string, end?: string) => string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnifiedSectionComponent<T = any> = ComponentType<TimelessSharedProps<T>>;
