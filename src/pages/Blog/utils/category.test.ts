import type { SanityCategory } from '@/lib/sanity';
import { getCategoryTranslationKey, sortCategories } from '@/pages/Blog/utils/category';
import { describe, expect, it } from 'vitest';

describe('sortCategories', () => {
  it('should return an empty array if categories is undefined', () => {
    expect(sortCategories(undefined)).toEqual([]);
  });

  it('should return an empty array if categories is empty', () => {
    expect(sortCategories([])).toEqual([]);
  });

  it('should sort categories according to the predefined priorities', () => {
    const input: SanityCategory[] = [
      { title: 'Career Growth', color: 'blue' },
      { title: 'Resume Guide', color: 'purple' },
      { title: 'Inside KiwiCV', color: 'emerald' },
      { title: 'Interview Prep', color: 'orange' },
    ];

    const expected: SanityCategory[] = [
      { title: 'Resume Guide', color: 'purple' },
      { title: 'Interview Prep', color: 'orange' },
      { title: 'Career Growth', color: 'blue' },
      { title: 'Inside KiwiCV', color: 'emerald' },
    ];

    expect(sortCategories(input)).toEqual(expected);
  });

  it('should handle case insensitivity in category titles', () => {
    const input: SanityCategory[] = [
      { title: 'career growth', color: 'blue' },
      { title: 'Resume Guide', color: 'purple' },
    ];

    const expected: SanityCategory[] = [
      { title: 'Resume Guide', color: 'purple' },
      { title: 'career growth', color: 'blue' },
    ];

    expect(sortCategories(input)).toEqual(expected);
  });

  it('keeps the former brand category ordered during the Sanity transition', () => {
    const input: SanityCategory[] = [
      { title: 'Career Stories', color: 'blue' },
      { title: 'Inside CVCanvas', color: 'emerald' },
    ];

    expect(sortCategories(input)).toEqual(input);
    expect(getCategoryTranslationKey(input[1].title)).toBe('inside_kiwicv');
  });

  it('should put unknown categories at the end sorted alphabetically', () => {
    const input: SanityCategory[] = [
      { title: 'Z Category', color: 'blue' },
      { title: 'Resume Guide', color: 'purple' },
      { title: 'A Category', color: 'emerald' },
    ];

    const expected: SanityCategory[] = [
      { title: 'Resume Guide', color: 'purple' },
      { title: 'A Category', color: 'emerald' },
      { title: 'Z Category', color: 'blue' },
    ];

    expect(sortCategories(input)).toEqual(expected);
  });

  it('should not mutate the original array', () => {
    const input: SanityCategory[] = [
      { title: 'Career Growth', color: 'blue' },
      { title: 'Resume Guide', color: 'purple' },
    ];
    const inputCopy = [...input];

    sortCategories(input);

    expect(input).toEqual(inputCopy);
  });
});
