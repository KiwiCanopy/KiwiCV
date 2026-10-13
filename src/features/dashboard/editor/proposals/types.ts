/** One line of an array-valued diff: a bullet, and what happened to it. */
export interface DiffMark {
  value: string;
  mark: 'added' | 'removed' | 'unchanged';
  /** An added value the pre-run CV never mentions: shown, marked, the user decides. */
  unsourced?: boolean;
}

/**
 * One changed field of one entry.
 *
 * ⚠️ `mine` and `proposal` both come out of the stored suggestion, not out of
 * the résumé. The improved value is applied the moment the run lands
 * (`applyHandlers.ts`), so reading the live résumé for "proposal" would be
 * right today and wrong the instant anything else writes to that field.
 */
export interface EntryDiffRowModel {
  field: string;
  label: string;
  /** The user's wording, which the run replaced. */
  mine: string;
  /** What the AI proposed, and what the preview is already showing. */
  proposal: string;
  /** Present for list fields (`highlights`, `keywords`, `courses`). */
  marks: DiffMark[] | null;
  /** Present for prose fields — a cover letter's body. See `ProseDiffModel`. */
  prose: ProseDiffModel | null;
}

/**
 * A long prose field, compared by TOGGLING between the two versions rather than
 * by aligning them.
 *
 * ⚠️ **Nothing here pairs entry `i` with entry `i` for an ACTION.** The array is
 * a storage detail — the letter is one textarea, split on blank lines — and the
 * paragraph count is asked for in the prompt with nothing enforcing it, so a
 * model that merges two paragraphs shifts every index below. `changed` is a
 * same-index comparison used only to HINT which paragraphs moved, and it is
 * suppressed entirely when the counts differ, where the count is the headline.
 */
export interface ProseDiffModel {
  /** The user's paragraphs, in order. */
  mine: string[];
  /** The proposal's paragraphs, in order. */
  proposal: string[];
  /** Per proposal paragraph: does the same-index original differ? Empty when the counts differ. */
  changed: boolean[];
  changedCount: number;
  /** Signed, rounded percentage: negative is shorter. `0` when the change is under 5%. */
  lengthDeltaPercent: number;
}
