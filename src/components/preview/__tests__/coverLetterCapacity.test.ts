import { COVER_LETTER_PAGE_WORDS, type LetterFurniture } from '@/components/preview/letterCapacity';
import { ALL_THEME_IDS, type ThemeId } from '@/components/preview/themeIds';
import { COVER_LETTER_MAX_WORDS } from '@/constants/ai';
import { buildLetterResume } from '@/test/coverLetterProse';
import { largestOnePage, letterPages, withFurniture } from '@/test/letterCapacitySweep';
import { TYPST_INIT_TIMEOUT_MS, initTypstCompiler } from '@/test/typstCompile';
import { coverLetterWordTarget } from '@/utils/coverLetterLength';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * The cover-letter length presets promise a page fraction, and
 * `COVER_LETTER_PAGE_WORDS` is what turns that promise into a word count. Every
 * entry in that table was read off a render, and this file is the render:
 *
 * - the ungated block compiles every table entry through the shipped Typst
 *   WASM from both sides — the entry fits on one page and ten more words do
 *   not — and the `long` preset either side of scale 1, where the estimate has
 *   to err short;
 * - the `MEASURE_LETTER=1` block is the sweep that produced the table, kept so
 *   a theme restyle can re-measure rather than re-guess.
 *
 * Word counts are whitespace tokens across the paragraphs, salutation and
 * closing included — the unit the prompt and the UI count in.
 *
 * ⚠️ **Four furniture columns, not one.** The fixture shows both address blocks
 * while the app ships both hidden, so for two releases the table's only
 * defended cell was the one no default user rendered (2026-09-08).
 */

/**
 * How many pages the cover letter alone takes: the document with the letter
 * minus the same document without it. The serializers emit the letter as its
 * own `#set page` block ahead of the résumé, so the difference is exact.
 */
async function enLetterPages(
  themeId: ThemeId,
  words: number,
  classicLayout: boolean,
  fontScale: number,
  furniture: LetterFurniture,
): Promise<number> {
  return letterPages(
    themeId,
    withFurniture(buildLetterResume(themeId, { words, classicLayout, fontScale }), furniture),
  );
}

/** The table's four columns, in the order it lists them. */
const FURNITURE: readonly LetterFurniture[] = ['both', 'sender', 'recipient', 'none'];

/** The sweep's resolution: a capacity is known to the nearest five words. */
const STEP = 5;

/** Largest word count (to the nearest `STEP`) whose letter stays on one page. */
async function onePageCapacity(
  themeId: ThemeId,
  classicLayout: boolean,
  fontScale: number,
  furniture: LetterFurniture,
): Promise<number> {
  return largestOnePage({
    themeId,
    step: STEP,
    lo: 20,
    hi: 2000,
    build: (words) =>
      withFurniture(buildLetterResume(themeId, { words, classicLayout, fontScale }), furniture),
  });
}

describe('the capacity table holds on a real render', () => {
  beforeAll(() => initTypstCompiler(), TYPST_INIT_TIMEOUT_MS);

  it.each(ALL_THEME_IDS)(
    '%s: the table is exact, "almost full" holds, the cap fits two pages',
    async (themeId) => {
      for (const classicLayout of [false, true]) {
        const layout = classicLayout ? 'classic' : 'themed';
        // Every cell, both sides.
        for (const furniture of FURNITURE) {
          const entry = COVER_LETTER_PAGE_WORDS[themeId][layout][furniture];
          expect(
            await enLetterPages(themeId, entry, classicLayout, 1, furniture),
            `${themeId} ${layout}/${furniture}: the table's ${entry} words spill`,
          ).toBe(1);
          expect(
            await enLetterPages(themeId, entry + 2 * STEP, classicLayout, 1, furniture),
            `${themeId} ${layout}/${furniture}: ${entry + 2 * STEP} words still fit — stale-low`,
          ).toBe(2);
        }

        // ⚠️ The scale exponent and the hard cap are asked on `both` only. They
        // are claims about how the furniture behaves as the body grows and
        // about `COVER_LETTER_MAX_WORDS`, neither of which the column changes —
        // and `both` is the smallest capacity, so it is the strictest place to
        // ask. Running all four here quadrupled the suite for no new claim.
        for (const fontScale of [0.8, 1.5]) {
          const words = coverLetterWordTarget('long', themeId, classicLayout, fontScale, 'both');
          expect(
            await enLetterPages(themeId, words, classicLayout, fontScale, 'both'),
            `${themeId} ${layout}: ${words} words spill at fontScale ${fontScale}`,
          ).toBe(1);
        }
        expect(
          await enLetterPages(themeId, COVER_LETTER_MAX_WORDS, classicLayout, 1, 'both'),
          `${themeId} ${layout}: ${COVER_LETTER_MAX_WORDS} words run past two pages`,
        ).toBeLessThanOrEqual(2);
      }
    },
    60_000,
  );
});

describe.skipIf(!process.env.MEASURE_LETTER)('measure the one-page capacity', () => {
  beforeAll(() => initTypstCompiler(), TYPST_INIT_TIMEOUT_MS);

  /** In the table's own shape: paste the output back, never edit cells by hand. */
  it('per theme, layout and furniture at fontScale 1', async () => {
    const rows: string[] = [];
    for (const themeId of ALL_THEME_IDS) {
      for (const classicLayout of [false, true]) {
        const cells: number[] = [];
        for (const furniture of FURNITURE) {
          cells.push(await onePageCapacity(themeId, classicLayout, 1, furniture));
        }
        rows.push(
          `| ${themeId} | ${classicLayout ? 'classic' : 'themed'} | ${cells.join(' | ')} |`,
        );
      }
    }
    process.stdout.write(
      `\n| theme | layout | ${FURNITURE.join(' | ')} |\n| --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n\n`,
    );
  }, 1_800_000);

  it('across font scales, to check the exponent', async () => {
    const rows: string[] = [];
    for (const themeId of ALL_THEME_IDS) {
      for (const classicLayout of [false, true]) {
        // `both`, matching `COVER_LETTER_FURNITURE_RATIO`, which this sweep
        // feeds and which is deliberately not split per furniture state.
        const base = await onePageCapacity(themeId, classicLayout, 1, 'both');
        const cells: string[] = [];
        for (const fontScale of [0.8, 1.2, 1.5]) {
          const measured = await onePageCapacity(themeId, classicLayout, fontScale, 'both');
          const exponent = Math.log(measured / base) / Math.log(1 / fontScale);
          cells.push(`${measured} (p=${exponent.toFixed(2)})`);
        }
        rows.push(
          `| ${themeId} | ${classicLayout ? 'classic' : 'themed'} | ${base} | ${cells.join(' | ')} |`,
        );
      }
    }
    process.stdout.write(
      `\n| theme | layout | base | 0.8 | 1.2 | 1.5 |\n| --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n\n`,
    );
  }, 900_000);
});
