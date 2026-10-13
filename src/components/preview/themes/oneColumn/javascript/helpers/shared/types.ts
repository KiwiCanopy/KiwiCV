import React from 'react';

import type { ThemePalette, UnifiedSectionProps } from '@/components/preview/themes/shared';

export interface JavaScriptPalette extends ThemePalette {
  // `primary` was a dead restatement of ThemePalette's.
  keyword: string;
  entity: string;
  string: string;
  comment: string;
  lineNum: string;
  bgPage: string;
  paper: string;
  slate50: string;
  slate100: string;
  slate200: string;
  slate300: string;
  slate400: string;
  slate500: string;
  slate600: string;
  slate700: string;
  slate900: string;
  slate1000?: string;
}

export type JavaScriptSharedProps<T = unknown> = UnifiedSectionProps<T> & {
  p: JavaScriptPalette;
  labels: Record<string, string>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnifiedSectionComponent<T = any> = React.ComponentType<JavaScriptSharedProps<T>>;
