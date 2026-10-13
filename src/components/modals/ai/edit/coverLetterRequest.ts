import { type CoverLetterRequest } from '@/components/modals/ai/edit/types';
import { type CoverLetterBlocker } from '@/components/modals/ai/template/coverLetterControlTypes';
import { letterFurniture } from '@/components/preview/letterCapacity';
import { resolveThemeId } from '@/components/preview/themeIds';
import {
  COVER_LETTER_DEFAULT_LENGTH,
  COVER_LETTER_DEFAULT_TONE,
  COVER_LETTER_LENGTH_PRESETS,
  COVER_LETTER_TONES,
  type CoverLetterLengthPreset,
  type CoverLetterTone,
} from '@/constants/ai';
import { type AIPromptMode } from '@/store/ui/useFlowStore';
import { type ResumeData } from '@/types/resume';
import { coverLetterLengthUnit, coverLetterWordTarget } from '@/utils/coverLetterLength';

/**
 * Whether the target can carry a letter at all. Whole-CV only: drafting an
 * application from one work entry is meaningless, and the second call reads the
 * CV call 1 just tailored.
 */
export const isCoverLetterEligible = (isWholeCV: boolean): boolean => isWholeCV;

/**
 * Letter content this run would LOSE. `subject` counts as well as the body: the
 * generator returns both fields and the apply path writes both, so a letter with
 * only a subject typed is still content a draft would overwrite.
 *
 * ⚠️ **Not the same question as `EditorSectionPanel`'s `letterHasText`**, which
 * reads `paragraphs` alone. That one asks "is there prose an Improve run can act
 * on"; this asks "is there anything a fresh draft would destroy". The divergence
 * is deliberate, and the shared name is the trap — a maintainer who finds one
 * will assume it is the other. Change one only after reading both.
 */
export const hasCoverLetterText = (letter: ResumeData['coverLetter']): boolean =>
  letter.subject.trim().length > 0 || letter.paragraphs.some((entry) => entry.trim().length > 0);

/**
 * ⚠️ **Content is no longer a refusal.** This once also returned
 * `'has_text'` whenever a letter existed, because a draft would have
 * overwritten it. It no longer can: a whole-CV run's letter lands on the
 * `item:coverLetter` proposal path with the previous letter kept as
 * `originalValue` (`applyHandlers.applyCvSuggestion`), so "Keep mine" restores
 * it. Refusing protected against something that cannot happen, and the cost was
 * a dead end — a second application had no route to
 * a fresh letter that did not start with emptying the old one by hand.
 *
 * Mode is still a refusal: only `job_description` carries an ad, and without one
 * there is nothing to write from.
 */
export const coverLetterBlocker = ({
  mode,
}: {
  mode: AIPromptMode | null;
}): CoverLetterBlocker | null => (mode === 'job_description' ? null : 'mode');

/**
 * The persisted tone, or the first one the prompt knows.
 *
 * ⚠️ `useFlowStore` persists to `sessionStorage`, so this value is arbitrary
 * JSON by the time it is read back. An unknown key reaches
 * `getCoverLetterPrompt` as `UNKNOWN_LETTER_TONE` → `LETTER_BAD_REQUEST`, which
 * is one of the two failures a retry cannot clear — a spent request and a letter
 * that never could have arrived.
 */
const resolveTone = (tone: string): CoverLetterTone =>
  (COVER_LETTER_TONES as readonly string[]).includes(tone)
    ? (tone as CoverLetterTone)
    : COVER_LETTER_DEFAULT_TONE;

/**
 * The persisted length preset, or the default.
 *
 * ⚠️ The same untrusted source as the tone, and a worse failure. An unknown key
 * makes `COVER_LETTER_LENGTH_PRESETS[preset]` `undefined`, so `wordTarget` is
 * `NaN` — which `JSON.stringify` sends as `null`, which the server reads as a
 * finite `0` and clamps to `COVER_LETTER_MIN_WORDS`. Not a rejection: a silent
 * 100-word letter, billed, in place of the length the user chose.
 */
const resolveLength = (length: string): CoverLetterLengthPreset =>
  Object.hasOwn(COVER_LETTER_LENGTH_PRESETS, length)
    ? (length as CoverLetterLengthPreset)
    : COVER_LETTER_DEFAULT_LENGTH;

export interface CoverLetterRequestInput {
  /**
   * The composer/modal mode. Only `job_description` carries an ad.
   *
   * ⚠️ The union, never `string`. Under `string` a rename of
   * `'job_description'` leaves `mode !== 'job_description'` permanently true —
   * the tick blocked forever, the builder returning `null` forever, the feature
   * silently dead, and the tests green because they assert the same literal.
   */
  mode: AIPromptMode | null;
  isWholeCV: boolean;
  /** The tick, as the store holds it — blockers are applied here, not by the caller. */
  draftCoverLetter: boolean;
  /** The ad, verbatim. Empty means no letter was asked for. */
  jobDescription: string;
  /**
   * The language the letter is written in: the CV's, or the language this run is
   * also translating the CV into — the letter echoes the CV the user will see.
   */
  targetLang: string;
  length: string;
  tone: string;
  matchStyle: boolean;
  styleSample: string;
  /** For the page-capacity table: a page is a theme, a layout and a font scale. */
  resume: ResumeData;
}

/**
 * The `coverLetter` block of an improve request, or `null` when this run is not
 * asking for a letter.
 *
 * ⚠️ **`null` rather than a block with an empty ad.** The server reads a missing
 * job description as "no letter was asked for" and answers `null`, so a caller
 * that sent its block whenever its panel was mounted would report a failed
 * letter on every ordinary tailoring run. Every reason not to ask is
 * therefore resolved here, before the block exists.
 */
export const buildCoverLetterRequest = ({
  mode,
  isWholeCV,
  draftCoverLetter,
  jobDescription,
  targetLang,
  length,
  tone,
  matchStyle,
  styleSample,
  resume,
}: CoverLetterRequestInput): CoverLetterRequest | null => {
  if (!draftCoverLetter) return null;
  if (!isCoverLetterEligible(isWholeCV)) return null;
  if (coverLetterBlocker({ mode })) return null;

  const ad = jobDescription.trim();
  if (!ad) return null;

  const sample = matchStyle ? styleSample.trim() : '';
  // ⚠️ Chosen "my writing style" with nothing saved asks for NO letter, rather
  // than quietly falling back to a tone. Spending two requests on a voice the
  // user did not pick is the failure this returns null to avoid; the UI refuses
  // before the run, and this is the boundary that cannot rely on it.
  if (matchStyle && !sample) return null;

  return {
    jobDescription: ad,
    targetLang,
    // ⚠️ A NUMBER, resolved here. The preset is a fraction of a page, and a page
    // is a theme, a layout and a font scale — facts the client has and the
    // backend does not, which is why the fractions never cross.
    // ⚠️ Characters, not words, when the letter's language has no whitespace
    // words — `zh` and `ja`. The unit is derived from `targetLang` on both
    // sides rather than sent, so the client and the prompt cannot disagree
    // about what the number means.
    wordTarget: coverLetterWordTarget(
      resolveLength(length),
      resolveThemeId(resume.meta.theme.name),
      resume.coverLetter.layout.classicLayout,
      resume.meta.theme.params.fontSizeScale ?? 1,
      // ⚠️ The address blocks the user actually shows. Both capacity tables were
      // measured with both ON while the app ships both OFF, so before this a
      // default letter was targeted at a page 11-65% smaller than the one it
      // would print on — the "long letter came out short" report (2026-09-08).
      letterFurniture(resume.coverLetter.layout),
      coverLetterLengthUnit(targetLang),
    ),
    // ⚠️ One voice block or the other, and never neither. The sample REPLACES
    // the tone in the prompt, so sending both leaves the server to decide what
    // the user meant — and sending neither reaches `getCoverLetterPrompt` as
    // `UNKNOWN_LETTER_TONE`, a spent request and a `LETTER_BAD_REQUEST` no retry
    // can clear. The guard above is what makes "neither" unreachable.
    ...(sample ? { styleSample: sample } : { tone: resolveTone(tone) }),
  };
};
