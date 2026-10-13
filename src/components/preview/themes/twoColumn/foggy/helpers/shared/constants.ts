import type { ThemePalette } from '@/components/preview/themes/shared';
// ⚠️ `themes/shared/palette` directly, not the barrel — see misty's copy of
// this note. foggy's `ThemePalette` barrel edge above predates this
// branch and is left alone.
import type { PaletteIdDrift } from '@/components/preview/themes/shared/palette';

export interface FoggyPalette extends ThemePalette {
  // `text` was a dead restatement of ThemePalette's. ⚠️ It survived the
  // first pass of that change because foggy declares its palette interfaces here
  // in `constants.ts` rather than in `helpers/shared/types.ts` like the other
  // eleven themes, and the scan was scoped by filename instead of by the
  // property. Both reviewer passes caught it; the scan now walks the whole theme
  // tree and asserts the interface set rather than the file count.
  primaryHover: string;
  primaryVeryLight: string;
  bgPage: string;
  bgCard: string;
  /**
   * ⚠️ Required, not optional. Foggy reads it on **both** paths —
   * `helpers/HTML/side/Education.tsx` and `FoggySerializer.ts` — so both maps
   * declare it. It was once `ThemePalette.textLight?`.
   */
  textLight: string;
}

export const PALETTES_HTML = {
  default: {
    primary: '#1a7a4a',
    primaryHover: '#15653d',
    primaryVeryLight: 'rgba(26, 122, 74, 0.05)',
    bg: '#f5f9f6',
    bgPage: '#ffffff',
    bgCard: '#ffffff',
    bgLight: 'rgba(26, 122, 74, 0.10)',
    border: '#ddeee5',
    text: '#0a1f14',
    textMain: '#0a1f14',
    textMuted: '#3d5e4a',
    textLight: '#567865',
  },
  ocean: {
    primary: '#196ee6',
    primaryHover: '#1558c0',
    primaryVeryLight: 'rgba(25, 110, 230, 0.05)',
    bg: '#f6f7f8',
    bgPage: '#ffffff',
    bgCard: '#ffffff',
    bgLight: 'rgba(25, 110, 230, 0.10)',
    border: '#dbeafe',
    text: '#0f172a',
    textMain: '#0f172a',
    textMuted: '#475569',
    textLight: '#64748b',
  },
  sunset: {
    primary: '#e25c2a',
    primaryHover: '#c44e22',
    primaryVeryLight: 'rgba(226, 92, 42, 0.05)',
    bg: '#faf7f5',
    bgPage: '#ffffff',
    bgCard: '#ffffff',
    bgLight: 'rgba(226, 92, 42, 0.10)',
    border: '#f0e8e2',
    text: '#1c0f08',
    textMain: '#1c0f08',
    textMuted: '#6b4c3b',
    textLight: '#8c6655',
  },
  purple: {
    primary: '#6d28d9',
    primaryHover: '#5b21b6',
    primaryVeryLight: 'rgba(109, 40, 217, 0.05)',
    bg: '#f5f3ff',
    bgPage: '#ffffff',
    bgCard: '#ffffff',
    bgLight: 'rgba(109, 40, 217, 0.10)',
    border: '#f0e9fb',
    text: '#171717',
    textMain: '#171717',
    textMuted: '#525252',
    textLight: '#737373',
  },
  pink: {
    primary: '#d946ef',
    primaryHover: '#c026d3',
    primaryVeryLight: 'rgba(217, 70, 239, 0.05)',
    bg: '#fae8ff',
    bgPage: '#ffffff',
    bgCard: '#ffffff',
    bgLight: 'rgba(217, 70, 239, 0.10)',
    border: '#f5d0fe',
    text: '#18181b',
    textMain: '#18181b',
    textMuted: '#52525b',
    textLight: '#71717a',
  },
} satisfies Record<string, FoggyPalette>;

export type FoggyPaletteId = keyof typeof PALETTES_HTML;

export interface FoggyPalettePDF extends ThemePalette {
  primaryVeryLight: string;
  /** Read by `FoggySerializer.ts`. See `FoggyPalette.textLight`. */
  textLight: string;
}

export const PALETTES_PDF: Record<FoggyPaletteId, FoggyPalettePDF> = {
  default: {
    primary: '#1a7a4a',
    primaryVeryLight: '#f3f9f6',
    bg: '#f5f9f6',
    bgLight: '#e8f2ed',
    border: '#ddeee5',
    text: '#0a1f14',
    textMain: '#0a1f14',
    textMuted: '#3d5e4a',
    textLight: '#567865',
  },
  ocean: {
    primary: '#196ee6',
    primaryVeryLight: '#f4f7fe',
    bg: '#f6f7f8',
    bgLight: '#e8effc',
    border: '#dbeafe',
    text: '#0f172a',
    textMain: '#0f172a',
    textMuted: '#475569',
    textLight: '#64748b',
  },
  sunset: {
    primary: '#e25c2a',
    primaryVeryLight: '#fef7f4',
    bg: '#faf7f5',
    bgLight: '#fcefe9',
    border: '#f0e8e2',
    text: '#1c0f08',
    textMain: '#1c0f08',
    textMuted: '#6b4c3b',
    textLight: '#8c6655',
  },
  purple: {
    primary: '#6d28d9',
    primaryVeryLight: '#f8f4fd',
    bg: '#f5f3ff',
    bgLight: '#f0e9fb',
    border: '#f0e9fb',
    text: '#171717',
    textMain: '#171717',
    textMuted: '#525252',
    textLight: '#737373',
  },
  pink: {
    primary: '#d946ef',
    primaryVeryLight: '#fdf4fe',
    bg: '#fae8ff',
    bgLight: '#fbe8fd',
    border: '#f5d0fe',
    text: '#18181b',
    textMain: '#18181b',
    textMuted: '#52525b',
    textLight: '#71717a',
  },
};

/**
 * The two maps offer the same palette ids — held whatever `PALETTES_PDF` is
 * annotated with, including not at all. See `PaletteIdDrift`.
 */
export type _FoggyPaletteMapsOfferTheSameIds<
  Stranger extends never = PaletteIdDrift<typeof PALETTES_HTML, typeof PALETTES_PDF>,
> = Stranger;
