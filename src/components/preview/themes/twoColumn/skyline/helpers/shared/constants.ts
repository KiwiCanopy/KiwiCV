// ⚠️ `themes/shared/palette` directly, not the barrel — see misty's copy of
// this note.
import type { PaletteIdDrift } from '@/components/preview/themes/shared/palette';
import type {
  SkylinePalette,
  SkylinePalettePDF,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';

export const PALETTES_HTML = {
  default: {
    primary: '#4cb2e6',
    primaryLight: '#e0f2fe',
    primaryVeryLight: '#f0f9ff',
    primaryMesh: '#bae6fd',
    meshColor1: '#4cb2e6',
    meshColor2: '#60a5fa',
    meshColor3: '#818cf8',
    bg: '#f8fafc',
    bgLight: '#f1f5f9',
    text: '#0f172a',
    textMain: '#0f172a',
    textMuted: '#475569',
    border: '#bae6fd',
  },
  sunset: {
    primary: '#f87171',
    primaryLight: '#fee2e2',
    primaryVeryLight: '#fef2f2',
    primaryMesh: '#fecaca',
    meshColor1: '#f87171',
    meshColor2: '#fb923c',
    meshColor3: '#fbbf24',
    bg: '#fffaf9',
    bgLight: '#fff1f2',
    text: '#450a0a',
    textMain: '#450a0a',
    textMuted: '#7f1d1d',
    border: '#fecaca',
  },
  green: {
    primary: '#059669',
    primaryLight: '#dcfce7',
    primaryVeryLight: '#f0fdf4',
    primaryMesh: '#bbf7d0',
    meshColor1: '#059669',
    meshColor2: '#06b6d4',
    meshColor3: '#10b981',
    bg: '#f9fdfa',
    bgLight: '#ecfdf5',
    text: '#064e3b',
    textMain: '#064e3b',
    textMuted: '#065f46',
    border: '#bbf7d0',
  },
} satisfies Record<string, SkylinePalette>;

export type SkylinePaletteId = keyof typeof PALETTES_HTML;

export const PALETTES_PDF: Record<SkylinePaletteId, SkylinePalettePDF> = {
  default: {
    primary: '#4cb2e6',
    primaryLight: '#e0f2fe',
    primaryVeryLight: '#f0f9ff',
    primaryMesh: '#bae6fd',
    bg: '#e0f2fe',
    bgLight: '#f0f9ff',
    textMain: '#1e293b',
    text: '#1e293b',
    textMuted: '#64748b',
    textLight: '#64748b',
    border: '#bae6fd',
    meshColor1: '#4cb2e6',
    meshColor2: '#bae6fd',
    meshColor3: '#e0f2fe',
  },
  sunset: {
    primary: '#f87171',
    primaryLight: '#fee2e2',
    primaryVeryLight: '#fef2f2',
    primaryMesh: '#fecaca',
    bg: '#fff7ed',
    bgLight: '#fffaf5',
    textMain: '#1e293b',
    text: '#1e293b',
    textMuted: '#64748b',
    textLight: '#64748b',
    border: '#ffedd5',
    meshColor1: '#f87171',
    meshColor2: '#ffedd5',
    meshColor3: '#fff7ed',
  },
  green: {
    primary: '#059669',
    primaryLight: '#dcfce7',
    primaryVeryLight: '#f0fdf4',
    primaryMesh: '#bbf7d0',
    bg: '#f0fdf4',
    bgLight: '#f7fee7',
    textMain: '#1e293b',
    text: '#1e293b',
    textMuted: '#64748b',
    textLight: '#64748b',
    border: '#d1fae5',
    meshColor1: '#059669',
    meshColor2: '#a7f3d0',
    meshColor3: '#f0fdf4',
  },
};

/**
 * The two maps offer the same palette ids — held whatever `PALETTES_PDF` is
 * annotated with, including not at all. See `PaletteIdDrift`.
 */
export type _SkylinePaletteMapsOfferTheSameIds<
  Stranger extends never = PaletteIdDrift<typeof PALETTES_HTML, typeof PALETTES_PDF>,
> = Stranger;
