import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { getThemeList } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { type ResumeData, initialResumeState } from '@/types/resume';
import { enrichResumeWithPlaceholders } from '@/utils/placeholder-fallback';
import { describe, expect, it } from 'vitest';

const buildResume = (themeId: string): ResumeData => {
  const resume = structuredClone(initialResumeState);
  resume.meta.theme.name = themeId;
  resume.meta.theme.locale = 'en';
  return enrichResumeWithPlaceholders(resume);
};

describe('Design rendering boundary', () => {
  it.each(getThemeList())('renders the $id HTML template with resume content', (theme) => {
    const resume = buildResume(theme.id);
    const markup = renderToStaticMarkup(
      createElement(theme.HTMLComponent, {
        data: resume,
        formatCVDate: (value?: string) => value || '',
        formatCVDateRange: (start?: string, end?: string) => `${start || ''}-${end || ''}`,
      }),
    );

    expect(markup.length).toBeGreaterThan(500);
    expect(markup).toContain('John Doe');
  });

  it.each(Object.entries(SERIALIZERS))(
    'serializes the %s Typst template with the same resume content',
    (themeId, serialize) => {
      const markup = serialize(buildResume(themeId));

      expect(markup.length).toBeGreaterThan(500);
      expect(markup).toContain('John Doe');
    },
  );
});
