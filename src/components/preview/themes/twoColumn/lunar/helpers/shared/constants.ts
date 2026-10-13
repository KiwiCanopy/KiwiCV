import type { LunarPalette } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';

/**
 * lunar's base colours. ⚠️ **Not exported**, and not a second palette map.
 *
 * It used to be exported as the theme's PDF map, which made lunar look like one
 * of the themes whose PDF colours genuinely differ. Measured: across all
 * seven palettes, **zero** keys present in both maps hold a different value —
 * `PALETTES_HTML` is exactly this object plus `fg` and `accent`, and the PDF path
 * reads neither (`p.fg` only at `LunarHTML.tsx:252,256`; `accent` is read nowhere
 * in the repo). So it was a reader-less subset copy — the same species as the
 * seven aliases deleted alongside it, just spelled differently, which is why both
 * reviewer passes caught lunar falsifying the rule that PR first wrote into
 * `themes/shared/types.ts`.
 *
 * `LunarSerializer.ts` now reads `PALETTES_HTML`; the two extra fields ride along
 * unread. Verified byte-identical on the serialized markup, all seven palettes.
 */
const BASE = {
  default: {
    bg: '#ffffff',
    bgLight: '#ffffff',
    primary: '#1a1a2e',
    textMain: '#1a1a2e',
    textMuted: '#666666',
    border: '#eeeeee',
    sidebarBg: '#1a1a2e',
    text: '#ffffff',
    sidebarText: '#e0e0e0',
    sidebarHeading: '#8892b0',
    sidebarBorder: '#30304a',
    mainBorder: '#eeeeee',
    sidebarItemBg: '#2a2a3e',
    mainItemBg: '#ffffff',
    tagBg: '#30304a',
  },
  cyan: {
    bg: '#ffffff',
    bgLight: '#ffffff',
    primary: '#163030',
    textMain: '#122626',
    textMuted: '#5d8b8b',
    border: '#e6f2f5',
    sidebarBg: '#163030',
    text: '#ffffff',
    sidebarText: '#e6f2f5',
    sidebarHeading: '#a3cbcd',
    sidebarBorder: '#234a4a',
    mainBorder: '#e6f2f5',
    sidebarItemBg: '#1d3d3d',
    mainItemBg: '#ffffff',
    tagBg: '#234a4a',
  },
  mint: {
    bg: '#ffffff',
    bgLight: '#ffffff',
    primary: '#3a4d4d',
    textMain: '#304040',
    textMuted: '#6d7d7d',
    border: '#e0eaea',
    sidebarBg: '#3a4d4d',
    text: '#ffffff',
    sidebarText: '#e0eaea',
    sidebarHeading: '#96bcbc',
    sidebarBorder: '#475e5e',
    mainBorder: '#e0eaea',
    sidebarItemBg: '#405555',
    mainItemBg: '#ffffff',
    tagBg: '#475e5e',
  },
  lilac: {
    bg: '#ffffff',
    bgLight: '#ffffff',
    primary: '#484c6d',
    textMain: '#3b3e59',
    textMuted: '#787da6',
    border: '#eceef5',
    sidebarBg: '#484c6d',
    text: '#ffffff',
    sidebarText: '#eceef5',
    sidebarHeading: '#a6aad4',
    sidebarBorder: '#585d85',
    mainBorder: '#eceef5',
    sidebarItemBg: '#505579',
    mainItemBg: '#ffffff',
    tagBg: '#585d85',
  },
  lavender: {
    bg: '#ffffff',
    bgLight: '#ffffff',
    primary: '#4a4352',
    textMain: '#3d3745',
    textMuted: '#7a7285',
    border: '#edeaf0',
    sidebarBg: '#4a4352',
    text: '#ffffff',
    sidebarText: '#edeaf0',
    sidebarHeading: '#b0a6bc',
    sidebarBorder: '#5d5467',
    mainBorder: '#edeaf0',
    sidebarItemBg: '#554d5e',
    mainItemBg: '#ffffff',
    tagBg: '#5d5467',
  },
  orchid: {
    bg: '#ffffff',
    bgLight: '#ffffff',
    primary: '#2d2a32',
    textMain: '#242229',
    textMuted: '#7a7285',
    border: '#f0edf2',
    sidebarBg: '#2d2a32',
    text: '#ffffff',
    sidebarText: '#f0edf2',
    sidebarHeading: '#b0a6bc',
    sidebarBorder: '#3d3944',
    mainBorder: '#f0edf2',
    sidebarItemBg: '#35323b',
    mainItemBg: '#ffffff',
    tagBg: '#3d3944',
  },
  berry: {
    bg: '#ffffff',
    bgLight: '#ffffff',
    primary: '#3e2a35',
    textMain: '#32222b',
    textMuted: '#7d566b',
    border: '#f5e6ee',
    sidebarBg: '#3e2a35',
    text: '#ffffff',
    sidebarText: '#f5e6ee',
    sidebarHeading: '#bc96aa',
    sidebarBorder: '#4d3442',
    mainBorder: '#f5e6ee',
    sidebarItemBg: '#46303c',
    mainItemBg: '#ffffff',
    tagBg: '#4d3442',
  },
} satisfies Record<string, LunarPalette>;

export const PALETTES = {
  default: {
    ...BASE.default,
    fg: '#1a1a2e',
    accent: '#4a90d9',
  },
  cyan: {
    ...BASE.cyan,
    fg: '#163030',
    accent: '#219ebc',
  },
  mint: {
    ...BASE.mint,
    fg: '#3a4d4d',
    accent: '#7da5a5',
  },
  lilac: {
    ...BASE.lilac,
    fg: '#484c6d',
    accent: '#9a9ee1',
  },
  lavender: {
    ...BASE.lavender,
    fg: '#4a4352',
    accent: '#9a8ba5',
  },
  orchid: {
    ...BASE.orchid,
    fg: '#2d2a32',
    accent: '#9b5de5',
  },
  berry: {
    ...BASE.berry,
    fg: '#3e2a35',
    accent: '#a65d7a',
  },
} satisfies Record<string, LunarPalette>;

export type LunarPaletteId = keyof typeof PALETTES;
