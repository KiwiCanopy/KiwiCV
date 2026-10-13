import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ThemeRegistry } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS, type ThemeId } from '@/components/preview/themeIds';
import { getBoundFormatters, getThemeTranslations } from '@/components/preview/themes/shared';
import { formatDateRange } from '@/components/preview/themes/shared/dates';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { PLACEMENT_RUNS, type Placement, applyPlacement } from '@/test/themePlacements';
import { ONGOING_DATE_WORDS, isOngoingEndDate } from '@/utils/ongoingDate';
import { describe, expect, it } from 'vitest';

/**
 * An imported CV keeps `"endDate": "Present"` verbatim — `normalizeDate`
 * preserves the ongoing words by design — so the renderers have to read the word
 * as open-ended, exactly as they read an empty end date.
 */
describe('an ongoing word as an end date', () => {
  const de = getThemeTranslations('de');
  const ja = getThemeTranslations('ja');

  it('renders as the locale’s own "present", like an empty one', () => {
    for (const word of [...ONGOING_DATE_WORDS, 'Present', ' NOW ']) {
      expect(formatDateRange('2019-03', word, de)).toBe(formatDateRange('2019-03', '', de));
      expect(formatDateRange('2019-03', word, ja)).toContain(ja.present);
    }
    expect(formatDateRange('2019-03', 'Present', ja)).not.toContain('Present');
  });

  it('is not "present" when it is the start date', () => {
    expect(formatDateRange('Present', '2020-01', de)).not.toContain(de.present);
  });

  it('marks the entry ongoing only for an empty or ongoing end date', () => {
    expect(isOngoingEndDate('')).toBe(true);
    expect(isOngoingEndDate(undefined)).toBe(true);
    expect(isOngoingEndDate('Present')).toBe(true);
    expect(isOngoingEndDate('2023-06')).toBe(false);
  });

  it.each(ALL_THEME_IDS)('prints the localized word in the %s PDF', (themeId) => {
    const data = buildSingleItemResume(themeId);
    data.meta.theme = { ...data.meta.theme, locale: 'ja' };
    data.work[0].endDate = 'Present';

    const typst = SERIALIZERS[themeId](data);

    expect(typst).toContain(ja.present);
    expect(typst).not.toContain('Present年');
  });

  /**
   * Every theme, not a list of the ones known to style an ongoing entry: a stored
   * word must produce exactly what an empty end date does, dot and accent included.
   */
  // ⚠️ Both placements: the default puts most dated sections in the sidebar,
  // which draws no ongoing dot, so the swapped run is what reaches them.
  const withEndDate = (themeId: ThemeId, placement: Placement, endDate: string) => {
    const data = buildSingleItemResume(themeId);
    applyPlacement(data, placement);
    data.meta.theme = { ...data.meta.theme, locale: 'de' };
    const dated = [data.work, data.volunteer, data.education, data.projects, data.privateProjects];
    for (const section of dated) {
      for (const item of section) item.endDate = endDate;
    }
    return data;
  };

  it.each(PLACEMENT_RUNS)(
    'treats it exactly as an empty end date in the %s PDF (%s)',
    (themeId, placement) => {
      const typst = (endDate: string) =>
        SERIALIZERS[themeId](withEndDate(themeId, placement, endDate));

      expect(typst('Present')).toBe(typst(''));
    },
  );

  it.each(PLACEMENT_RUNS)(
    'treats it exactly as an empty end date in the %s preview (%s)',
    (themeId, placement) => {
      const html = (endDate: string) => {
        const data = withEndDate(themeId, placement, endDate);
        const bound = getBoundFormatters(data);
        return renderToStaticMarkup(
          createElement(ThemeRegistry[themeId].HTMLComponent, {
            data,
            formatCVDate: bound.formatCVDate,
            formatCVDateRange: bound.formatCVDateRange,
          }),
        );
      };

      expect(html('Present')).toBe(html(''));
    },
  );
});
