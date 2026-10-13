import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ThemeRegistry } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS, THEME_LAYOUTS, type ThemeId } from '@/components/preview/themeIds';
import { getBoundFormatters } from '@/components/preview/themes/shared/translations';
import { buildSingleItemResume } from '@/test/singleItemResume';
import type { ResumeData } from '@/types/resume';
import { describe, expect, it } from 'vitest';

/**
 * A custom section renders in every theme, in both outputs and both
 * columns — titled, untitled (the CV-language fallback heading) and with a
 * hidden entry left out. Preview and PDF must agree on all of it.
 */

const TITLED = { id: 'a1a1a1a1-0000-4000-8000-000000000001', title: 'Speaking Engagements' };
const UNTITLED_ID = 'b2b2b2b2-0000-4000-8000-000000000002';

const entry = (name: string, extra: Record<string, unknown> = {}) => ({
  name,
  startDate: '2023-04',
  endDate: '',
  url: '',
  summary: `${name} summary`,
  highlights: [`${name} highlight`],
  ...extra,
});

type Column = 'main' | 'sidebar';

function fixture(themeId: ThemeId, titledIn: Column): ResumeData {
  const data = buildSingleItemResume(themeId);
  data.customSections = [
    {
      ...TITLED,
      items: [entry('Visible talk', { _vId: 'v1' }), entry('Hidden talk', { _vId: 'h1' })],
    },
    { id: UNTITLED_ID, title: '  ', items: [entry('Untitled entry', { _vId: 'u1' })] },
  ];
  const titled = `custom:${TITLED.id}`;
  const untitled = `custom:${UNTITLED_ID}`;
  data.meta.content.hiddenIds = [...data.meta.content.hiddenIds, `${titled}:h1`];

  const order = data.meta.content.order;
  const builtIns = (ids: string[]) => ids.filter((id) => !id.startsWith('custom:'));
  order.oneColumn = [...builtIns(order.oneColumn), titled, untitled];
  const main = builtIns(order.twoColumn.main);
  const sidebar = builtIns(order.twoColumn.sidebar);
  order.twoColumn.main = titledIn === 'main' ? [...main, titled] : [...main, untitled];
  order.twoColumn.sidebar = titledIn === 'main' ? [...sidebar, untitled] : [...sidebar, titled];
  return data;
}

function render(themeId: ThemeId, data: ResumeData) {
  const bound = getBoundFormatters(data);
  const html = renderToStaticMarkup(
    createElement(ThemeRegistry[themeId].HTMLComponent, {
      data,
      formatCVDate: bound.formatCVDate,
      formatCVDateRange: bound.formatCVDateRange,
    }),
  );
  return { html: html.toLowerCase(), typst: SERIALIZERS[themeId](data).toLowerCase() };
}

const RUNS = ALL_THEME_IDS.flatMap((themeId) =>
  THEME_LAYOUTS[themeId] === 'two-column'
    ? (['main', 'sidebar'] as const).map((column) => ({ themeId, column }))
    : [{ themeId, column: 'main' as const }],
);

describe('custom sections in every theme', () => {
  it.each(RUNS)(
    '$themeId ($column): heading and visible entry, in both outputs',
    ({ themeId, column }) => {
      const { html, typst } = render(themeId, fixture(themeId, column));
      for (const output of [html, typst]) {
        expect(output).toContain('speaking engagements');
        expect(output).toContain('visible talk');
      }
    },
  );

  it.each(RUNS)(
    '$themeId ($column): a hidden entry is in neither output',
    ({ themeId, column }) => {
      const { html, typst } = render(themeId, fixture(themeId, column));
      expect(html).not.toContain('hidden talk');
      expect(typst).not.toContain('hidden talk');
    },
  );

  it.each(RUNS)(
    '$themeId ($column): an untitled section takes the fallback heading',
    ({ themeId, column }) => {
      const data = fixture(themeId, column);
      data.volunteer = [];
      const { html, typst } = render(themeId, data);
      for (const output of [html, typst]) {
        expect(output).toContain('untitled entry');
        expect(output).toContain('additional details');
      }
    },
  );

  it.each(ALL_THEME_IDS)(
    '%s: never puts a volunteer glyph on a custom section, in either output',
    (themeId) => {
      const data = fixture(themeId, 'main');
      // Volunteer and interests legitimately carry a heart in some themes.
      data.volunteer = [];
      data.interests = [];
      const { html, typst } = render(themeId, data);
      expect(typst).not.toMatch(/"heart(-handshake)?"/);
      expect(html).not.toMatch(/lucide-heart/);
    },
  );
});
