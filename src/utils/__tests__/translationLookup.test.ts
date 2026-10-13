import { en } from '@/locales/en/index';
import { lookupTranslation } from '@/utils/translationLookup';
import { describe, expect, it } from 'vitest';

/**
 * `lookupTranslation` is `t()`'s resolution, shared so the key-resolution tests
 * exercise it rather than a hand-rolled walk. These pin the rules a raw
 * path walk does not model.
 */
describe('lookupTranslation', () => {
  it('resolves a leaf and misses a bogus key, an inner node and a prefix', () => {
    expect(lookupTranslation(en, 'ai.accept_all_changes')).toBe('Accept all changes');
    expect(lookupTranslation(en, 'ai.accept_bogus')).toBeNull();
    expect(lookupTranslation(en, 'ai')).toBeNull();
    expect(lookupTranslation(en, 'ai.accept_all_changes.deeper')).toBeNull();
  });

  it('reads a counted key through its plural suffix, which a bare path does not', () => {
    expect(lookupTranslation(en, 'ai.diff_fields')).toBeNull();
    expect(lookupTranslation(en, 'ai.diff_fields', { count: 1 })).toBe('1 field the AI rewrote');
    expect(lookupTranslation(en, 'ai.diff_fields', { count: 3 })).toBe(
      '{{count}} fields the AI rewrote',
    );
  });

  it('falls back to English for a miss or an empty value in the base locale', () => {
    expect(lookupTranslation({}, 'ai.accept_all_changes')).toBe('Accept all changes');
    expect(lookupTranslation({ ai: { accept_all_changes: '' } }, 'ai.accept_all_changes')).toBe(
      'Accept all changes',
    );
    expect(
      lookupTranslation({ ai: { accept_all_changes: 'Alle annehmen' } }, 'ai.accept_all_changes'),
    ).toBe('Alle annehmen');
    expect(lookupTranslation({}, 'ai.diff_fields', { count: 2 })).toBe(
      '{{count}} fields the AI rewrote',
    );
  });
});
