import { formatPerDay, formatPrice } from '@/components/monetization/pricing/formatPrice';
import { describe, expect, it } from 'vitest';

const nbsp = (s: string) => s.replace(/\u00a0|\u202f/g, ' ');

describe('formatPrice', () => {
  it('writes the amount the way the locale writes euros', () => {
    expect(nbsp(formatPrice(2999, 'de'))).toBe('29,99 €');
    expect(nbsp(formatPrice(2999, 'en'))).toBe('€29.99');
    expect(nbsp(formatPrice(2999, 'sv-SE'))).toBe('29,99 €');
    expect(nbsp(formatPrice(2999, 'pt-PT'))).toBe('29,99 €');
    expect(nbsp(formatPrice(2999, 'uk-UA'))).toBe('29,99 €');
  });
});

describe('formatPerDay', () => {
  it.each([
    [299, 1, '2,99 €'],
    [1399, 7, '2,00 €'],
    [2999, 30, '1,00 €'],
  ])('divides %i cents over %i days', (cents, days, expected) => {
    expect(nbsp(formatPerDay(cents, days, 'de') ?? '')).toBe(expected);
  });

  it('returns null for a Pass without a length', () => {
    expect(formatPerDay(1399, 0, 'de')).toBeNull();
  });
});
