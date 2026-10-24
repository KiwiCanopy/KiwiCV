import { useState } from 'react';

import { type CoverLetterRequest } from '@/components/modals/ai/edit/types';
import {
  type AIChangeDetails,
  type AIRunStage,
  type AIStatus,
  type CoverLetterOutcome,
} from '@/components/modals/ai/template/statusTypes';
import { AI_JOB_STAGE_COVER_LETTER, AI_PAYWALL_CODES } from '@/constants/ai';
import { useAIJobRun } from '@/hooks/useAIJobRun';
import { type LocaleCode } from '@/locales';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { type AIPromptMode } from '@/store/ui/useFlowStore';
import {
  aiPollWindowMs,
  getAISuggestionBreakdown,
  isTooLongToTranslate,
  sanitizeForAI,
  translatesWholeCv,
} from '@/utils/ai';
import { selectAITargetData } from '@/utils/aiPayload';
import { type AITargetKey, parseAITarget } from '@/utils/aiTarget';
import { type Session } from '@supabase/supabase-js';

interface UseAIGenerationProps {
  session: Session | null;
  cvLanguage: LocaleCode;
  refreshProfile: () => Promise<void>;
  syncUsageStatus: () => Promise<{ proRequestsToday: number; isDailyLimitReached: boolean }>;
  setMonetizationMode: (mode: 'generic' | 'limit') => void;
  setIsUpgradeModalOpen: (open: boolean) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

interface AIResult {
  isNoOp?: boolean;
  isReorg?: boolean;
  skills?: Record<string, unknown>[];
  items?: Record<string, unknown>[];
  improvedFields?: Record<string, unknown>;
  /** Why the letter did not arrive. A notice on a SUCCESSFUL run. */
  coverLetterError?: string;
  /** Whether a "try again" can clear that failure. Decided beside the codes. */
  coverLetterRetryable?: boolean;
  /** The mid-run progress marker, which shares this column and is not a section. */
  stage?: string;
  [key: string]: unknown;
}

export const useAIGeneration = ({
  session,
  cvLanguage,
  refreshProfile,
  syncUsageStatus,
  setMonetizationMode,
  setIsUpgradeModalOpen,
  t,
}: UseAIGenerationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<AIStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [changeDetails, setChangeDetails] = useState<AIChangeDetails | undefined>();
  /**
   * How the letter half ended. A failure here is a PARTIAL failure on a
   * successful run: the tailoring is applied, one request was spent instead of
   * two, and the letter can be retried on its own.
   */
  const [coverLetterOutcome, setCoverLetterOutcome] = useState<CoverLetterOutcome | null>(null);
  /**
   * The call the user is waiting on. Set from what this run ASKED for, then
   * advanced by the worker's stage marker — never by a timer, because call 1
   * runs 7 s on a small CV and 39 s on a large one.
   */
  const [runStage, setRunStage] = useState<AIRunStage | null>(null);

  // Owns the row; an unmount mid-run deletes it.
  const jobRun = useAIJobRun();

  const applyAISuggestion = useResumeStore((state) => state.applyAISuggestion);
  const applyReorgSuggestion = useResumeStore((state) => state.applyReorgSuggestion);
  const acceptReorg = useResumeStore((state) => state.acceptReorg);
  const updateMeta = useResumeStore((state) => state.updateMeta);
  const updateCoverLetter = useResumeStore((state) => state.updateCoverLetter);

  const handleGenerate = async (params: {
    activeTarget: AITargetKey | null;
    mode: AIPromptMode | null;
    jobDescription: string;
    customPrompt: string;
    isReorgEligible: boolean;
    allowReorg: boolean;
    translateToAnotherLanguage: boolean;
    targetLang: LocaleCode;
    isWholeCV: boolean;
    coverLetter?: CoverLetterRequest | null;
    /**
     * Draft the letter alone, skipping call 1 and billing one request.
     *
     * ⚠️ Two callers: the retry, whose CV a previous run already tailored, and
     * the Cover Letter section's "write from the ad", whose CV is the user's
     * own and untailored (2026-09-08).
     */
    coverLetterOnly?: boolean;
  }) => {
    const {
      activeTarget,
      mode,
      jobDescription,
      customPrompt,
      isReorgEligible,
      allowReorg,
      translateToAnotherLanguage,
      targetLang,
      coverLetter,
      coverLetterOnly,
    } = params;

    if (!activeTarget || !mode) return;

    // ⚠️ A letter-only run with no block is `MISSING_PARAMS` server-side, so it
    // would turn "Try again" into a failed job on a run that had succeeded.
    // Unreachable from the panel, which offers the retry only on a failure the
    // same settings produced — and this is the boundary that cannot rely on
    // that.
    if (coverLetterOnly && !coverLetter) return;

    // A target that no longer exists has nothing to send, so it fails here rather
    // than spending a request on a job the worker can only reject.
    const targetData = selectAITargetData(useResumeStore.getState().resume, activeTarget);
    if (targetData === undefined) {
      setStatus('error');
      setErrorMessage(t('common.error_occurred'));
      return;
    }

    // The composer's autoRun skips the config view's refused button; the worker
    // would refuse this as `PAYLOAD_TOO_LARGE`, a generic error.
    const isTranslation = translatesWholeCv({
      isWholeCV: params.isWholeCV,
      isLetterOnly: Boolean(coverLetterOnly),
      translateToAnotherLanguage,
      targetLang,
      cvLanguage,
    });
    if (isTranslation && isTooLongToTranslate(useResumeStore.getState().resume)) {
      setStatus('error');
      setErrorMessage(t('ai.translate_too_long'));
      return;
    }

    // The daily allowance is authoritative server-side, but re-checking here
    // turns a guaranteed rejection into the paywall instead of a failed job.
    if (session?.access_token) {
      const usageStatus = await syncUsageStatus();
      if (usageStatus.isDailyLimitReached) {
        // ⚠️ A letter retry is offered from the SUCCESS panel, and `AIEditModal`
        // renders that panel only while `status !== 'idle'`. Resetting here
        // unmounts it behind the paywall, so dismissing the paywall would drop
        // the user on the config form with their tailored CV's outcome — and the
        // retry — gone. The error branch's own retry is the case this
        // reset was written for, and returning to config is right there.
        if (!coverLetterOnly) setStatus('idle');
        setMonetizationMode('limit');
        setIsUpgradeModalOpen(true);
        return;
      }
    }

    setIsLoading(true);
    setStatus('processing');
    setErrorMessage('');
    setCoverLetterOutcome(null);
    // What this run ASKED for. The two-step framing is knowable here, because
    // the caller built the block; only the ADVANCE needs the worker.
    setRunStage(
      coverLetterOnly
        ? { stage: 'cover_letter', twoStep: false }
        : coverLetter
          ? { stage: 'cv', twoStep: true }
          : null,
    );

    const data = useResumeStore.getState().resume;
    const { type, sectionKey: targetSectionKey } = parseAITarget(activeTarget);

    // Prepare instructions
    let instructions = '';
    if (mode === 'professional')
      instructions = 'Make it more professional, outcome-oriented, and use strong action verbs.';
    else if (mode === 'job_description')
      instructions = `Adjust to match this job description: ${jobDescription}`;
    else if (mode === 'custom') instructions = customPrompt;
    setChangeDetails(undefined);

    const processResult = async (result: AIResult) => {
      // Tailoring is the run that pulls skills in from the ad; ops/AI_LOGIC.md.
      const markUnsourced = mode === 'job_description';

      // ⚠️ Every non-section key split off before anything applies.
      // `applyCvSuggestion` walks what it is handed and logs an error for a key
      // it cannot write, so anything left here reads as a section that failed to
      // apply — which `coverLetterRetryable` once did, on every letter
      // failure. `stage` is the progress marker sharing this column: it survives
      // today only because the completion write REPLACES the column rather than
      // merging into it, and this line is what makes that stop mattering.
      const {
        coverLetterError: letterError,
        coverLetterRetryable: letterRetryable,
        stage: _stage,
        ...applicable
      } = result;
      const hasLetter = Boolean(applicable.coverLetter);
      setCoverLetterOutcome(
        letterError
          ? { status: 'failed', error: letterError, retryable: Boolean(letterRetryable) }
          : hasLetter
            ? { status: 'success', retryable: false }
            : null,
      );

      // The worker already excludes a letter failure from `isNoOp`; this is the
      // backstop, because `no_changes` is the one branch that renders no notice
      // and would answer a failed letter with a green "nothing needed".
      if (applicable.isNoOp && !letterError) {
        setStatus('no_changes');
      } else if (applicable.isReorg) {
        // ⚠️ The server sets `isReorg` only when the list it carries IS a
        // reorganisation (`isReorgResult`), so this trusts the flag rather than
        // re-deciding from the payload.
        if (type === 'cv') {
          const { skills: reorgSkills, isNoOp: _n, isReorg: _r, ...rest } = applicable;
          if (Object.keys(rest).length > 0) {
            applyAISuggestion(activeTarget, rest as Record<string, unknown>, {
              skipSuggestions: isTranslation,
              markUnsourced,
            });
          }
          if (reorgSkills) {
            applyReorgSuggestion('skills', reorgSkills);
            // ⚠️ A translation applies directly, with nothing to discard; a skills
            // proposal left open would revert alone into the old language (#26).
            if (isTranslation) acceptReorg();
          }

          if (isTranslation) {
            updateMeta({
              theme: {
                ...data.meta.theme,
                locale: targetLang,
              },
            });
          }
        } else if (applicable.items) {
          applyReorgSuggestion(targetSectionKey, applicable.items);
        }
        setStatus('success');
      } else {
        const { isNoOp: _n, isReorg: _r, ...cleanResult } = applicable;
        applyAISuggestion(activeTarget, cleanResult as Record<string, unknown>, {
          skipSuggestions: isTranslation,
          markUnsourced,
        });

        if (isTranslation) {
          updateMeta({
            theme: {
              ...data.meta.theme,
              locale: targetLang,
            },
          });
        }
        setStatus('success');
      }

      // ⚠️ On successful generation, never on the tick that asked for one. The
      // checkbox lives in the AI band and this setting lives in the Cover Letter
      // section, so a tick that flipped it would change a setting elsewhere on
      // screen — and leave it flipped when the user unticked the box.
      if (hasLetter) {
        updateCoverLetter({ enabled: true });
      }

      const isItemLevel = type === 'item';
      if (!isItemLevel) {
        const store = useResumeStore.getState();
        const sectionIds = type === 'section' ? [targetSectionKey] : undefined;

        const breakdown = getAISuggestionBreakdown(
          store.ai.suggestions,
          sectionIds,
          store.ai.reorgSuggestion,
        );

        setChangeDetails({
          itemsCount: breakdown.content,
          reorgCount: breakdown.reorg,
          reorgAdded: breakdown.reorgAdded,
          reorgRemoved: breakdown.reorgRemoved,
          reorgTotal: breakdown.reorgTotal,
        });
      }

      await refreshProfile();
      await syncUsageStatus();
    };

    const failStart = (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error('AI Generation Error:', err);
      setStatus('error');
      setErrorMessage(message || t('common.error_occurred'));
      setIsLoading(false);
    };

    let payload: ReturnType<typeof sanitizeForAI>;
    let pollWindowMs: number;
    try {
      payload = sanitizeForAI(targetData);
      // The same measure the worker caps (`JSON.stringify(resumeData).length`),
      // so the window and the cap read one number. A missing target
      // serialises to nothing and gets the floor.
      pollWindowMs = aiPollWindowMs(JSON.stringify(payload ?? null).length);
    } catch (err: unknown) {
      failStart(err);
      return;
    }

    await jobRun.start<AIResult>({
      accessToken: session?.access_token,
      userId: session?.user?.id,
      workerUrl: '/.netlify/functions/improve-cv-background',
      workerBody: (jobId) => ({
        jobId,
        activeTarget,
        mode,
        resumeData: payload,
        instructions,
        currentLang: cvLanguage,
        // ⚠️ `&& !coverLetterOnly`: a letter-only run skips call 1, so a
        // `true` here asks the worker for a reorganisation the skipped call
        // was supposed to produce. Settled here rather than inside
        // `isReorgEligible`, which is a property of the target and is read by
        // the composer bar on another surface.
        allowReorg: isReorgEligible && !coverLetterOnly ? allowReorg : false,
        ...(translateToAnotherLanguage ? { targetLang } : {}),
        ...(coverLetter ? { coverLetter } : {}),
        ...(coverLetterOnly ? { coverLetterOnly: true } : {}),
      }),
      pollWindowMs,
      startErrorMessage: 'Could not start background job',
      onRefused: async (kind) => {
        setIsLoading(false);
        setStatus('idle');
        setMonetizationMode(kind === AI_PAYWALL_CODES.LIMIT_REACHED ? 'limit' : 'generic');
        setIsUpgradeModalOpen(true);
        await refreshProfile();
        await syncUsageStatus();
      },
      onStartError: failStart,
      // The worker's stage marker, mid-run. Returning `prev` unchanged
      // once advanced keeps a 2 s poll from re-rendering the status view, and
      // from re-announcing a heading that has not changed.
      onProcessing: (result) => {
        if ((result as { stage?: string } | null)?.stage === AI_JOB_STAGE_COVER_LETTER) {
          setRunStage((prev) =>
            prev && prev.stage === 'cv' ? { stage: 'cover_letter', twoStep: prev.twoStep } : prev,
          );
        }
      },
      onTimeout: () => {
        setIsLoading(false);
        setStatus('error');
        setErrorMessage(t('common.error_occurred'));
      },
      onCompleted: async (result) => {
        setIsLoading(false);
        await processResult(result);
      },
      onFailed: async (error) => {
        setIsLoading(false);
        throw new Error(error || 'Generation failed');
      },
      onPollError: (err) => {
        console.error(err);
        setStatus('error');
        setErrorMessage(t('common.error_occurred'));
        setIsLoading(false);
      },
    });
  };

  return {
    isLoading,
    status,
    setStatus,
    errorMessage,
    changeDetails,
    coverLetterOutcome,
    runStage,
    handleGenerate,
  };
};
