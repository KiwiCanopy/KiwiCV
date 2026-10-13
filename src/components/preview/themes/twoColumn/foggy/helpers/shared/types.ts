import React from 'react';

import type {
  CVLocaleMetadata,
  SectionLabelKey,
  UnifiedSectionProps,
} from '@/components/preview/themes/shared';
import type { FoggyPalette } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/constants';

export type FoggySharedProps<T> = UnifiedSectionProps<T> & {
  p: FoggyPalette;
  labels: Record<SectionLabelKey, string>;
  icon?: React.ReactNode | string;
  cvLocale: CVLocaleMetadata;
  formatCVDate: (date?: string) => string;
  formatCVDateRange: (startDate?: string, endDate?: string) => string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnifiedSectionComponent<T = any> = React.FC<FoggySharedProps<T>>;

export type { FoggyPalette, SectionLabelKey };
