import type { StackoverflowPalette } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/types';

export const PALETTES = {
  default: {
    primary: '#f48024',
    dark: '#242729',
    bg: '#ffffff',
    bgLight: '#fafafa',
    text: '#3c4146',
    textMain: '#3c4146',
    textMuted: '#6a737c',
    border: '#e4e6e8',
    headerBg: '#fafafa',
  },
  dark: {
    primary: '#242729',
    dark: '#f1f2f3',
    bg: '#121212',
    bgLight: '#1e1e1e',
    text: '#e4e6e8',
    textMain: '#e4e6e8',
    textMuted: '#9199a1',
    border: '#2d2d2d',
    headerBg: '#1e1e1e',
  },
} satisfies Record<string, StackoverflowPalette>;

export type StackoverflowPaletteId = keyof typeof PALETTES;
