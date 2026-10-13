import type { ThemeId } from '@/components/preview/themeIds';
import type { CoverLetterLengthUnit } from '@/utils/coverLetterLength';

/**
 * Which of the letter's two address blocks are shown. They are the only
 * furniture a user can turn off that moves the capacity — subject, date and the
 * signature footer are either always present or cost too little to separate at
 * the sweep's five-word resolution.
 */
export type LetterFurniture = 'both' | 'sender' | 'recipient' | 'none';

/**
 * The letter's two page geometries. Named so the three structures below are
 * keyed by one inventory rather than by three copies of a literal union.
 */
export type LetterLayout = 'themed' | 'classic';

/** The shape both measured tables share. */
export type LetterCapacityTable = Record<
  ThemeId,
  Record<LetterLayout, Record<LetterFurniture, number>>
>;

/**
 * The table's column for a letter's `layout`.
 *
 * ⚠️ An object, not two positional booleans. They are the same type and the
 * sole caller passes them in this order; a swap would silently read the wrong
 * column on every themed layout showing exactly one block — and could not be
 * caught by a test on `lunar`, whose `sender` and `recipient` columns happen to
 * be identical (code-reviewer, 2026-09-08).
 */
export const letterFurniture = ({
  showSender,
  showRecipient,
}: {
  showSender: boolean;
  showRecipient: boolean;
}): LetterFurniture =>
  showSender && showRecipient
    ? 'both'
    : showSender
      ? 'sender'
      : showRecipient
        ? 'recipient'
        : 'none';

/**
 * The inverse: which blocks a column means. Beside `letterFurniture` so the
 * round trip is one file's problem.
 *
 * ⚠️ The sweeps need this to build a fixture for a column, and each had written
 * its own copy — in the two files that share `letterCapacitySweep.ts`
 * *specifically* so they cannot drift. That file opens by naming the failure:
 * "copied helpers would go stale silently … while the stale copy kept
 * returning plausible numbers" (architect-reviewer, 2026-09-08).
 */
export const furnitureBlocks = (
  furniture: LetterFurniture,
): { showSender: boolean; showRecipient: boolean } => ({
  showSender: furniture === 'both' || furniture === 'sender',
  showRecipient: furniture === 'both' || furniture === 'recipient',
});

/**
 * Words of application prose that fit on the letter's first page at
 * `fontScale` 1: `themed` is the theme-matching header (the default layout),
 * `classic` the DIN 5008 branch, and the four columns are which address blocks
 * the user has shown. Measured, never derived — the ungated half of
 * `coverLetterCapacity.test.ts` renders every cell from both sides, and its
 * `MEASURE_LETTER=1` half is the sweep that produced it.
 *
 * ⚠️ **The furniture dimension was added on 2026-09-08, and every entry before
 * it was the `both` column.** The fixture forces `showSender` and
 * `showRecipient` on (`coverLetterProse.ts`, "so the capacity it measures is
 * the floor") while `createDefaultCoverLetter` ships both OFF — so every user
 * on the defaults was handed a target measured for a page they did not have.
 * A floor is the safe direction for a spill, but it is not free: it is why a
 * `long` letter on lunar filled 76% of the page and read as short (owner,
 * 2026-09-08). The re-sweep reproduced all 24 shipped numbers in the `both`
 * column before the other three were trusted.
 *
 * ⚠️ **`classic` is flat across the first three columns, and that is real, not
 * a copy-paste.** The DIN 5008 address field is `#place`d at a fixed offset, so
 * showing EITHER block reserves the whole field and showing neither reclaims
 * all of it — which is why the classic swing (up to +65% on skyline) dwarfs the
 * themed one (+11% to +19%).
 */
export const COVER_LETTER_PAGE_WORDS: LetterCapacityTable = {
  elegant: {
    themed: { both: 815, sender: 850, recipient: 835, none: 905 },
    classic: { both: 545, sender: 545, recipient: 545, none: 905 },
  },
  foggy: {
    themed: { both: 485, sender: 535, recipient: 545, none: 575 },
    classic: { both: 425, sender: 425, recipient: 425, none: 715 },
  },
  javascript: {
    themed: { both: 650, sender: 700, recipient: 685, none: 725 },
    classic: { both: 420, sender: 420, recipient: 420, none: 695 },
  },
  lunar: {
    themed: { both: 760, sender: 815, recipient: 815, none: 850 },
    classic: { both: 525, sender: 525, recipient: 525, none: 850 },
  },
  misty: {
    themed: { both: 725, sender: 780, recipient: 760, none: 815 },
    classic: { both: 505, sender: 505, recipient: 505, none: 815 },
  },
  plain: {
    themed: { both: 595, sender: 635, recipient: 630, none: 675 },
    classic: { both: 425, sender: 425, recipient: 425, none: 715 },
  },
  plain2: {
    themed: { both: 710, sender: 760, recipient: 740, none: 800 },
    classic: { both: 455, sender: 455, recipient: 455, none: 740 },
  },
  skyline: {
    themed: { both: 700, sender: 745, recipient: 725, none: 785 },
    classic: { both: 580, sender: 580, recipient: 580, none: 960 },
  },
  soft: {
    themed: { both: 760, sender: 815, recipient: 805, none: 835 },
    classic: { both: 525, sender: 525, recipient: 525, none: 850 },
  },
  stackoverflow: {
    themed: { both: 745, sender: 805, recipient: 780, none: 815 },
    classic: { both: 505, sender: 505, recipient: 505, none: 830 },
  },
  swiss_grid: {
    themed: { both: 760, sender: 815, recipient: 805, none: 850 },
    classic: { both: 525, sender: 525, recipient: 525, none: 850 },
  },
  timeless: {
    themed: { both: 780, sender: 835, recipient: 815, none: 870 },
    classic: { both: 525, sender: 525, recipient: 525, none: 865 },
  },
};

/**
 * Characters of application prose that fit on the letter's first page at
 * `fontScale` 1, for the languages counted in characters
 * (`COVER_LETTER_CHARACTER_LANGS`). Measured, never derived — the same sweep as
 * `COVER_LETTER_PAGE_WORDS`, in `coverLetterCapacityCjk.test.ts`.
 *
 * ⚠️ **One table for both `zh` and `ja`, and that is a measurement rather than
 * an assumption.** Swept 2026-09-08 separately for each: across all twelve
 * themes and both layouts the two never differed by more than **10 characters**
 * — one sweep step, i.e. the resolution floor reporting itself — and `ja` was
 * never the larger. The numbers below are the `ja` reading, so the table errs
 * short for `zh` by under 20 characters, ~1% of an entry.
 *
 * ⚠️ **The structural reason is stronger than the measurement.** `TYPST_FONTS`
 * puts `Noto Sans CJK SC` ahead of `Noto Sans CJK JP`, so both scripts resolve
 * to the **same face**; there was never a second face for the two readings to
 * disagree about, and separate tables would measure one face twice. Re-measure
 * before adding a third character-counted language — that is a property of this
 * font stack, not of CJK.
 *
 * ⚠️ These are **characters**, and the ratio to the word table is not constant
 * enough to derive from: it spans **2.13 to 3.14** across the 24 theme/layout
 * cells, median 2.58, with only 6 inside 2.4–2.6. Read a value, never compute
 * one.
 *
 * ⚠️ **The furniture columns were swept on 2026-09-08, one day after the table
 * landed, and for the same reason the word table needed them**: both were read
 * off `buildLetterResume`, which forces the address blocks on, while the app
 * ships them off. The `both` column here is byte-identical to the values
 * measured earlier — that agreement is what licences the other three.
 *
 * ⚠️ **Swept on `ja` alone.** The note above records the two scripts as agreeing
 * within one step on a single shared face, and `ja` as the reading this table
 * carries; sweeping `zh` too would have measured that one face twice, for four
 * times the compiles. `coverLetterCapacityCjk.test.ts` still defends the `both`
 * column on BOTH scripts, because that pair is also the font-registration
 * guard.
 */
export const COVER_LETTER_PAGE_CHARS: LetterCapacityTable = {
  elegant: {
    themed: { both: 2080, sender: 2240, recipient: 2190, none: 2300 },
    classic: { both: 1180, sender: 1180, recipient: 1180, none: 1920 },
  },
  foggy: {
    themed: { both: 1270, sender: 1330, recipient: 1330, none: 1440 },
    classic: { both: 1060, sender: 1060, recipient: 1060, none: 1760 },
  },
  javascript: {
    themed: { both: 2040, sender: 2140, recipient: 2080, none: 2240 },
    classic: { both: 1180, sender: 1180, recipient: 1180, none: 1920 },
  },
  lunar: {
    themed: { both: 2040, sender: 2200, recipient: 2140, none: 2240 },
    classic: { both: 1180, sender: 1180, recipient: 1180, none: 1920 },
  },
  misty: {
    themed: { both: 1920, sender: 2080, recipient: 2040, none: 2140 },
    classic: { both: 1180, sender: 1180, recipient: 1180, none: 1920 },
  },
  plain: {
    themed: { both: 1440, sender: 1600, recipient: 1550, none: 1600 },
    classic: { both: 1060, sender: 1060, recipient: 1060, none: 1760 },
  },
  plain2: {
    themed: { both: 1920, sender: 2030, recipient: 1980, none: 2080 },
    classic: { both: 1120, sender: 1120, recipient: 1120, none: 1860 },
  },
  skyline: {
    themed: { both: 1820, sender: 1980, recipient: 1920, none: 2080 },
    classic: { both: 1550, sender: 1550, recipient: 1550, none: 2560 },
  },
  soft: {
    themed: { both: 2040, sender: 2140, recipient: 2080, none: 2240 },
    classic: { both: 1180, sender: 1180, recipient: 1180, none: 1920 },
  },
  stackoverflow: {
    themed: { both: 1980, sender: 2080, recipient: 2080, none: 2200 },
    classic: { both: 1120, sender: 1120, recipient: 1120, none: 1920 },
  },
  swiss_grid: {
    themed: { both: 2040, sender: 2200, recipient: 2080, none: 2240 },
    classic: { both: 1180, sender: 1180, recipient: 1180, none: 1920 },
  },
  timeless: {
    themed: { both: 2040, sender: 2140, recipient: 2080, none: 2240 },
    classic: { both: 1120, sender: 1120, recipient: 1120, none: 1920 },
  },
};

/**
 * The letter's furniture as a share of the body at scale 1, per layout, for
 * the correction above `fontScale` 1 — see `PDF_ENGINE_TYPST.md`.
 *
 * ⚠️ Deliberately NOT split per `LetterFurniture`. This term corrects how the
 * fixed-height furniture behaves as the body text grows, and the sweep across
 * font scales that produced it was run on the `both` fixture. Splitting it
 * would need its own re-sweep; using the `both` figure for every column keeps
 * the correction conservative, which is the direction this whole file errs in.
 */
export const COVER_LETTER_FURNITURE_RATIO: Record<LetterLayout, number> = {
  themed: 0.45,
  classic: 0.3,
};

/**
 * The two tables, keyed by the unit that selects them.
 *
 * ⚠️ **An index, not a ternary.** `coverLetterLength.ts` chose between them with
 * `unit === 'characters' ? CHARS : WORDS`, which still compiles when a third
 * character-counted language widens `CoverLetterLengthUnit` — and every unit
 * that is not literally `'characters'` then reads the Latin word table, for a
 * target about 2.5x too small. Keyed here, a new unit is a build error at this
 * object (architect-reviewer, 2026-09-08).
 */
export const COVER_LETTER_CAPACITY: Record<CoverLetterLengthUnit, LetterCapacityTable> = {
  words: COVER_LETTER_PAGE_WORDS,
  characters: COVER_LETTER_PAGE_CHARS,
};
