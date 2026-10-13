import { COVER_LETTER_PAGE_CHARS, type LetterFurniture } from '@/components/preview/letterCapacity';
import { ALL_THEME_IDS, type ThemeId } from '@/components/preview/themeIds';
import { COVER_LETTER_CHARACTER_LANGS } from '@/constants/ai';
import { type LetterScript, buildLetterResume } from '@/test/coverLetterProse';
import { largestOnePage, letterPages, withFurniture } from '@/test/letterCapacitySweep';
import { TYPST_INIT_TIMEOUT_MS, initTypstCompiler } from '@/test/typstCompile';
import { coverLetterWordTarget } from '@/utils/coverLetterLength';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * The character-unit counterpart of `coverLetterCapacity.test.ts`.
 *
 * ⚠️ **Its own file because the CJK faces are its own font registration.**
 * `initTypstCompiler` is idempotent and `setCompilerInitOptions` is global, so a
 * file cannot have the faces both ways; vitest isolates module state per file,
 * which is what makes `{ cjk: true }` safe here and absent everywhere else.
 *
 * ⚠️ **An unregistered CJK face is a Typst *warning*, not an error** — it still
 * emits a valid PDF, with different pagination. Measured 2026-09-08 on 8,800
 * identical characters at 11 pt: 5 pages registered, 3 unregistered, a ~67%
 * overstatement of a page. So nothing here may assume the load worked. The
 * ungated block is the guard: a capacity that holds from both sides cannot hold
 * if the glyphs are not the ones the shipped renderer draws.
 */

// ⚠️ Read from the constant, not restated — a third character-counted language
// must make this sweep measure it, not quietly skip it.
const SCRIPTS: readonly LetterScript[] = COVER_LETTER_CHARACTER_LANGS;

/** The sweep's resolution: a capacity is known to the nearest ten characters. */
const STEP = 10;

async function cjkLetterPages(
  themeId: ThemeId,
  chars: number,
  classicLayout: boolean,
  script: LetterScript,
  furniture: LetterFurniture = 'both',
): Promise<number> {
  return letterPages(
    themeId,
    withFurniture(
      buildLetterResume(themeId, { chars, classicLayout, fontScale: 1, script }),
      furniture,
    ),
  );
}

/**
 * The three columns swept on `ja` alone.
 *
 * ⚠️ The `both` column is deliberately absent here and asserted on BOTH scripts
 * in the loop below instead: that pair is the font-registration guard — an
 * unregistered face renders ~67% narrower, so `entry` fits and `entry + 20`
 * fits too, and the second assertion is what catches it. Running all four
 * columns on both scripts would quadruple this suite inside `npm test` to
 * re-measure one shared face.
 */
const JA_ONLY_FURNITURE: readonly LetterFurniture[] = ['sender', 'recipient', 'none'];

/** All four columns, for the measurement lane. */
const FURNITURE: readonly LetterFurniture[] = ['both', ...JA_ONLY_FURNITURE];

/** Largest character count (to the nearest `STEP`) whose letter stays on one page. */
async function onePageCapacity(
  themeId: ThemeId,
  classicLayout: boolean,
  script: LetterScript,
  furniture: LetterFurniture = 'both',
): Promise<number> {
  return largestOnePage({
    themeId,
    step: STEP,
    lo: 40,
    hi: 4000,
    build: (chars) =>
      withFurniture(
        buildLetterResume(themeId, { chars, classicLayout, fontScale: 1, script }),
        furniture,
      ),
  });
}

describe('the character capacity table holds on a real render', () => {
  beforeAll(() => initTypstCompiler({ cjk: true }), TYPST_INIT_TIMEOUT_MS);

  it.each(ALL_THEME_IDS)(
    '%s: the table entry fits on one page and a step more does not',
    async (themeId) => {
      for (const script of SCRIPTS) {
        for (const classicLayout of [false, true]) {
          const column = COVER_LETTER_PAGE_CHARS[themeId][classicLayout ? 'classic' : 'themed'];
          const entry = column.both;
          const where = `${themeId} ${classicLayout ? 'classic' : 'themed'} ${script}`;

          // ⚠️ Both scripts, not just the one the table was read from. The table
          // claims to cover `zh` and `ja`, and a claim defended only by a sweep
          // run once at authoring time is not defended.
          //
          // ⚠️ This pair is also the font guard. An unregistered CJK face
          // renders ~67% narrower, so `entry` would still fit but `entry + 20`
          // would too, and the second assertion fails. A green pair means the
          // glyphs are the ones the shipped renderer draws.
          expect(await cjkLetterPages(themeId, entry, classicLayout, script), `${where} fits`).toBe(
            1,
          );
          expect(
            await cjkLetterPages(themeId, entry + STEP * 2, classicLayout, script),
            `${where} overflows`,
          ).toBeGreaterThan(1);

          // The furniture columns, on `ja` only — see JA_ONLY_FURNITURE.
          if (script !== 'ja') continue;
          for (const furniture of JA_ONLY_FURNITURE) {
            const cell = column[furniture];
            expect(
              await cjkLetterPages(themeId, cell, classicLayout, script, furniture),
              `${where}/${furniture} fits`,
            ).toBe(1);
            expect(
              await cjkLetterPages(themeId, cell + STEP * 2, classicLayout, script, furniture),
              `${where}/${furniture} overflows`,
            ).toBeGreaterThan(1);
          }
        }
      }
    },
    900_000,
  );

  /**
   * ⚠️ `coverLetterPageCapacity` applies `COVER_LETTER_FURNITURE_RATIO` to the
   * character base on the argument that the correction is unit-free — both
   * tables measure the same body area. Sound, but the word file renders its
   * version of that argument and this one did not, so a user with the font
   * slider off 1 had a target no compile had ever seen.
   */
  it.each([0.8, 1.5])(
    'the long preset still fits at fontScale %s',
    async (fontScale) => {
      const themeId: ThemeId = 'plain';
      const target = coverLetterWordTarget('long', themeId, false, fontScale, 'both', 'characters');
      const pages = await letterPages(
        themeId,
        buildLetterResume(themeId, {
          chars: target,
          classicLayout: false,
          fontScale,
          script: 'ja',
        }),
      );
      expect(pages, `long at ${fontScale} must not spill`).toBe(1);
    },
    300_000,
  );
});

describe.skipIf(!process.env.MEASURE_LETTER)('measure the one-page CJK capacity', () => {
  beforeAll(() => initTypstCompiler({ cjk: true }), TYPST_INIT_TIMEOUT_MS);

  const themes = process.env.MEASURE_THEMES
    ? (process.env.MEASURE_THEMES.split(',') as ThemeId[])
    : ALL_THEME_IDS;

  /**
   * ⚠️ **All four furniture columns.** This lane fed a two-dimensional table and
   * kept doing so after the table gained a third dimension, so three quarters
   * of `COVER_LETTER_PAGE_CHARS` had no reproduction path in the repo — against
   * a file whose stated purpose is that a theme restyle can re-measure rather
   * than re-guess. A restyle would have re-measured a quarter and hand-edited
   * the rest, which is how the both-only blind spot arrived in the first place
   * (code-reviewer, 2026-09-08).
   *
   * ⚠️ The WASM compiler dies with `unreachable` somewhere past ~3k compiles in
   * one process, so sweep a few themes at a time with `MEASURE_THEMES`.
   */
  it('per theme, layout, script and furniture at fontScale 1', async () => {
    const rows: string[] = [];
    for (const script of SCRIPTS) {
      for (const themeId of themes) {
        for (const classicLayout of [false, true]) {
          const cells: number[] = [];
          for (const furniture of FURNITURE) {
            cells.push(await onePageCapacity(themeId, classicLayout, script, furniture));
          }
          rows.push(
            `${script} ${themeId} ${classicLayout ? 'classic' : 'themed'} ${cells.join(' ')}`,
          );
          console.log('CAPACITY', rows.at(-1));
        }
      }
    }
    throw new Error('MEASURED (both sender recipient none)\n' + rows.join('\n'));
  }, 3_600_000);
});
