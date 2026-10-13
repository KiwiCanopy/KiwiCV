import { type CoverLetterLengthPreset, type CoverLetterTone } from '@/constants/ai';

/*
 * The cover-letter control's props contract, kept in `template/` so the control
 * needs nothing from `edit/`. Types only, importing only `constants/ai`:
 * `verbatimModuleSyntax` keeps every `import { type … }` as a live edge.
 */

/**
 * Why the tick cannot be taken up.
 *
 * PRE-FLIGHT: the client knows the cause before a request is made, so it is not
 * worth a background job and a refusal afterwards.
 *
 * ⚠️ Not beside `coverLetterBlocker` in `edit/coverLetterRequest.ts`: that
 * closed a cycle through `edit/types.ts`. Here, `edit/` imports it and
 * `template/` stays a leaf.
 *
 * ⚠️ One member, deliberately. `'has_text'` was removed: a drafted
 * letter now arrives as an `item:coverLetter` proposal keeping the previous one
 * as `originalValue`, so there is nothing to protect by refusing.
 */
export type CoverLetterBlocker =
  /** The run is not tailoring to an ad, so there is nothing to write about. */
  'mode';

/**
 * Everything the cover-letter control renders and writes, in one bag.
 *
 * One flow-store field, two chromes: the composer band's add-ons strip and the
 * AI modal both read this off `useAIRunner`, so they cannot disagree about what
 * the next run will ask for — the same contract `allowReorg` already has.
 */
export interface CoverLetterControlState {
  /** Whole-CV targets only. False means the control is not rendered at all. */
  eligible: boolean;
  /** A pre-flight refusal, or `null` when the tick is live. */
  blockedBy: CoverLetterBlocker | null;
  /** The tick as the run will honour it — a blocker forces it false. */
  enabled: boolean;
  /**
   * The tick as the user last set it, blockers ignored. The band re-derives
   * `enabled` against its own mode, so it needs the preference the derivation
   * starts from; nothing else should read this.
   */
  enabledPreference: boolean;
  setEnabled: (enabled: boolean) => void;
  length: CoverLetterLengthPreset;
  setLength: (length: CoverLetterLengthPreset) => void;
  tone: CoverLetterTone;
  setTone: (tone: CoverLetterTone) => void;
  matchStyle: boolean;
  setMatchStyle: (match: boolean) => void;
  /**
   * The writing sample was chosen and there is nothing to draft from.
   *
   * ⚠️ Not a `CoverLetterBlocker`. Those are conditions the SYSTEM imposes on a
   * stale tick and they force it false; this one the user is halfway through
   * creating, so the choice stands and the run waits.
   */
  needsSample: boolean;
  /** Controlled: the run reads what is on screen, never the stored copy. */
  styleSample: string;
  setStyleSample: (sample: string) => void;
  clearStyleSample: () => void;
}
