import { translatesWholeCv } from '@/utils/ai';
import { describe, expect, it } from 'vitest';

const run = {
  isWholeCV: true,
  isLetterOnly: false,
  translateToAnotherLanguage: true,
  targetLang: 'de',
  cvLanguage: 'en',
};

describe('translatesWholeCv', () => {
  it('is true for a whole-CV run translating into another language', () => {
    expect(translatesWholeCv(run)).toBe(true);
  });

  // A letter-only run skips call 1, so a stale translate flag must not switch the CV's locale.
  it('is false for a letter-only run even with the translate flag set', () => {
    expect(translatesWholeCv({ ...run, isLetterOnly: true })).toBe(false);
  });

  it('is false for a section run, an unset flag, or the same language', () => {
    expect(translatesWholeCv({ ...run, isWholeCV: false })).toBe(false);
    expect(translatesWholeCv({ ...run, translateToAnotherLanguage: false })).toBe(false);
    expect(translatesWholeCv({ ...run, targetLang: 'en' })).toBe(false);
  });
});
