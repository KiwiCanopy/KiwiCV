import type { JavaScriptPalette } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/types';

export const PALETTES = {
  light: {
    primary: '#196ee6',
    keyword: '#d73a49',
    entity: '#6f42c1',
    string: '#032f62',
    comment: '#6a737d',
    lineNum: '#cbd5e1',
    bgPage: '#f6f7f8',
    paper: '#ffffff',
    slate50: '#f8fafc',
    slate100: '#f1f5f9',
    slate200: '#e2e8f0',
    slate300: '#cbd5e1',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate600: '#475569',
    slate700: '#334155',
    slate900: '#0f172a',
    // Required fields for ThemePalette
    bg: '#f6f7f8',
    bgLight: '#ffffff',
    text: '#0f172a',
    textMain: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
  },
  dark: {
    primary: '#58a6ff',
    keyword: '#ff7b72',
    entity: '#d2a8ff',
    string: '#a5d6ff',
    comment: '#8b949e',
    lineNum: '#484f58',
    bgPage: '#0d1117',
    paper: '#161b22',
    slate50: '#010409',
    slate100: '#1c2128',
    slate200: '#30363d',
    slate300: '#484f58',
    slate400: '#6e7681',
    slate500: '#8b949e',
    slate600: '#b1bac4',
    slate700: '#d0d7de',
    slate900: '#f0f6fc',
    // Required fields for ThemePalette
    bg: '#0d1117',
    bgLight: '#161b22',
    text: '#f0f6fc',
    textMain: '#f0f6fc',
    textMuted: '#8b949e',
    border: '#30363d',
  },
} satisfies Record<string, JavaScriptPalette>;

export type JavaScriptPaletteId = keyof typeof PALETTES;

/**
 * The two font stacks this theme renders with, in one place.
 *
 * Each was written out locally in every section component — `FONT_MONO` twelve
 * times, `FONT_SANS` eleven — which is how a stack drifts from the face that is
 * actually registered without anything noticing. `JetBrains Mono` in particular
 * once had no `@font-face` at all, so all twelve copies were falling
 * through to the browser's generic `monospace` in unison.
 *
 * ⚠️ Not routed through `themes/shared/fonts.ts`: `resolveHTMLFontStack` returns
 * **one** family per theme, and this theme deliberately mixes two — mono for
 * code-like chrome, sans for body copy. `THEME_FONTS.javascript` covers the
 * first; this covers the pair. `fontFamilyRegistration.test.ts` checks both
 * against `tokens.css` either way, since it is scoped by the font-family strings
 * rather than by which module produced them.
 */
export const FONT_MONO = '"JetBrains Mono", monospace';
export const FONT_SANS = '"Inter", sans-serif';
