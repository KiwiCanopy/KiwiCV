// @vitest-environment jsdom
import { useTranslation } from '@/hooks/useTranslation';
import { locales } from '@/locales';
import { type ResumeData, initialResumeState } from '@/types/resume';
import {
  enrichResumeWithPlaceholders,
  generateJSONWithPlaceholders,
} from '@/utils/placeholder-fallback';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * The export's placeholder text must be the preview's: both resolve through
 * `lookupTranslation`, the export directly and the preview through `tCV`. A
 * second resolver here once treated an empty locale value as a hit, so the
 * export printed nothing where the screen showed English.
 */
const references = locales.de.examples.references as { name: string };
const shipped = references.name;

afterEach(() => {
  references.name = shipped;
});

const germanResume = (): ResumeData => {
  const resume = structuredClone(initialResumeState);
  resume.meta.theme.locale = 'de';
  return resume;
};

describe('placeholder enrichment outside React', () => {
  it('resolves an empty CV-locale value exactly as the screen does', () => {
    references.name = '';
    const resume = germanResume();
    const { tCV } = renderHook(() => useTranslation(resume.meta)).result.current;

    const exported = enrichResumeWithPlaceholders(resume).references[0].name;
    const onScreen = generateJSONWithPlaceholders(resume, tCV).references[0].name;

    expect(exported).toBe(onScreen);
    expect(exported).toBe(locales.en.examples.references.name);
  });

  it('uses the CV locale where it has a value', () => {
    expect(enrichResumeWithPlaceholders(germanResume()).references[0].name).toBe(shipped);
  });
});
