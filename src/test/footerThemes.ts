import { ALL_THEME_IDS, type ThemeId } from '@/components/preview/themeIds';

/**
 * Every theme that emits a signature footer — **all twelve**.
 *
 * ⚠️ It was nine until elegant, plain and plain2 were given one. Those three
 * emitted nothing while `PdfFooterSection` was rendered ungated in `DesignTab`
 * with its toggle defaulting to on, so the editor offered a footer, a location
 * and a date on a theme whose export had none. `footerLocation.test.ts` recorded
 * the absence as a *measured fact*, which is not a decision, and no issue, wiki
 * page or comment ever gave one.
 *
 * ⚠️ **`NO_FOOTER_THEMES` is deleted rather than left empty.** An empty set makes
 * every `for (const t of NO_FOOTER_THEMES)` assertion pass without executing —
 * the census would have read green while measuring nothing. The complement is
 * gone because there is nothing in it; if a theme ever drops its footer, this
 * alias is what has to be narrowed deliberately.
 *
 * Being `ALL_THEME_IDS` also means a thirteenth theme joins every footer sweep
 * by construction instead of by someone remembering.
 */
export const FOOTER_THEMES: readonly ThemeId[] = ALL_THEME_IDS;
