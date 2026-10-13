import type { ElegantPalette } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/types';

export const PALETTES = {
  default: {
    accent: '#4a5568',
    text: '#2d3748',
    bg: '#ffffff',
    primary: '#4a5568',
    textMain: '#2d3748',
    textMuted: '#718096',
    bgLight: '#f7fafc',
    border: '#e2e8f0',
  },
} satisfies Record<string, ElegantPalette>;

export type ElegantPaletteId = keyof typeof PALETTES;
