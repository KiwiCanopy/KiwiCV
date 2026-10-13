import { useState } from 'react';

import { coverLetterBlocker } from '@/components/modals/ai/edit/coverLetterRequest';
import { useAIRunner } from '@/components/modals/ai/edit/useAIRunner';
import { type CoverLetterControlState } from '@/components/modals/ai/template/coverLetterControlTypes';
import { AI_MAX_CHAR_LIMIT } from '@/constants/ai';
import {
  type AccessChipState,
  type ComposerMode,
} from '@/features/dashboard/editor/composer/types';
import { useAIEntryGuard } from '@/hooks/useAIEntryGuard';
import { useTranslation } from '@/hooks/useTranslation';
import { type LocaleCode } from '@/locales';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { getAITrackingParams, translationTargets } from '@/utils/ai';

/**
 * The composer bar's state and its one action.
 *
 * ⚠️ The bar does **not** run the job. It writes its draft into
 * `useFlowStore.prompt` and opens the existing modal with `autoRun`, which is
 * how it inherits `AIStatusView`'s progress, error, retry and paywall handling.
 * Re-implementing those inside a 60px bar would duplicate the whole failure
 * surface, and they are the part users actually meet when a run goes wrong.
 */
export function useAIComposer() {
  const { cvLanguage } = useTranslation();
  const openAIModal = useResumeStore((state) => state.openAIModal);
  const isGenerating = useResumeStore((state) => state.ai.isGenerating);

  const setMode = useFlowStore((state) => state.setPromptMode);
  const setJobDescription = useFlowStore((state) => state.setJobDescription);
  const setCustomPrompt = useFlowStore((state) => state.setCustomPrompt);
  const setAllowReorg = useFlowStore((state) => state.setAllowReorg);

  const runner = useAIRunner({ enabled: true, target: 'cv' });
  const {
    isPremium,
    needsUpgrade,
    isDailyLimitReached,
    // Whole CV, so this is true today. Read from the runner anyway: it is the
    // same expression `AIConfigView` gates on, so the bar cannot start offering
    // a restructure for a target the backend refuses to reorganise.
    isReorgEligible,
  } = runner;

  // ⚠️ Local, seeded once from the persisted prompt draft, and mirrored back on
  // every change rather than read back. The modal calls `resetPrompt()` when it
  // closes — including after a section-level Improve the composer knows nothing
  // about — so reading the store here would blank a pasted job ad behind the
  // user's back. Seeding still recovers a draft across a reload.
  const [mode, setLocalMode] = useState<ComposerMode>(() => {
    const stored = useFlowStore.getState().prompt.mode;
    return stored === 'professional' || stored === 'custom' ? stored : 'job_description';
  });
  const [jobDescription, setLocalJobDescription] = useState(
    () => useFlowStore.getState().prompt.jobDescription,
  );
  const [customPrompt, setLocalCustomPrompt] = useState(
    () => useFlowStore.getState().prompt.customPrompt,
  );
  const [allowReorg, setLocalAllowReorg] = useState(
    () => useFlowStore.getState().prompt.allowReorg,
  );
  const [translate, setTranslate] = useState(false);
  // ⚠️ A target the picker does not offer is a silent no-op: both ends read
  // `targetLang === currentLang` as "not a translation". Seed and value both
  // come off `translationTargets`, so they cannot disagree with the options.
  const [targetLangChoice, setTargetLang] = useState<LocaleCode | null>(null);
  const targetLangOptions = translationTargets(cvLanguage);
  const targetLang =
    targetLangChoice && targetLangOptions.includes(targetLangChoice)
      ? targetLangChoice
      : targetLangOptions[0];
  // The sign-in-then-pass chain, and the paywall's JSX with it — a consumer that
  // got a boolean and had to remember its own modal would leave a user without a
  // pass pressing a button that does nothing.
  const { allowRun, modals: guardModals } = useAIEntryGuard();

  const updateMode = (next: ComposerMode) => {
    setLocalMode(next);
    setMode(next);
  };

  const updateJobDescription = (next: string) => {
    setLocalJobDescription(next);
    setJobDescription(next);
  };

  const updateCustomPrompt = (next: string) => {
    setLocalCustomPrompt(next);
    setCustomPrompt(next);
  };

  const updateAllowReorg = (next: boolean) => {
    setLocalAllowReorg(next);
    setAllowReorg(next);
  };

  /**
   * Push every mirrored draft back into the store, which is what `useAIRunner`
   * reads when the modal actually runs.
   *
   * Re-asserted rather than trusted: the modal's `resetPrompt()` on close can
   * have cleared any of it since the user set it — including after a
   * section-level Improve this bar knows nothing about.
   */
  const syncPromptToStore = () => {
    setMode(mode);
    setJobDescription(jobDescription);
    setCustomPrompt(customPrompt);
    setAllowReorg(allowReorg);
  };

  const coverLetterBlockedBy = coverLetterBlocker({ mode });

  /**
   * The band's chrome for the letter. Every field comes off the runner, which
   * reads the store — the band keeps no copy of its own, because `resetPrompt`
   * no longer clears these and there is nothing left for a mirror to protect.
   *
   * ⚠️ **Enumerated, not spread-and-overridden.** A spread already satisfies
   * the interface, so a field added to `CoverLetterControlState` and forgotten
   * here would compile — and the band would render the store while writing
   * somewhere else. Listing all of them makes that `TS2741`.
   *
   * Only the two DERIVED fields differ, and both for the same reason:
   * `useFlowStore.prompt.mode` is written when the bar runs or hands off, so
   * the runner's blocker is stale for exactly as long as the user is choosing
   * a mode.
   */
  const coverLetter: CoverLetterControlState = {
    eligible: runner.coverLetter.eligible,
    blockedBy: coverLetterBlockedBy,
    enabled:
      runner.coverLetter.enabledPreference && runner.coverLetter.eligible && !coverLetterBlockedBy,
    setEnabled: runner.coverLetter.setEnabled,
    enabledPreference: runner.coverLetter.enabledPreference,
    length: runner.coverLetter.length,
    setLength: runner.coverLetter.setLength,
    tone: runner.coverLetter.tone,
    setTone: runner.coverLetter.setTone,
    matchStyle: runner.coverLetter.matchStyle,
    setMatchStyle: runner.coverLetter.setMatchStyle,
    needsSample: runner.coverLetter.needsSample,
    styleSample: runner.coverLetter.styleSample,
    setStyleSample: runner.coverLetter.setStyleSample,
    clearStyleSample: runner.coverLetter.clearStyleSample,
  };

  /**
   * `null` is the load-bearing case: a Premium Pass holder inside their daily
   * allowance has nothing to be warned about, so the bar shows no chip at all.
   */
  const accessState: AccessChipState | null = !needsUpgrade
    ? null
    : isDailyLimitReached
      ? 'limit'
      : 'blocked';

  const draft = mode === 'job_description' ? jobDescription : customPrompt;
  const needsDraft = mode !== 'professional';
  /**
   * Whether the mode has what it needs to run — the input half of `canRun`,
   * without the in-flight half.
   *
   * The add-on options key off this rather than off `canRun`, because `canRun`
   * also drops to false while a run is in flight, and hiding the options
   * mid-run would collapse a row the user is watching. It also key off this
   * rather than off the field being collapsed: `professional` has no field at
   * all, so "collapsed" is meaningless there, whereas "can this actually run"
   * is meaningful in every mode.
   */
  const hasRunnableInput = !needsDraft || draft.trim().length > 0;
  const canRun = !isGenerating && hasRunnableInput;

  /**
   * The run is refused for a reason the user can fix here, as opposed to
   * `canRun`, which is about whether a run is possible at all.
   *
   * ⚠️ **Kept separate on purpose.** `AIComposerBar` renders the run button as
   * `{canRunNow && …}` — absent, not disabled — so folding this into `canRun`
   * would make the Improve button VANISH because of a cover-letter dropdown.
   * The button stays, demotes to `secondary`, and states why.
   */
  const runBlocked = coverLetter.enabled && coverLetter.needsSample;

  /** Returns whether the run actually launched — false when refused or bounced by the guard. */
  const run = (): boolean => {
    if (!canRun || runBlocked) return false;

    if (!allowRun()) return false;

    // ⚠️ The modal's `resetPrompt()` on close can have cleared the store since
    // any of this was set, and `useAIRunner` reads it all straight off the store.
    syncPromptToStore();

    analytics.track(ANALYTICS_EVENTS.AI_COMPOSER_RUN, {
      mode,
      translate,
      coverLetter: coverLetter.enabled,
      ...getAITrackingParams('cv'),
    });
    // AIConfigView's own button tracks this; the autoRun path skips that view,
    // so the bar has to report the request itself or the funnel loses a step.
    analytics.track(ANALYTICS_EVENTS.AI_SUGGESTION_REQUESTED, {
      mode,
      isPremium,
      ...getAITrackingParams('cv'),
    });

    // ⚠️ Translation is an add-on, not a fourth mode. It used to force
    // `translate_close` and hand off to `openTranslationModal`, which threw away
    // the selected mode and the pasted job ad — the backend has a branch written
    // for exactly the combined case, and the dialog it detoured through only
    // re-asked for the language the bar had already collected.
    openAIModal('cv', { autoRun: true, ...(translate ? { translateTo: targetLang } : {}) });
    return true;
  };

  /**
   * The phone card's hand-off: the same target, but through the modal's own
   * selection and config screens, because the bar cannot show them at 375px.
   */
  const openOptions = () => {
    if (!allowRun()) return;
    openAIModal('cv');
  };

  return {
    mode,
    setMode: updateMode,
    jobDescription,
    setJobDescription: updateJobDescription,
    customPrompt,
    setCustomPrompt: updateCustomPrompt,
    draft,
    needsDraft,
    hasRunnableInput,
    charLimit: AI_MAX_CHAR_LIMIT,
    allowReorg,
    setAllowReorg: updateAllowReorg,
    coverLetter,
    isReorgEligible,
    translate,
    setTranslate,
    targetLang,
    setTargetLang,
    targetLangOptions,
    cvLanguage,
    accessState,
    canRun,
    runBlocked,
    isGenerating,
    run,
    openOptions,
    guardModals,
  };
}
