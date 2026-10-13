import type { PlainPalette } from '@/components/preview/themes/oneColumn/plain/helpers/shared/types';

export const PALETTES = {
  default: {
    bg: '#ffffff',
    bgLight: '#f8f9fa',
    primary: '#000000',
    textMain: '#000000',
    textMuted: '#333333',
    border: '#cccccc',
    text: '#000000',
  },
} satisfies Record<string, PlainPalette>;

export type PlainPaletteId = keyof typeof PALETTES;
