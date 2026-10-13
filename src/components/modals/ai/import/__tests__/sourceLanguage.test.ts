import {
  OTHER_SOURCE_LANGUAGE,
  hasImportSourceLanguage,
  isOtherSourceLanguage,
  resolveImportSourceLanguage,
} from '@/components/modals/ai/import/sourceLanguage';
import { describe, expect, it } from 'vitest';

describe('import source language', () => {
  it('forwards a supported locale as its code', () => {
    expect(resolveImportSourceLanguage('de', '')).toBe('de');
    expect(isOtherSourceLanguage('de')).toBe(false);
  });

  it('forwards the typed name when the language is not a shipped locale', () => {
    expect(resolveImportSourceLanguage(OTHER_SOURCE_LANGUAGE, '  Danish  ')).toBe('Danish');
    expect(isOtherSourceLanguage(OTHER_SOURCE_LANGUAGE)).toBe(true);
  });

  it('ignores a stale typed name once a locale is picked again', () => {
    expect(resolveImportSourceLanguage('fr', 'Danish')).toBe('fr');
  });

  it('is unsatisfied until a language is chosen, or named', () => {
    expect(hasImportSourceLanguage('', '')).toBe(false);
    expect(hasImportSourceLanguage(OTHER_SOURCE_LANGUAGE, '')).toBe(false);
    expect(hasImportSourceLanguage(OTHER_SOURCE_LANGUAGE, '   ')).toBe(false);
    expect(hasImportSourceLanguage(OTHER_SOURCE_LANGUAGE, 'Korean')).toBe(true);
    expect(hasImportSourceLanguage('en', '')).toBe(true);
  });
});
