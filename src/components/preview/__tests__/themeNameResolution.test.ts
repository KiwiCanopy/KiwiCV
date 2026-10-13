import { getThemeMeta } from '@/components/preview/ThemeRegistry';
import {
  ALL_THEME_IDS,
  DEFAULT_THEME,
  THEME_LAYOUTS,
  resolveThemeId,
} from '@/components/preview/themeIds';
import { getTwoColumnSections } from '@/components/preview/themes/shared/sections';
import { initialResumeState } from '@/types/resume';
import type { ResumeData } from '@/types/resume';
import { isTwoColumnTheme } from '@/utils/layout/predicates';
import { getDefaultTwoColumnLayout } from '@/utils/layoutMetadata';
import { describe, expect, it } from 'vitest';

/**
 * One stored string, and it used to be normalised three different ways.
 *
 * | reader | normalisation |
 * | --- | --- |
 * | `getThemeMeta` (picks the rendered component) | exact id, else `DEFAULT_THEME` |
 * | `isTwoColumnTheme` | `name.toLowerCase()` |
 * | `getDefaultTwoColumnLayout` | `name.toLowerCase().replace(/-/g, '_')` |
 *
 * The defect was first framed as a hyphen disagreement about `swiss-grid`. Before the
 * fix it was far worse: **any** name that is not an exact id rendered an
 * empty CV. `getThemeMeta` falls back to lunar, which is two-column, while
 * `isTwoColumnTheme` answered `false`, so `getTwoColumnSections` returned two
 * empty columns and lunar emitted its chrome and nothing else — markup 18032
 * characters down to 4857, `main` and `sidebar` both `[]`, for `'swiss-grid'`,
 * `'Swiss-Grid'` and `'zzz'` alike.
 *
 * The property this file pins is the one that makes the three collapse into one:
 * **every question about a stored theme name is answered about the theme that
 * will actually be rendered.**
 *
 * ⚠️ The old cases that looked like coverage were passing by luck. `'Lunar'`
 * lowercases to a two-column id *and* falls back to a two-column theme, so both
 * answers agreed; `'Timeless'` lowercases to a one-column id and falls back to
 * two-column lunar, and rendered nothing. A fixture built only from
 * capitalised two-column names cannot see the defect — the same shape as round
 * fifteen's `de`-versus-`fr`.
 */

/**
 * Deliberately mixed: exact ids (where every normalisation agrees and nothing is
 * under test), wrong case on **both** layouts, the hyphenated folder name, the
 * two `Object.prototype` keys that survive a lowercasing, junk, and the empty
 * string.
 */
const STORED_NAMES = [
  ...ALL_THEME_IDS,
  'Lunar',
  'Timeless',
  'SWISS_GRID',
  'swiss-grid',
  'Swiss-Grid',
  'plain-2',
  'constructor',
  '__proto__',
  'toString',
  'not-a-theme',
  '',
] as const;

describe('every reader of a stored theme name agrees with the renderer', () => {
  it.each(STORED_NAMES)('%o', (name) => {
    const rendered = getThemeMeta(name).id;

    expect(rendered).toBe(resolveThemeId(name));
    expect(isTwoColumnTheme(name)).toBe(THEME_LAYOUTS[rendered] === 'two-column');
    expect(getDefaultTwoColumnLayout(name)).toEqual(getDefaultTwoColumnLayout(rendered));
  });

  /**
   * ⚠️ The control that keeps the sweep above from being a tautology over a
   * uniform fixture. If every name resolved to the same theme — which is what a
   * `resolveThemeId` that always returned `DEFAULT_THEME` would do — the three
   * assertions would still all pass. This pins that the fixture separates the
   * two layouts and that the exact ids are left alone.
   */
  it('the fixture reaches both layouts and leaves exact ids untouched', () => {
    const resolved = STORED_NAMES.map(resolveThemeId);

    expect(new Set(resolved).size).toBeGreaterThan(1);
    expect(new Set(resolved.map((id) => THEME_LAYOUTS[id]))).toEqual(
      new Set(['one-column', 'two-column']),
    );
    for (const id of ALL_THEME_IDS) {
      expect(resolveThemeId(id)).toBe(id);
    }
  });

  it('an unrecognised name resolves to the default theme', () => {
    expect(resolveThemeId('not-a-theme')).toBe(DEFAULT_THEME);
    expect(resolveThemeId(undefined)).toBe(DEFAULT_THEME);
    expect(getThemeMeta('not-a-theme').id).toBe(DEFAULT_THEME);
  });
});

/**
 * The user-visible half, and the reason this is a bug rather than an
 * inconsistency: a résumé whose stored theme name is not an exact id must still
 * render its sections.
 *
 * ⚠️ Asserted through `getTwoColumnSections` rather than on the markup, because
 * that getter is the state the disagreement actually reached — it is what
 * returned `{ main: [], sidebar: [] }` while a two-column component was on
 * screen. The markup-length collapse is the symptom.
 */
describe('a résumé with a non-exact stored theme name still has sections', () => {
  const withTheme = (name: string): ResumeData => {
    const data = structuredClone(initialResumeState) as unknown as ResumeData;
    data.work = [{ _vId: 'w', name: 'ACME', position: 'Dev' } as ResumeData['work'][number]];
    data.skills = [{ _vId: 's', name: 'TypeScript' } as ResumeData['skills'][number]];
    data.meta.theme.name = name;
    data.meta.content.order.twoColumn = {
      main: ['work'],
      sidebar: ['skills'],
      sidebarPosition: 'left',
    };
    return data;
  };

  it.each([['swiss-grid'], ['Swiss-Grid'], ['Timeless'], ['not-a-theme'], ['']])(
    'a stored theme name of %o renders its columns',
    (name) => {
      const data = withTheme(name);
      const { main, sidebar } = getTwoColumnSections(data.meta, data);

      expect(main).toEqual(['work']);
      expect(sidebar).toEqual(['skills']);
    },
  );

  /**
   * The other direction, so the case above is not satisfied by a
   * `getTwoColumnSections` that stopped gating: a genuine one-column theme must
   * still get two empty columns.
   */
  it('a one-column theme id still gets two empty columns', () => {
    const data = withTheme('plain');

    expect(getTwoColumnSections(data.meta, data)).toEqual({ main: [], sidebar: [] });
  });
});
