import type { SoftPalette } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';

export const PALETTES = {
  default: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    textMain: '#1e293b',
    text: '#ffffff',
    textMuted: '#64748b',
    textLight: '#94a3b8',
    bg: '#ffffff',
    bgLight: '#f8fafc',
    bgSoft: '#f8fafc',
    border: '#c7d2fe',
  },
  ocean: {
    primary: '#0ea5e9',
    secondary: '#22d3ee',
    textMain: '#1e293b',
    text: '#ffffff',
    textMuted: '#64748b',
    textLight: '#94a3b8',
    bg: '#ffffff',
    bgLight: '#f0f9ff',
    bgSoft: '#f0f9ff',
    border: '#bae6fd',
  },
} satisfies Record<string, SoftPalette>;

export type SoftPaletteId = keyof typeof PALETTES;
