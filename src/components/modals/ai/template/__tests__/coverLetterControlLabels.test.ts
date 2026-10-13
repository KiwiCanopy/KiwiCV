// @vitest-environment jsdom
import {
  LENGTH_LABEL_KEYS,
  TONE_OPTION_LABEL_KEYS,
  TONE_OPTION_VALUES,
} from '@/components/modals/ai/template/coverLetterLabels';
import { COVER_LETTER_STYLE_OPTION } from '@/components/modals/ai/template/coverLetterLabels';
import {
  COVER_LETTER_LENGTH_PRESETS,
  COVER_LETTER_TONES,
  type CoverLetterLengthPreset,
} from '@/constants/ai';
import { type LocaleCode, locales } from '@/locales';
import { en } from '@/locales/en/index';
import { lookupTranslation } from '@/utils/translationLookup';
import { describe, expect, it } from 'vitest';

/**
 * ⚠️ The half a `Record` cannot express: that a label key **names something**.
 *
 * `TONE_LABEL_KEYS` and `LENGTH_LABEL_KEYS` are `Record`s over their own unions,
 * so a missing entry is `TS2741` and a bogus one `TS2353` — the inventory is
 * already a build error. But `t()` returns the path for a key it cannot find, so
 * a plausible wrong key ships a select whose options read
 * `ai.cover_letter_tone_warm` in all fifteen locales. That is the failure the
 * import modals actually shipped; this is the same backstop, and it is
 * why the two entries in `DYNAMIC_CALL_ALLOWLIST` are only a silencer.
 */

const LENGTH_PRESETS = Object.keys(COVER_LETTER_LENGTH_PRESETS) as CoverLetterLengthPreset[];

/** What `t()` renders for a key in a locale bundle — `null` where it would show the path. */
const resolve = (path: string, bundle: unknown = en) => lookupTranslation(bundle, path);

describe('the cover-letter control labels', () => {
  it('names a real string for every option the tone select offers', () => {
    for (const option of TONE_OPTION_VALUES) {
      expect(typeof resolve(TONE_OPTION_LABEL_KEYS[option])).toBe('string');
    }
  });

  /**
   * ⚠️ The fifth option is a UI sentinel and must NEVER reach the wire. The
   * backend validates against its own table, so a sentinel sent as a tone is
   * `UNKNOWN_LETTER_TONE` → `LETTER_BAD_REQUEST`, one of the two failures a
   * retry cannot clear.
   */
  it('keeps the writing-style sentinel out of the tones the backend knows', () => {
    expect([...COVER_LETTER_TONES]).not.toContain(COVER_LETTER_STYLE_OPTION);
    expect(TONE_OPTION_VALUES).toHaveLength(COVER_LETTER_TONES.length + 1);
    expect(TONE_OPTION_VALUES[TONE_OPTION_VALUES.length - 1]).toBe(COVER_LETTER_STYLE_OPTION);
  });

  it('names a real string for every length preset', () => {
    for (const preset of Object.keys(COVER_LETTER_LENGTH_PRESETS)) {
      expect(typeof resolve(LENGTH_LABEL_KEYS[preset as keyof typeof LENGTH_LABEL_KEYS])).toBe(
        'string',
      );
    }
  });

  it('gives each option a label of its own', () => {
    const keys = [...Object.values(TONE_OPTION_LABEL_KEYS), ...Object.values(LENGTH_LABEL_KEYS)];
    expect(new Set(keys).size).toBe(keys.length);

    // Distinct keys resolving to one word is the same defect one level down —
    // a picker whose options cannot be told apart.
    const labels = keys.map((key) => resolve(key));
    expect(new Set(labels).size).toBe(labels.length);
  });

  /**
   * ⚠️ The four tones are options in ONE dropdown and must be tellable apart at
   * a glance. The catalog row warns that "Professional" and "Formal" are
   * near-synonyms in German and several others and that "Warm" has no clean
   * register word in some — so a faithful translation is exactly how two
   * options collide.
   *
   * `untranslated.test.cjs` cannot see this: it has a `MIN_LENGTH = 10` floor
   * (there to keep `PDF` and `KiwiCV` out of findings), and every one of these
   * is shorter than that. Four of the five keys with no backstop at all are
   * here.
   */
  it('gives every tone and length option a distinguishable label, in every locale', () => {
    const collisions: string[] = [];

    for (const code of Object.keys(locales) as LocaleCode[]) {
      const bundle = locales[code];
      const tones = TONE_OPTION_VALUES.map((option) =>
        resolve(TONE_OPTION_LABEL_KEYS[option], bundle),
      );
      const lengths = LENGTH_PRESETS.map((preset) => resolve(LENGTH_LABEL_KEYS[preset], bundle));

      if (new Set(tones).size !== tones.length)
        collisions.push(`${code} tones: ${tones.join(' / ')}`);
      if (new Set(lengths).size !== lengths.length)
        collisions.push(`${code} lengths: ${lengths.join(' / ')}`);
    }

    expect(collisions).toEqual([]);
  });

  /**
   * ⚠️ The labels promise a page fraction in words ("about a quarter page" …
   * "almost a full page"), so the ORDER is part of the contract. A fourth
   * preset inserted out of order is `TS2741` for a missing label and nothing
   * else — the select would read Short / Epic / Medium / Long.
   */
  it('offers the length presets in ascending order of page fraction', () => {
    const fractions = LENGTH_PRESETS.map((preset) => COVER_LETTER_LENGTH_PRESETS[preset]);

    expect(fractions).toEqual([...fractions].sort((a, b) => a - b));
    expect(new Set(fractions).size).toBe(fractions.length);
    expect(Math.max(...fractions)).toBeLessThanOrEqual(1);
  });
});
