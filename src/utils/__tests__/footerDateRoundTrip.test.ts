import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS, type ThemeId } from '@/components/preview/themeIds';
import { getThemeTranslations } from '@/components/preview/themes/shared/translations';
import { getTypstFooterParts } from '@/components/preview/themes/shared/typstFooter';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { FOOTER_THEMES } from '@/test/footerThemes';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { initialResumeState } from '@/types/resume';
import type { ResumeData } from '@/types/resume';
import { sanitizeResumeData } from '@/utils/validation';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * `meta.theme.params.footerDate` is a **three-state label**, not a date,
 * and `s()`'s `key.toLowerCase().includes('date')` heuristic used to route it
 * through `normalizeDate`/`isValidDate`.
 *
 * ⚠️ **The user-visible half is the toggle, and asserting the stored string is
 * not enough to see it.** `'none'` is what unchecking "show footer date" writes
 * (`PdfFooterSection.tsx:115`); the date branch blanked it to `''`, and
 * `getTypstFooterParts` treats `''` and `'auto'` identically. So the round trip
 * does not merely lose a value — it turns the footer date back **on**. Every
 * case here therefore asserts the rendered footer parts as well as the stored
 * value, because the stored-value assertion alone would let a fix that maps
 * `'none'` to `''` pass.
 *
 * ⚠️ **Measured through `setResume`, not through `sanitizeResumeData` alone.**
 * That is the only production path in, and it runs `validateSkills` and the
 * store's own merge after the sanitizer — measuring at the nearest function has
 * twice given the wrong answer in this repo.
 *
 * ⚠️ The free-text half is independent of the toggle: adding `'none'` to
 * `isPresentVariant` (the tempting one-word fix) fixes
 * the toggle rows and leaves every free-text label blanked. Both halves are
 * driven here so that fix fails.
 */

const EN = getThemeTranslations('en');

function roundTrip(footerDate: string): { stored: string | undefined; parts: string[] } {
  const imported = structuredClone(initialResumeState) as unknown as ResumeData;
  imported.basics.name = 'Ada Lovelace';
  imported.meta.theme.params = { ...imported.meta.theme.params, footerDate };

  useResumeStore.getState().setResume(imported, { silent: true });
  const resume = useResumeStore.getState().resume;

  return {
    stored: resume.meta.theme.params?.footerDate,
    parts: getTypstFooterParts(resume, EN),
  };
}

describe('footerDate survives an export/import round trip', () => {
  beforeEach(() => {
    useResumeStore
      .getState()
      .setResume(structuredClone(initialResumeState) as unknown as ResumeData, {
        silent: true,
      });
  });

  it.each([
    ['none', 'none'],
    ['15 January 2026', '15 January 2026'],
    ['Jan 2026', 'Jan 2026'],
    ['Sommer 2026', 'Sommer 2026'],
    ['2026-07-26', '2026-07-26'],
    ['auto', 'auto'],
    ['', ''],
  ] as const)('keeps %o as %o', (stored, expected) => {
    expect(roundTrip(stored).stored).toBe(expected);
  });

  it('leaves the footer date off after a round trip', () => {
    const { parts } = roundTrip('none');
    expect(parts).toEqual([]);
  });

  it.each([['15 January 2026'], ['Jan 2026'], ['Sommer 2026']] as const)(
    'prints the free-text label %o verbatim after a round trip',
    (label) => {
      expect(roundTrip(label).parts).toEqual([label]);
    },
  );

  /**
   * The positive control for the two above: `'auto'` must still resolve to a
   * generated date. Without it a fix that blanks the whole footer would pass the
   * `'none'` case, and a fix that suppresses the date unconditionally would pass
   * both.
   */
  it('still generates a date for auto', () => {
    const { parts } = roundTrip('auto');
    expect(parts).toHaveLength(1);
    expect(parts[0]).not.toBe('');
    expect(parts[0]).not.toBe('auto');
  });

  /**
   * ⚠️ The value half at the sanitizer, with the warning. The blanking used to
   * come with `editor.errors.non_standard_date` on a row the warnings UI cannot
   * head, so the user was told a "non-standard date format" was found in a
   * setting they never typed a date into.
   */
  it.each([['none'], ['15 January 2026'], ['Jan 2026']] as const)(
    'raises no import warning for %o',
    (value) => {
      const { warnings } = sanitizeResumeData({
        meta: { theme: { params: { footerDate: value } } },
      } as Record<string, unknown>);

      expect(warnings).toEqual([]);
    },
  );
});

/**
 * ⚠️ **The footer-date rule has TWO implementations, and the block above guards
 * one of them.** `getTypstFooterParts` (`themes/shared/typstFooter.ts`) is the
 * shared one; `JavaScriptSerializer.ts:155` keeps its own copy — deliberately,
 * because javascript is the only footer with a placeholder-city
 * fallback and only the *location* half is genuinely its own. The date half is a
 * restatement, so a fix asserted through the shared helper alone says nothing
 * about the theme that does not use it.
 *
 * This drives every theme's real serializer output instead. The set is derived
 * at runtime and then pinned — a theme that silently stops emitting a date would
 * otherwise drop out of the sweep and leave it green over fewer cases.
 *
 * ⚠️ It was **nine** of twelve until elegant, plain and plain2 were given a
 * footer; they emitted none while the design panel offered the toggle on every
 * theme. The pin is `FOOTER_THEMES` now rather than a literal, because the two
 * are the same list and one of them was about to go stale.
 */
describe('every theme that has a footer date honours the setting', () => {
  const serialize = (themeId: ThemeId, footerDate: string): string => {
    const data = buildSingleItemResume(themeId) as ResumeData;
    data.meta.theme.params = { ...data.meta.theme.params, footerDate };
    return SERIALIZERS[themeId](data);
  };

  const withFooterDate = ALL_THEME_IDS.filter(
    (id) => serialize(id, 'auto') !== serialize(id, 'none'),
  );

  it('every theme with a footer emits a footer date', () => {
    expect([...withFooterDate].sort()).toEqual([...FOOTER_THEMES].sort());
  });

  it.each(withFooterDate)('%s prints a free-text label verbatim', (themeId) => {
    expect(serialize(themeId, 'ZQFOOTERLABEL')).toContain('ZQFOOTERLABEL');
  });

  /**
   * The other half: the sentinel must not be something the theme emits anyway.
   * Without this, a serializer that ignored `footerDate` entirely but happened to
   * contain the string would pass the case above.
   */
  it.each(withFooterDate)('%s emits the label only when it is set', (themeId) => {
    expect(serialize(themeId, 'auto')).not.toContain('ZQFOOTERLABEL');
    expect(serialize(themeId, 'none')).not.toContain('ZQFOOTERLABEL');
  });
});
