// ⚠️ `themes/shared/palette` directly, NOT the `themes/shared` barrel. That
// module has zero imports; the barrel value-imports `@/locales`, so a barrel
// edge here would put this file one `import type` flip from an import cycle
// instead of two.
import type { PaletteIdDrift } from '@/components/preview/themes/shared/palette';
import type { MistyPalette } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';

export const PALETTES_HTML = {
  default: {
    primary: '#1a7a4a',
    primaryHover: '#145c38',
    primaryVeryLight: '#1a7a4a0d', // 5% opacity hex
    text: '#0a1f14',
    textMain: '#0a1f14',
    textMuted: '#3d5e4a',
    textLight: '#567865',
    border: '#ddeee5',
    bg: '#ffffff',
    bgLight: '#f5f9f6',
    bgPage: '#ffffff',
    bgCard: '#ffffff',
    bgSidebar: '#f5f9f6',
  },
  ocean: {
    primary: '#196ee6',
    primaryHover: '#1354b3',
    primaryVeryLight: '#196ee60d',
    text: '#0f172a',
    textMain: '#0f172a',
    textMuted: '#475569',
    textLight: '#64748b',
    border: '#dbeafe',
    bg: '#ffffff',
    bgLight: '#f8fafc',
    bgPage: '#ffffff',
    bgCard: '#ffffff',
    bgSidebar: '#f8fafc',
  },
  sunset: {
    primary: '#e25c2a',
    primaryHover: '#b54921',
    primaryVeryLight: '#e25c2a0d',
    text: '#1c0f08',
    textMain: '#1c0f08',
    textMuted: '#6b4c3b',
    textLight: '#8c6655',
    border: '#f0e8e2',
    bg: '#ffffff',
    bgLight: '#faf9f8',
    bgPage: '#ffffff',
    bgCard: '#ffffff',
    bgSidebar: '#faf9f8',
  },
  purple: {
    primary: '#6d28d9',
    primaryHover: '#5b21b6',
    primaryVeryLight: '#6d28d90d',
    text: '#171717',
    textMain: '#171717',
    textMuted: '#525252',
    textLight: '#737373',
    border: '#f0e9fb',
    bg: '#ffffff',
    bgLight: '#f5f3ff',
    bgPage: '#ffffff',
    bgCard: '#ffffff',
    bgSidebar: '#f5f3ff',
  },
  pink: {
    primary: '#d946ef',
    primaryHover: '#c026d3',
    primaryVeryLight: '#d946ef0d',
    text: '#18181b',
    textMain: '#18181b',
    textMuted: '#52525b',
    textLight: '#71717a',
    border: '#f5d0fe',
    bg: '#ffffff',
    bgLight: '#fae8ff',
    bgPage: '#ffffff',
    bgCard: '#ffffff',
    bgSidebar: '#fae8ff',
  },
} satisfies Record<string, MistyPalette>;

export type MistyPaletteId = keyof typeof PALETTES_HTML;

export const PALETTES_PDF: Record<MistyPaletteId, MistyPalette> = {
  default: {
    ...PALETTES_HTML.default,
    primaryVeryLight: '#f3f9f6',
    bgLight: '#f5f9f6',
  },
  ocean: {
    ...PALETTES_HTML.ocean,
    primaryVeryLight: '#f4f7fe',
    bgLight: '#f8fafc',
  },
  sunset: {
    ...PALETTES_HTML.sunset,
    primaryVeryLight: '#fef7f4',
    bgLight: '#faf9f8',
  },
  purple: {
    ...PALETTES_HTML.purple,
    primaryVeryLight: '#f8f4fd',
    bgLight: '#f5f3ff',
  },
  pink: {
    ...PALETTES_HTML.pink,
    primaryVeryLight: '#fdf4fe',
    bgLight: '#fae8ff',
  },
};

/**
 * The two maps offer the same palette ids — held whatever `PALETTES_PDF` is
 * annotated with, including not at all. See `PaletteIdDrift` for the
 * spelling-by-spelling measurement, and `_PaletteIdMapHasNoStrangers` in
 * `themePaletteIds.ts` for why this is a type parameter constrained to `never`
 * rather than a conditional type or a `const _check`.
 */
export type _MistyPaletteMapsOfferTheSameIds<
  Stranger extends never = PaletteIdDrift<typeof PALETTES_HTML, typeof PALETTES_PDF>,
> = Stranger;
