import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ThemeRegistry } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS } from '@/components/preview/themeIds';
import { getBoundFormatters } from '@/components/preview/themes/shared/translations';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { describe, expect, it } from 'vitest';

/**
 * Pass-through blocks are held for the round trip and never rendered.
 * The control proves the same sentinel would be seen if it reached a renderer.
 */
const SENTINEL = 'passthrough-render-sentinel';

const render = (themeId: (typeof ALL_THEME_IDS)[number], sentinelIn: 'passthrough' | 'summary') => {
  const data = buildSingleItemResume(themeId);
  if (sentinelIn === 'passthrough') data.passthrough = { kiwitalents: { note: SENTINEL } };
  else data.basics.summary = SENTINEL;

  const bound = getBoundFormatters(data);
  const html = renderToStaticMarkup(
    createElement(ThemeRegistry[themeId].HTMLComponent, {
      data,
      formatCVDate: bound.formatCVDate,
      formatCVDateRange: bound.formatCVDateRange,
    }),
  );
  return { html, typst: SERIALIZERS[themeId](data) };
};

describe('pass-through data in the 12 themes', () => {
  it.each(ALL_THEME_IDS)('%s renders none of it, in the preview or the PDF', (themeId) => {
    const { html, typst } = render(themeId, 'passthrough');
    expect(html).not.toContain(SENTINEL);
    expect(typst).not.toContain(SENTINEL);
  });

  it.each(ALL_THEME_IDS)('%s would show the sentinel if it were a rendered field', (themeId) => {
    const { html, typst } = render(themeId, 'summary');
    expect(html).toContain(SENTINEL);
    expect(typst).toContain(SENTINEL);
  });
});
