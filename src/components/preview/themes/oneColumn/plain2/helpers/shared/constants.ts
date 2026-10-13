import type { Plain2Palette } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/types';

export const PALETTES = {
  default: {
    primary: '#4f46e5',
    textMain: '#374151',
    textMuted: '#6b7280',
    text: '#374151',
    bg: '#ffffff',
    bgLight: '#f9fafb',
    border: '#e5e7eb',
  },
} satisfies Record<string, Plain2Palette>;

export type Plain2PaletteId = keyof typeof PALETTES;
