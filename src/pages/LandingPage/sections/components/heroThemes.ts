import { type ThemeId } from '@/components/preview/themeIds';

/**
 * The three themes the hero lets a visitor swap between.
 *
 * Chosen for **silhouette**, not taste. The hero renders the CV at
 * `scale-[0.207]`–`[0.285]`, a 232–320px-tall A4 where body text is around two
 * pixels — so only structural differences survive. These three read apart at
 * that size: `lunar` has a dark navy sidebar, `misty` is light with the photo
 * top-right, `timeless` is one column with no photo at all.
 *
 * ⚠️ Not interchangeable with any other trio. `swiss-grid` renders the same
 * 18.5em dark navy sidebar as `lunar`, so the two are indistinguishable at
 * hero scale and a swap between them looks like nothing happened.
 */
export const HERO_THEMES = ['lunar', 'misty', 'timeless'] as const satisfies readonly ThemeId[];

export type HeroThemeName = (typeof HERO_THEMES)[number];

export const DEFAULT_HERO_THEME: HeroThemeName = 'lunar';
