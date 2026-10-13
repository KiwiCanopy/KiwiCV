import React from 'react';

import { AIStatusOutcomeCards } from '@/components/modals/ai/template/AIStatusOutcomeCards';
import { AIStatusProcessing } from '@/components/modals/ai/template/AIStatusProcessing';
import {
  type AIChangeDetails,
  type AIRunStage,
  type AIStatus,
  type CoverLetterOutcome,
  coverLetterPresentation,
} from '@/components/modals/ai/template/statusTypes';
import { Button } from '@/components/ui/Button';
import { StatePanel } from '@/components/ui/StatePanel';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { getAITrackingParams } from '@/utils/ai';
import { type AITargetKey } from '@/utils/aiTarget';

interface AIStatusViewProps {
  status: AIStatus;
  errorMessage?: string;
  onRetry?: () => void;
  onBack?: () => void;
  onSuccess?: () => void;
  changeDetails?: AIChangeDetails;
  successTitle?: string;
  successDescription?: string;
  /** Extra line under the processing copy, for flows that block closing. */
  processingNote?: string;
  target?: AITargetKey | null;
  mode?: string | null;
  /**
   * Which call is in flight. Absent for every single-call run, which is
   * what leaves this view's default behaviour exactly what it was — `AIImportModal`
   * passes none of the three props below and is unchanged.
   */
  runStage?: AIRunStage | null;
  coverLetterOutcome?: CoverLetterOutcome | null;
  /** Re-runs call 2 alone. Offered only on a failure a retry can clear. */
  onCoverLetterRetry?: () => void;
}

/**
 * The status router both AI modals render.
 * ⚠️ One shared view, never one per modal.
 */
export const AIStatusView: React.FC<AIStatusViewProps> = ({
  status,
  errorMessage,
  onRetry,
  onBack,
  onSuccess,
  changeDetails,
  successTitle,
  successDescription,
  processingNote,
  target,
  mode,
  runStage,
  coverLetterOutcome,
  onCoverLetterRetry,
}) => {
  const { t } = useTranslation();

  const confirmOutcome = (outcome: 'success' | 'no_changes') => {
    analytics.track(ANALYTICS_EVENTS.AI_SUGGESTION_CONFIRMED, {
      status: outcome,
      mode: mode || null,
      ...(outcome === 'success'
        ? {
            itemsCount: changeDetails?.itemsCount,
            reorgCount: changeDetails?.reorgCount,
          }
        : {}),
      ...getAITrackingParams(target),
    });
    onSuccess?.();
  };

  const letterFailed = coverLetterPresentation(coverLetterOutcome) === 'sentence';
  /**
   * ⚠️ Two sentences, because the cost differs. A two-call run spent one of the
   * day's requests on the CV; a letter-only re-run tailored nothing and spent
   * nothing — a failed letter is never billed — so the "only one of today's
   * requests was used" clause is simply false there.
   */
  const letterFailedCopy =
    runStage && !runStage.twoStep
      ? t('ai.status.cover_letter_failed_retry')
      : t('ai.status.cover_letter_failed');
  const canRetryLetter = Boolean(
    letterFailed && coverLetterOutcome?.retryable && onCoverLetterRetry,
  );

  if (status === 'processing') {
    return <AIStatusProcessing runStage={runStage} processingNote={processingNote} />;
  }

  if (status === 'no_changes') {
    return (
      <div className="space-y-4">
        <StatePanel variant="success" title={t('ai.reorg_unchanged')} announce />
        {onSuccess && (
          <Button onClick={() => confirmOutcome('no_changes')} variant="primary" className="w-full">
            {t('common.continue')}
          </Button>
        )}
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="space-y-4">
        {/*
          ⚠️ A letter failure REPLACES the success description rather than
          adding a card. The outcome cards below are not announced, and
          `StatePanel` announces its title and string description — so a card
          would leave a screen reader with "Optimized! Your content has been
          successfully improved." and no mention that the letter failed, which
          is "saying nothing afterwards is dishonest" reproduced for exactly the
          users who cannot see the card.

          The variant and title stay `success`: the tailoring is what the user
          came for, it is applied, and the failure sentence itself opens by
          saying so. A letter failure is a notice on a SUCCESSFUL outcome.
        */}
        <StatePanel
          variant="success"
          title={successTitle || t('ai.status.success_title')}
          description={
            letterFailed ? letterFailedCopy : successDescription || t('ai.status.success_desc')
          }
          action={
            canRetryLetter ? (
              <Button
                onClick={() => {
                  analytics.track(ANALYTICS_EVENTS.AI_COVER_LETTER_RETRY, {
                    error: coverLetterOutcome?.error || null,
                    mode: mode || null,
                    ...getAITrackingParams(target),
                  });
                  onCoverLetterRetry?.();
                }}
                variant="secondary"
              >
                {/* ⚠️ Names the letter, not just the action. The error branch's
                    own retry renders as `common.retry`, so a screen-reader user
                    on a buttons-only rotor would hear the same "Retry" for two
                    different runs — one re-tailors the whole CV. */}
                {t('ai.status.cover_letter_retry')}
              </Button>
            ) : undefined
          }
          announce
        />

        <AIStatusOutcomeCards
          changeDetails={changeDetails}
          coverLetterOutcome={coverLetterOutcome}
        />

        {onSuccess && (
          <Button onClick={() => confirmOutcome('success')} variant="primary" className="w-full">
            {t('common.continue')}
          </Button>
        )}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-4">
        <StatePanel
          variant="error"
          title={t('ai.status.error_title')}
          description={errorMessage || t('common.error_occurred')}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          {onRetry && (
            <Button
              onClick={() => {
                analytics.track(ANALYTICS_EVENTS.AI_SUGGESTION_ERROR_RETRY, {
                  mode: mode || null,
                  ...getAITrackingParams(target),
                });
                onRetry();
              }}
              variant="primary"
              className="flex-1"
            >
              {t('common.retry')}
            </Button>
          )}
          <Button
            onClick={() => {
              analytics.track(ANALYTICS_EVENTS.AI_SUGGESTION_ERROR_BACK, {
                mode: mode || null,
                ...getAITrackingParams(target),
              });
              onBack?.();
            }}
            variant="secondary"
            className="flex-1"
          >
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
