import { COVER_LETTER_PAGE_WORDS } from '@/components/preview/letterCapacity';
import { ALL_THEME_IDS, type ThemeId } from '@/components/preview/themeIds';
import {
  COVER_LETTER_LENGTH_PRESETS,
  COVER_LETTER_MAX_WORDS,
  COVER_LETTER_MIN_WORDS,
} from '@/constants/ai';
import {
  countCoverLetterCharacters,
  countCoverLetterWords,
  coverLetterLengthUnit,
  coverLetterPageCapacity,
  coverLetterWordTarget,
} from '@/utils/coverLetterLength';
import { describe, expect, it } from 'vitest';

/**
 * The arithmetic between the measured table and the number the prompt sees.
 * Whether the table is true at scale 1 is `coverLetterCapacity.test.ts`'s job
 * — it renders. What this file holds is the estimate *away* from scale 1,
 * against the sweep that file's `MEASURE_LETTER=1` block prints: the one-page
 * capacity per theme at `fontScale` 0.8, 1.2 and 1.5, to a five-word step.
 * Refresh these literals from the sweep after a theme restyle.
 */
const SWEEP: Record<
  ThemeId,
  { themed: [number, number, number]; classic: [number, number, number] }
> = {
  elegant: { themed: [1355, 500, 260], classic: [855, 350, 210] },
  foggy: { themed: [905, 290, 115], classic: [680, 290, 165] },
  javascript: { themed: [1085, 385, 195], classic: [675, 275, 165] },
  lunar: { themed: [1290, 455, 250], classic: [815, 320, 195] },
  misty: { themed: [1265, 455, 225], classic: [815, 320, 195] },
  plain: { themed: [1080, 365, 195], classic: [680, 290, 165] },
  plain2: { themed: [1245, 445, 210], classic: [720, 300, 180] },
  skyline: { themed: [1265, 395, 185], classic: [925, 380, 210] },
  soft: { themed: [1290, 455, 240], classic: [815, 320, 195] },
  stackoverflow: { themed: [1290, 455, 225], classic: [815, 305, 185] },
  swiss_grid: { themed: [1310, 455, 240], classic: [815, 320, 185] },
  timeless: { themed: [1335, 485, 265], classic: [835, 335, 185] },
};
const SWEEP_SCALES = [0.8, 1.2, 1.5] as const;
/** The table's four columns. */
const FURNITURE = ['both', 'sender', 'recipient', 'none'] as const;
/** The binary search stepped in fives, so a render is only known to that. */
const STEP = 5;

describe('coverLetterPageCapacity', () => {
  it('is the measured table at fontScale 1, for every theme, layout and furniture', () => {
    for (const themeId of ALL_THEME_IDS) {
      for (const furniture of FURNITURE) {
        expect(coverLetterPageCapacity(themeId, false, 1, furniture)).toBe(
          COVER_LETTER_PAGE_WORDS[themeId].themed[furniture],
        );
        expect(coverLetterPageCapacity(themeId, true, 1, furniture)).toBe(
          COVER_LETTER_PAGE_WORDS[themeId].classic[furniture],
        );
      }
    }
  });

  /**
   * ⚠️ **The regression this dimension exists for.** The table was measured with
   * both address blocks shown while `createDefaultCoverLetter` ships both
   * hidden, so a default letter was targeted at a page 11-65% smaller than the
   * one it prints on — reported as "the long letter came out short" on lunar
   * (2026-09-08). A capacity that ignores the toggles passes every other test
   * in this file, so the claim has to be made directly.
   */
  it('gives a page with no address blocks more room than one with both', () => {
    for (const themeId of ALL_THEME_IDS) {
      for (const classicLayout of [false, true]) {
        const both = coverLetterPageCapacity(themeId, classicLayout, 1, 'both');
        const none = coverLetterPageCapacity(themeId, classicLayout, 1, 'none');
        expect(none, `${themeId} ${classicLayout ? 'classic' : 'themed'}`).toBeGreaterThan(both);
      }
    }
  });

  /**
   * The DIN 5008 address field is placed at a fixed offset, so it is reserved by
   * EITHER block and reclaimed only when both are off. The themed header has no
   * such field and shrinks per block.
   */
  it('reserves the classic address field for either block alone', () => {
    for (const themeId of ALL_THEME_IDS) {
      const classic = COVER_LETTER_PAGE_WORDS[themeId].classic;
      expect(classic.sender, themeId).toBe(classic.both);
      expect(classic.recipient, themeId).toBe(classic.both);
      expect(classic.none, themeId).toBeGreaterThan(classic.both);
    }
  });

  it('errs short of the sweep at every other scale, and never by more than half', () => {
    for (const themeId of ALL_THEME_IDS) {
      for (const classicLayout of [false, true]) {
        const measured = SWEEP[themeId][classicLayout ? 'classic' : 'themed'];
        SWEEP_SCALES.forEach((fontScale, index) => {
          const estimate = coverLetterPageCapacity(themeId, classicLayout, fontScale, 'both');
          const label = `${themeId} ${classicLayout ? 'classic' : 'themed'} at ${fontScale}`;
          expect(estimate, `${label}: ${estimate} over the render`).toBeLessThanOrEqual(
            measured[index] + STEP,
          );
          expect(estimate, `${label}: ${estimate} too far under`).toBeGreaterThanOrEqual(
            measured[index] / 2,
          );
        });
      }
    }
  });

  it('falls monotonically as the font grows', () => {
    const scales = [0.5, 0.8, 1, 1.0001, 1.2, 1.5];
    for (const classicLayout of [false, true]) {
      const capacities = scales.map((s) =>
        coverLetterPageCapacity('lunar', classicLayout, s, 'both'),
      );
      for (let i = 1; i < capacities.length; i++) {
        expect(capacities[i]).toBeLessThanOrEqual(capacities[i - 1]);
      }
      expect(capacities.at(-1)).toBeGreaterThan(0);
    }
  });

  it('treats a missing or zero scale as 1 rather than dividing by it', () => {
    expect(coverLetterPageCapacity('plain', true, 0, 'both')).toBe(
      COVER_LETTER_PAGE_WORDS.plain.classic.both,
    );
    expect(coverLetterPageCapacity('plain', true, Number.NaN, 'both')).toBe(
      COVER_LETTER_PAGE_WORDS.plain.classic.both,
    );
  });
});

describe('coverLetterWordTarget', () => {
  it('is the preset fraction of the page at fontScale 1', () => {
    expect(coverLetterWordTarget('medium', 'lunar', false, 1, 'both')).toBe(
      Math.round(COVER_LETTER_LENGTH_PRESETS.medium * COVER_LETTER_PAGE_WORDS.lunar.themed.both),
    );
  });

  it('orders the presets and keeps every one inside the user range', () => {
    for (const themeId of ALL_THEME_IDS) {
      for (const classicLayout of [false, true]) {
        for (const fontScale of [0.5, 0.8, 1, 1.2, 1.5]) {
          const short = coverLetterWordTarget('short', themeId, classicLayout, fontScale, 'both');
          const medium = coverLetterWordTarget('medium', themeId, classicLayout, fontScale, 'both');
          const long = coverLetterWordTarget('long', themeId, classicLayout, fontScale, 'both');
          expect(short).toBeLessThanOrEqual(medium);
          expect(medium).toBeLessThanOrEqual(long);
          expect(short).toBeGreaterThanOrEqual(COVER_LETTER_MIN_WORDS);
          expect(long).toBeLessThanOrEqual(COVER_LETTER_MAX_WORDS);
        }
      }
    }
  });

  it('clamps to the range at the ends of the slider', () => {
    // The quarter-page preset on the tightest classic page at the largest font is under 100.
    expect(coverLetterWordTarget('short', 'javascript', true, 1.5, 'both')).toBe(
      COVER_LETTER_MIN_WORDS,
    );
    // Almost a page at the smallest font is over 1,000 everywhere.
    expect(coverLetterWordTarget('long', 'foggy', false, 0.5, 'both')).toBe(COVER_LETTER_MAX_WORDS);
  });
});

describe('countCoverLetterWords', () => {
  it('counts whitespace tokens across every paragraph, salutation and closing included', () => {
    expect(countCoverLetterWords(['Dear Ms Muster,', 'Two  words', '', 'Kind regards'])).toBe(7);
  });
});

describe('the unit a language counts in', () => {
  it('counts characters for the unspaced scripts and words for everything else', () => {
    expect(coverLetterLengthUnit('zh')).toBe('characters');
    expect(coverLetterLengthUnit('ja')).toBe('characters');
    // Region tags and casing must not fall through to words — `zh-Hans` is the
    // same script, and a mis-read here is silent: the letter is simply short.
    expect(coverLetterLengthUnit('zh-Hans')).toBe('characters');
    expect(coverLetterLengthUnit('JA')).toBe('characters');

    for (const lang of ['en', 'de', 'fr', 'ru', 'ko']) {
      expect(coverLetterLengthUnit(lang), lang).toBe('words');
    }
  });

  it('counts CJK characters where the word counter reports near-nothing', () => {
    // The measured case behind the character unit: a paragraph of Chinese is one or two
    // whitespace tokens and ~40 characters.
    const paragraphs = ['我对贵公司发布的高级软件工程师职位非常感兴趣。', '期待您的回复。'];
    expect(countCoverLetterWords(paragraphs)).toBeLessThan(5);
    expect(countCoverLetterCharacters(paragraphs)).toBe(30);
  });

  it('ignores whitespace so paragraph breaks cannot move the count', () => {
    expect(countCoverLetterCharacters(['我对贵公司', '  发布的\n职位  '])).toBe(
      countCoverLetterCharacters(['我对贵公司发布的职位']),
    );
  });

  it('reads the character table per furniture state, like the word one', () => {
    // ⚠️ The CJK table was swept through the same both-blocks-on fixture, so it
    // shipped with the identical blind spot the word table did (2026-09-08).
    for (const themeId of ALL_THEME_IDS) {
      for (const classicLayout of [false, true]) {
        const both = coverLetterPageCapacity(themeId, classicLayout, 1, 'both', 'characters');
        const none = coverLetterPageCapacity(themeId, classicLayout, 1, 'none', 'characters');
        expect(none, `${themeId} ${classicLayout ? 'classic' : 'themed'}`).toBeGreaterThan(both);
      }
    }
  });

  it('resolves a character target from the character table, not the word one', () => {
    const words = coverLetterWordTarget('long', 'plain', false, 1, 'both', 'words');
    const chars = coverLetterWordTarget('long', 'plain', false, 1, 'both', 'characters');
    // `plain` themed measured 595 words and 1,440 characters, so the character
    // target must be far larger — the whole point of the fix.
    expect(chars).toBeGreaterThan(words * 2);
  });

  it('does not cap a character target with the word ceiling', () => {
    // ⚠️ The regression guard for the clamp. `long` on a roomy theme resolves
    // above COVER_LETTER_MAX_WORDS in characters; clamping it there would ask
    // for a letter about half the promised length, silently.
    const chars = coverLetterWordTarget('long', 'elegant', false, 1, 'both', 'characters');
    expect(chars).toBeGreaterThan(COVER_LETTER_MAX_WORDS);
  });

  it('defaults to words, so every existing caller is unchanged', () => {
    expect(coverLetterWordTarget('long', 'plain', false, 1, 'both')).toBe(
      coverLetterWordTarget('long', 'plain', false, 1, 'both', 'words'),
    );
  });
});
