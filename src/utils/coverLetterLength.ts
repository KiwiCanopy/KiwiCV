import {
  COVER_LETTER_CAPACITY,
  COVER_LETTER_FURNITURE_RATIO,
  type LetterFurniture,
} from '@/components/preview/letterCapacity';
import type { ThemeId } from '@/components/preview/themeIds';
import {
  COVER_LETTER_CHARACTER_CLAMP_FACTOR,
  COVER_LETTER_CHARACTER_LANGS,
  COVER_LETTER_LENGTH_PRESETS,
  COVER_LETTER_MAX_WORDS,
  COVER_LETTER_MIN_WORDS,
  type CoverLetterLengthPreset,
} from '@/constants/ai';

/**
 * The unit every cover-letter length is counted in: whitespace-separated
 * tokens across all paragraphs, salutation and closing included. The capacity
 * table was measured in this unit, so the prompt and the UI must count in it
 * too.
 */
export const countCoverLetterWords = (paragraphs: readonly string[]): number =>
  paragraphs.join(' ').split(/\s+/).filter(Boolean).length;

export type CoverLetterLengthUnit = 'words' | 'characters';

/**
 * Which unit this language's letter is measured in. Keyed on the **letter's**
 * language — the language the letter is written in, not the UI language, since
 * a German UI can ask for a Japanese letter.
 */
export const coverLetterLengthUnit = (lang: string): CoverLetterLengthUnit =>
  // ⚠️ Widened on purpose: `as const` narrows `includes` to the union, which
  // rejects the arbitrary string this takes. The cast is at the boundary, so
  // the inventory stays the single typed source everything else derives from.
  (COVER_LETTER_CHARACTER_LANGS as readonly string[]).includes(lang.split('-')[0].toLowerCase())
    ? 'characters'
    : 'words';

/**
 * Characters of letter body, whitespace excluded, salutation and closing
 * included — the character-script counterpart of `countCoverLetterWords`.
 *
 * ⚠️ Whitespace is stripped rather than counted: CJK prose carries almost none,
 * so counting it would make the number depend on how the generator happened to
 * break paragraphs. Latin runs inside the text (a product name, `TypeScript`)
 * count as their characters, which is what the render does too.
 */
export const countCoverLetterCharacters = (paragraphs: readonly string[]): number =>
  paragraphs.join('').replace(/\s+/g, '').length;

/**
 * Prose that fits on one letter page for this theme, layout, font scale and
 * shown address blocks, in this unit. Exact at scale 1, where every table entry
 * was rendered; elsewhere an estimate that never exceeds the render by more
 * than the sweep's step, and undershoots it by up to half.
 */
export const coverLetterPageCapacity = (
  themeId: ThemeId,
  classicLayout: boolean,
  fontScale: number,
  furniture: LetterFurniture,
  unit: CoverLetterLengthUnit = 'words',
): number => {
  const layout = classicLayout ? 'classic' : 'themed';
  // Two independent dimensions on one lookup: the UNIT picks the table,
  // the FURNITURE picks the column within it. Both tables carry all four
  // columns, swept the same way, so neither script is left on the `both`
  // reading the other was fixed off.
  //
  // ⚠️ Indexed, never a ternary on `unit`. A third character-counted language
  // would widen the union and leave every non-'characters' unit silently
  // reading the Latin word table — `COVER_LETTER_CAPACITY` makes that a build
  // error instead (architect-reviewer, 2026-09-08).
  const base = COVER_LETTER_CAPACITY[unit][themeId][layout][furniture];
  // `furnitureRatio`, not `furniture` — the parameter above is WHICH blocks are
  // shown, this is how the fixed-height ones behave as the body grows. Two
  // different facts about the same word.
  //
  // Unit-free: it is a share of the body, and the body shrinks the same way
  // whichever unit measures it — so only the base changes with the unit.
  const furnitureRatio = COVER_LETTER_FURNITURE_RATIO[layout];
  const scale = fontScale > 0 ? fontScale : 1;
  const squared = 1 / scale ** 2;
  // The furniture term is below the squared law exactly when the scale is
  // above 1, so `min` is "err short on both sides" in one expression.
  const share = Math.min(squared, (1 + furnitureRatio) * squared - furnitureRatio);
  return Math.max(0, Math.round(base * share));
};

/**
 * The word target a length preset resolves to, inside the user-set range. The
 * label promises a page fraction, so this is the only place a preset becomes
 * a number — the prompt and the UI both read it.
 */
export const coverLetterWordTarget = (
  preset: CoverLetterLengthPreset,
  themeId: ThemeId,
  classicLayout: boolean,
  fontScale: number,
  furniture: LetterFurniture,
  unit: CoverLetterLengthUnit = 'words',
): number => {
  const target = Math.round(
    COVER_LETTER_LENGTH_PRESETS[preset] *
      coverLetterPageCapacity(themeId, classicLayout, fontScale, furniture, unit),
  );
  // ⚠️ The clamp scales with the unit. `COVER_LETTER_MIN/MAX_WORDS` bound a
  // Latin letter; applying 1,000 to characters would cap `long` on nearly every
  // theme, silently shortening the letter the preset promised. The measured
  // ratio spans 2.13–3.14 (median 2.58), so the bounds are widened by one
  // factor just under the median rather than re-measured as their own quantity.
  // ⚠️ Worst case is `javascript` themed at 3.14, where a `long` target caps at
  // 2,500 characters instead of ~3,138 — about 20% under the promise, reachable
  // only below fontScale ~0.75. A per-theme bound would be exact but cannot
  // cross the wire: the server has neither table.
  const scale = unit === 'characters' ? COVER_LETTER_CHARACTER_CLAMP_FACTOR : 1;
  return Math.min(COVER_LETTER_MAX_WORDS * scale, Math.max(COVER_LETTER_MIN_WORDS * scale, target));
};
