// @vitest-environment jsdom
import { ResumeHTML } from '@/components/preview/ResumeHTML';
import { buildPlaceholderResume } from '@/test/placeholderResume';
import { named, sourceFiles } from '@/test/sourceFiles';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

/**
 * A Turkish CV uppercases a dotted `i` to `İ`. `toUpperCase()` maps it
 * to `I`, so "İletişim" printed "İLETIŞIM".
 */
describe('Turkish uppercase in the HTML preview', () => {
  const renderTurkish = () => {
    const resume = buildPlaceholderResume('swiss_grid');
    resume.meta.theme.name = 'swiss_grid';
    resume.meta.theme.locale = 'tr';
    return render(<ResumeHTML data={resume} />).container;
  };

  it('marks the CV with its own language, so CSS uppercase follows it', () => {
    expect(renderTurkish().querySelector('[lang]')?.getAttribute('lang')).toBe('tr-TR');
  });

  it('uppercases headings the Turkish way', () => {
    const text = renderTurkish().textContent ?? '';
    expect(text).toContain('İLETİŞİM');
    expect(text).not.toContain('İLETIŞIM');
  });

  it('no theme uppercases CV text without the CV locale', async () => {
    const { readFileSync } = await import('node:fs');
    const files = sourceFiles('src/components/preview/themes', {
      extensions: ['.ts', '.tsx'],
      skip: [named('__tests__')],
      // Country codes are ASCII and must not follow a Turkish locale.
    }).filter((file) => !file.endsWith('shared/address.ts'));
    expect(files.length).toBeGreaterThan(10);
    // A bare `toLocaleUpperCase()` follows the host's locale, not the CV's.
    const HOST_UPPER = /\.toUpperCase\(\s*\)|\.toLocaleUpperCase\(\s*\)/;
    expect(files.filter((file) => HOST_UPPER.test(readFileSync(file, 'utf8')))).toEqual([]);
  });
});
