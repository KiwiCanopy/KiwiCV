import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';

/**
 * Open the composer already asking for a letter: job-ad mode, cover-letter tick
 * on. Both live in `useFlowStore.prompt`, NOT in the `openAIModal`
 * options — `modalActions.ts` writes the resume store's `ai` slice, which
 * carries neither.
 *
 * ⚠️ **`coverLetterOnly`, and the target stays `'cv'`.** This control lives on
 * the Cover Letter section and promises a letter, so it must not rewrite the
 * user's CV on the way — reported 2026-09-08, after a run started here came
 * back having tailored the whole CV and offered to translate it. The target
 * stays `'cv'` because the worker reads `granularity` to decide the letter call
 * is even legal; the flag is what skips call 1.
 *
 * ⚠️ `coverLetterBlocker` checks mode before content, so a control that opened
 * the composer without presetting it would land the user on
 * `ai.cover_letter_needs_job` — a refusal reached by pressing the thing that
 * promised a letter.
 */
export const startCoverLetterDraft = () => {
  const flow = useFlowStore.getState();
  flow.setPromptMode('job_description');
  flow.setDraftCoverLetter(true);
  // ⚠️ The tick is the request and lives in `useFlowStore`; the fact that
  // KiwiCV set it is per-open state and rides here, so a reload cannot leave a
  // composer pre-ticked for a dialog that no longer exists.
  useResumeStore.getState().openAIModal('cv', { draftCoverLetter: true, coverLetterOnly: true });
};
