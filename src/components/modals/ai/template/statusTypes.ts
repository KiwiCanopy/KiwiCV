/**
 * The AI status view's vocabulary, in a module that imports nothing.
 *
 * ⚠️ **Not in `AIStatusView.tsx`, and this is not a style preference.**
 * `verbatimModuleSyntax` compiles `import { type A } from './a'` to
 * `import {} from './a'` — a live runtime edge. With these declared beside the
 * component, `edit/types.ts` (a pure type module) dragged a React component and
 * its `lucide-react`, `StatePanel` and `analytics` imports into every consumer,
 * and would close a cycle the moment anything in `template/` imported `edit/` —
 * which `templateIsALeaf.test.ts` forbids. This is the `themeIds.ts`
 * remedy; `coverLetterControlTypes.ts` applies it to `CoverLetterBlocker`.
 */

export type AIStatus = 'idle' | 'processing' | 'success' | 'error' | 'no_changes';

export interface AIChangeDetails {
  itemsCount: number;
  reorgCount: number;
  reorgTotal?: number;
  reorgAdded?: number;
  reorgRemoved?: number;
}

/**
 * How the letter half of a two-call run ended. `null` when the run asked
 * for no letter — which is not the same as one that failed.
 */
export interface CoverLetterOutcome {
  status: 'success' | 'failed';
  /** One of `COVER_LETTER_FAILURES`, for the analytics payload. */
  error?: string;
  /**
   * ⚠️ Read from the job, never re-derived here. `LETTER_ALLOWANCE_SPENT` and
   * `LETTER_BAD_REQUEST` are refused the same way a second time, and the server
   * is what knows which codes those are.
   */
  retryable: boolean;
}

/** How the letter half of a run is surfaced: a sentence, a card, or nothing. */
export type CoverLetterPresentation = 'sentence' | 'card' | 'none';

/**
 * ⚠️ The one exhaustive read of `CoverLetterOutcome['status']` — the failure and
 * the success are rendered by different files, so a new member added without
 * touching this fails the build here rather than vanishing from both.
 */
export const coverLetterPresentation = (
  outcome?: CoverLetterOutcome | null,
): CoverLetterPresentation => {
  if (!outcome) return 'none';
  switch (outcome.status) {
    case 'failed':
      return 'sentence';
    case 'success':
      return 'card';
    default: {
      // A new `status` member lands here and fails the build, which is the point.
      const unhandled: never = outcome.status;
      return unhandled;
    }
  }
};

/**
 * Which call the user is waiting on. Absent for every single-call run,
 * including the import modal, which is what keeps the status view's default
 * behaviour exactly what it was.
 */
export interface AIRunStage {
  stage: 'cv' | 'cover_letter';
  /** True only for the CV + letter pair. A letter-only re-run is a single call. */
  twoStep: boolean;
}
