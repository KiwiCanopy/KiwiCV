import { useMemo, useState } from 'react';

import {
  buildCoverLetterRequest,
  coverLetterBlocker,
  isCoverLetterEligible,
} from '@/components/modals/ai/edit/coverLetterRequest';
import { useAIGeneration } from '@/components/modals/ai/edit/useAIGeneration';
import { useAIUsage } from '@/components/modals/ai/edit/useAIUsage';
import { useCoverLetterStyle } from '@/components/modals/ai/edit/useCoverLetterStyle';
import { AI_PRO_DAILY_LIMIT, AI_REORG_SECTIONS } from '@/constants/ai';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { type LocaleCode } from '@/locales';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { getAlternateLanguage, isTooLongToTranslate, translatesWholeCv } from '@/utils/ai';
import { type AITargetKey, parseAITarget } from '@/utils/aiTarget';

export interface UseAIRunnerOptions {
  /**
   * Gates the daily-usage lookup. The modal passes its own open state; the
   * editor's composer passes whether the composer is on screen.
   *
   * ⚠️ This is what used to be the literal `isModalOpen` read inside the hook.
   * A second consumer meant the gate could no longer be "is the modal open",
   * or every editor mount would have fetched usage for a modal nobody opened.
   */
  enabled: boolean;
  /**
   * What the cost and any run are for. Defaults to the store's
   * `ai.activeTarget`, which is what the modal wants. The composer names its
   * target up front, because it prices the run *before* the modal is open and
   * `activeTarget` is still `null` at that point.
   */
  target?: AITargetKey;
}

/**
 * One AI run: the access/limit check, the prompt draft, and the generation call.
 *
 * Shared by `useAIEdit` (the modal) and the editor's composer bar so the two
 * cannot disagree about whether the user may start one. The
 * composer does not call `handleGenerate` itself — it writes the prompt draft
 * and opens the modal with `autoRun`, which is how it inherits `AIStatusView`'s
 * progress, error, retry and paywall handling instead of re-implementing them.
 */
export const useAIRunner = ({ enabled, target }: UseAIRunnerOptions) => {
  const { t, cvLanguage } = useTranslation();
  const { profile, session, refreshProfile, isPremium } = useAuth();

  const storeTarget = useResumeStore((state) => state.ai.activeTarget);
  const closeAIModal = useResumeStore((state) => state.closeAIModal);
  const isTranslationMode = useResumeStore((state) => state.ai.isTranslationMode);
  const translationTargetLang = useResumeStore((state) => state.ai.translationTargetLang);

  const activeTarget = target ?? storeTarget;

  const mode = useFlowStore((state) => state.prompt.mode);
  const setMode = useFlowStore((state) => state.setPromptMode);
  const jobDescription = useFlowStore((state) => state.prompt.jobDescription);
  const setJobDescription = useFlowStore((state) => state.setJobDescription);
  const customPrompt = useFlowStore((state) => state.prompt.customPrompt);
  const setCustomPrompt = useFlowStore((state) => state.setCustomPrompt);
  const allowReorg = useFlowStore((state) => state.prompt.allowReorg);
  const setAllowReorg = useFlowStore((state) => state.setAllowReorg);
  const draftCoverLetter = useFlowStore((state) => state.prompt.draftCoverLetter);
  const setDraftCoverLetter = useFlowStore((state) => state.setDraftCoverLetter);
  const coverLetterLength = useFlowStore((state) => state.prompt.coverLetterLength);
  const setCoverLetterLength = useFlowStore((state) => state.setCoverLetterLength);
  const coverLetterTone = useFlowStore((state) => state.prompt.coverLetterTone);
  const setCoverLetterTone = useFlowStore((state) => state.setCoverLetterTone);
  const pickedMatchStyle = useFlowStore((state) => state.prompt.coverLetterMatchStyle);
  const setCoverLetterMatchStyle = useFlowStore((state) => state.setCoverLetterMatchStyle);
  const resetPrompt = useFlowStore((state) => state.resetPrompt);

  /**
   * ⚠️ Mounted HERE, where the request is assembled, and passed down to the
   * field as a controlled value. A field owning its own copy leaves the only
   * read available to this builder the STORED one — up to a debounce window
   * stale, and stale for the whole time the user is typing.
   */
  const {
    sample: styleSample,
    setSample: setStyleSample,
    clear: clearStyleSample,
  } = useCoverLetterStyle();

  // ⚠️ Derived here, never seeded into the store: a sample stamped for an
  // account reads '' until auth binds the owner, long after the store exists (#56).
  const coverLetterMatchStyle = pickedMatchStyle ?? styleSample.trim().length > 0;

  // ⚠️ Seeded from *either* signal. `isTranslationMode` is the translate-only
  // invite; a bare `translationTargetLang` is a composer run that keeps its own
  // mode and rides the translation along, which is the combined branch the
  // backend prompt is written for. `AIEditModal` unmounts while closed, so this
  // seed is re-read on every open.
  const [translateToAnotherLanguage, setTranslateToAnotherLanguage] = useState(
    () => isTranslationMode || translationTargetLang != null,
  );
  const [targetLang, setTargetLang] = useState<LocaleCode>(
    () => (translationTargetLang as LocaleCode) || getAlternateLanguage(cvLanguage),
  );

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [monetizationMode, setMonetizationMode] = useState<'generic' | 'limit'>('generic');

  const { proRequestsToday, isResolvingUsage, syncUsageStatus } = useAIUsage(
    enabled,
    isPremium,
    session?.access_token,
  );

  const isDailyLimitReached = isPremium && (proRequestsToday || 0) >= AI_PRO_DAILY_LIMIT;
  const needsUpgrade = !isPremium || isDailyLimitReached;

  const {
    isLoading,
    status,
    setStatus,
    errorMessage,
    changeDetails,
    coverLetterOutcome,
    runStage,
    handleGenerate: internalHandleGenerate,
  } = useAIGeneration({
    session,
    cvLanguage,
    refreshProfile,
    syncUsageStatus,
    setMonetizationMode,
    setIsUpgradeModalOpen,
    t,
  });

  const { type: targetType, sectionKey: targetSection } = parseAITarget(activeTarget ?? '');
  const isWholeCV = targetType === 'cv';

  /**
   * This run writes the letter and leaves the CV alone — the Cover Letter
   * section's "write from the ad", and the letter retry.
   *
   * ⚠️ Deliberately NOT folded into `isWholeCV`. That flag answers "does the
   * request carry the whole CV", which a letter-only run still does: the worker
   * needs `granularity: 'cv'` to allow the letter call at all, and echoes the CV
   * into the letter's projection. This one answers "will call 1 run", which is
   * a different question and the only one the CV-shaped controls care about.
   */
  const isLetterOnly = useResumeStore((state) => state.ai.coverLetterOnly);

  const resume = useResumeStore((state) => state.resume);
  const isWholeCvTranslation = translatesWholeCv({
    isWholeCV,
    isLetterOnly,
    translateToAnotherLanguage,
    targetLang,
    cvLanguage,
  });
  // Measured only while a whole-CV translation is chosen: it serialises the CV.
  const translationTooLong = useMemo(
    () => isWholeCvTranslation && isTooLongToTranslate(resume),
    [isWholeCvTranslation, resume],
  );

  /**
   * Whether this TARGET supports reorganisation — a fact about the section, not
   * about the run.
   *
   * ⚠️ **`isLetterOnly` is deliberately NOT folded in here.** It was, briefly,
   * and that made a per-dialog store flag leak onto another surface:
   * `useAIComposer` runs its own `useAIRunner({ target: 'cv' })` and gates the
   * composer bar's restructure checkbox on this value, on the stated grounds
   * that it is "the same expression `AIConfigView` gates on". Folding the flag
   * in meant a letter-only dialog opened from the Cover Letter section changed
   * a control on a surface with no relationship to it — invisible only because
   * the overlay covers it. The two facts are combined where they are used:
   * `AIConfigView` renders `isReorgEligible && !isLetterOnly`, matching its
   * sibling `isWholeCV && !isLetterOnly`, and the request is settled in
   * `useAIGeneration` beside `coverLetterOnly`.
   */
  const isReorgEligible =
    isWholeCV ||
    (targetType === 'section' &&
      (AI_REORG_SECTIONS as readonly string[]).includes(targetSection as string));

  /**
   * The letter is drafted from the CV call 1 produces, so it is written in the
   * language the user is about to read — the translation target when this run
   * also translates, and the CV's own language otherwise.
   */
  const letterTargetLang = translateToAnotherLanguage ? targetLang : cvLanguage;
  const coverLetterEligible = isCoverLetterEligible(isWholeCV);
  const coverLetterBlockedBy = coverLetterBlocker({ mode });

  const resetState = () => {
    resetPrompt();
    setTranslateToAnotherLanguage(false);
    setTargetLang(getAlternateLanguage(cvLanguage));
    setStatus('idle');
  };

  const runGenerate = (options?: { coverLetterOnly?: boolean }) =>
    internalHandleGenerate({
      // Either source: the dialog was opened letter-only, or this is the letter
      // retry on a finished job. Both mean "skip call 1".
      ...(isLetterOnly || options?.coverLetterOnly ? { coverLetterOnly: true } : {}),
      activeTarget,
      mode,
      jobDescription,
      customPrompt,
      isReorgEligible,
      allowReorg,
      translateToAnotherLanguage,
      targetLang,
      isWholeCV,
      // `null` whenever this run is not asking for a letter, which is the whole
      // contract: a block with an empty ad reads server-side as a letter that
      // failed rather than one nobody asked for.
      coverLetter: buildCoverLetterRequest({
        mode,
        isWholeCV,
        draftCoverLetter,
        jobDescription,
        targetLang: letterTargetLang,
        length: coverLetterLength,
        tone: coverLetterTone,
        matchStyle: coverLetterMatchStyle,
        styleSample,
        resume: useResumeStore.getState().resume,
      }),
    });

  /**
   * ⚠️ Two argument-less functions rather than one that takes an option. Both
   * are wired to click handlers, and a handler receives a `MouseEvent` as its
   * first argument — so an options object would be silently replaced by the
   * event, and "Try again" would spend a second full tailoring run instead of
   * re-running the letter alone.
   */
  const handleGenerate = () => runGenerate();
  const handleCoverLetterRetry = () => runGenerate({ coverLetterOnly: true });

  return {
    activeTarget,
    isTranslationMode,
    isLetterOnly,
    mode,
    setMode,
    jobDescription,
    setJobDescription,
    customPrompt,
    setCustomPrompt,
    translateToAnotherLanguage,
    setTranslateToAnotherLanguage,
    targetLang,
    setTargetLang,
    cvLanguage,
    isLoading,
    status,
    setStatus,
    errorMessage,
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    monetizationMode,
    setMonetizationMode,
    needsUpgrade,
    isResolvingUsage,
    isDailyLimitReached,
    isWholeCV,
    isReorgEligible,
    translationTooLong,
    allowReorg,
    setAllowReorg,
    coverLetter: {
      eligible: coverLetterEligible,
      blockedBy: coverLetterBlockedBy,
      // ⚠️ The EFFECTIVE tick, not the stored one. A blocker can appear under a
      // box already ticked — switch to `professional`, or accept a letter this
      // run just drafted — and a control still reading "checked" beside its own
      // refusal promises a letter that `buildCoverLetterRequest` will not ask for.
      enabled: draftCoverLetter && coverLetterEligible && !coverLetterBlockedBy,
      enabledPreference: draftCoverLetter,
      setEnabled: setDraftCoverLetter,
      length: coverLetterLength,
      setLength: setCoverLetterLength,
      tone: coverLetterTone,
      setTone: setCoverLetterTone,
      matchStyle: coverLetterMatchStyle,
      setMatchStyle: setCoverLetterMatchStyle,
      needsSample: coverLetterMatchStyle && styleSample.trim().length === 0,
      styleSample,
      setStyleSample,
      clearStyleSample,
    },
    profile,
    isPremium,
    session,
    closeAIModal,
    resetState,
    handleGenerate,
    handleCoverLetterRetry,
    syncUsageStatus,
    changeDetails,
    coverLetterOutcome,
    runStage,
    proRequestsToday,
  };
};
