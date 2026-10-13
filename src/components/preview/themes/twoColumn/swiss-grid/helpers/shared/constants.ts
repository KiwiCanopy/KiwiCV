import type { SwissGridPalette } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';

export const PALETTES = {
  default: {
    primary: '#ff5722',
    textMain: '#000000',
    text: '#000000',
    textMuted: '#71717a',
    bg: '#ffffff',
    bgLight: '#f3f4f6',
    border: '#ffedd5',
  },
  rose: {
    primary: '#e11d48',
    textMain: '#000000',
    text: '#000000',
    textMuted: '#71717a',
    bg: '#ffffff',
    bgLight: '#fff1f2',
    border: '#ffe4e6',
  },
  blue: {
    primary: '#2563eb',
    textMain: '#000000',
    text: '#000000',
    textMuted: '#71717a',
    bg: '#ffffff',
    bgLight: '#eff6ff',
    border: '#dbeafe',
  },
  green: {
    primary: '#059669',
    textMain: '#000000',
    text: '#000000',
    textMuted: '#71717a',
    bg: '#ffffff',
    bgLight: '#f0fdf4',
    border: '#dcfce7',
  },
} satisfies Record<string, SwissGridPalette>;

export type SwissGridPaletteId = keyof typeof PALETTES;
