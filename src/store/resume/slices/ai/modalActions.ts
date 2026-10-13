import { type ResumeStore } from '@/store/resume/types';
import { type AITargetKey } from '@/utils/aiTarget';

export const setAIGenerating = (state: ResumeStore, generating: boolean) => {
  state.ai.isGenerating = generating;
};

export const openAIModal = (
  state: ResumeStore,
  target: AITargetKey,
  options?: {
    autoRun?: boolean;
    translateTo?: string | null;
    draftCoverLetter?: boolean;
    coverLetterOnly?: boolean;
  },
) => {
  state.ai.activeTarget = target;
  state.ai.isModalOpen = true;
  state.ai.autoRun = options?.autoRun ?? false;
  // ⚠️ The INTENT, not the tick. The tick itself lives in `useFlowStore.prompt`
  // where `useAIRunner` reads it; this records that KiwiCV set it rather than
  // the user, so closing can put it back. It belongs here because this
  // slice is per-open dialog state and is excluded from persistence — a reload
  // must not leave a composer pre-ticked for a dialog that no longer exists.
  // ⚠️ `|| coverLetterOnly`: a letter-only run IS a request for a letter, so the
  // pair "letter-only, tick off" is not a state any caller should be able to
  // write. It fails silently otherwise — the request builder returns `null` and
  // `useAIGeneration` swallows the run on a bare `return`, i.e. a primary button
  // that does nothing at all (architect-reviewer, 2026-09-08).
  state.ai.presetCoverLetter = (options?.draftCoverLetter || options?.coverLetterOnly) ?? false;
  // ⚠️ Cleared on every open, like the flag above. A dialog opened from anywhere
  // else is a whole-CV run, and inheriting this from a previous open would skip
  // call 1 on a run the user asked to tailor their CV.
  state.ai.coverLetterOnly = options?.coverLetterOnly ?? false;
  // ⚠️ `isTranslationMode` stays false even with a target language. It means
  // "this is the translate-*only* invite" — it locks the language picker and
  // relabels the header. A composer run that also translates keeps its mode, so
  // it names the language without claiming to be that flow.
  state.ai.isTranslationMode = false;
  state.ai.translationTargetLang = options?.translateTo ?? null;
};

export const openTranslationModal = (state: ResumeStore, targetLang: string) => {
  state.ai.activeTarget = 'cv';
  state.ai.isModalOpen = true;
  state.ai.autoRun = false;
  state.ai.presetCoverLetter = false;
  state.ai.coverLetterOnly = false;
  state.ai.isTranslationMode = true;
  state.ai.translationTargetLang = targetLang;
};

/**
 * ⚠️ The one-shot guard on `autoRun` is a component-local ref, so any remount
 * re-fires the run. Clearing the store flag once the run is in flight makes the
 * guard global. Not at fire time: `isAutoPending` reads `autoRun` to hold the
 * busy view through the async gap before `status` becomes 'processing'.
 */
export const consumeAutoRun = (state: ResumeStore) => {
  state.ai.autoRun = false;
};

export const closeAIModal = (state: ResumeStore) => {
  state.ai.activeTarget = null;
  state.ai.isModalOpen = false;
  state.ai.autoRun = false;
  state.ai.presetCoverLetter = false;
  state.ai.coverLetterOnly = false;
  state.ai.isTranslationMode = false;
  state.ai.translationTargetLang = null;
};

export const clearUpdatedTargets = (state: ResumeStore) => {
  state.ai.lastUpdatedTargets = [];
};
