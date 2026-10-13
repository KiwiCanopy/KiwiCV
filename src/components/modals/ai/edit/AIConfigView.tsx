import { useId } from 'react';

import { type AIEditContext } from '@/components/modals/ai/edit/types';
import { AICoverLetterControl } from '@/components/modals/ai/template/AICoverLetterControl';
import { AICustomPromptConfig } from '@/components/modals/ai/template/AICustomPromptConfig';
import { AIJobDescriptionConfig } from '@/components/modals/ai/template/AIJobDescriptionConfig';
import { AIPromotionalCard } from '@/components/modals/ai/template/AIPromotionalCard';
import { AIReorganizationControl } from '@/components/modals/ai/template/AIReorganizationControl';
import { AITranslationConfig } from '@/components/modals/ai/template/AITranslationConfig';
import { Button } from '@/components/ui/Button';
import { StatePanel } from '@/components/ui/StatePanel';
import { AI_PRO_DAILY_LIMIT } from '@/constants/ai';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { getAITrackingParams } from '@/utils/ai';

interface AIConfigViewProps {
  context: AIEditContext;
}

export const AIConfigView = ({ context }: AIConfigViewProps) => {
  const { t } = useTranslation();
  const tooLongReasonId = useId();
  const {
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
    setIsUpgradeModalOpen,
    setMonetizationMode,
    needsUpgrade,
    isResolvingUsage,
    isDailyLimitReached: limitReachedFromContext,
    isWholeCV,
    isLetterOnly,
    isReorgEligible,
    translationTooLong,
    allowReorg,
    setAllowReorg,
    isPremium,
    handleGenerate,
    activeTarget,
    isTranslationMode,
    coverLetter,
  } = context;

  const isDailyLimitReached =
    limitReachedFromContext ||
    (typeof window !== 'undefined' && localStorage.getItem('debug_ai_limit_reached') === 'true');

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 pt-2">
      {mode === 'job_description' && (
        <AIJobDescriptionConfig value={jobDescription} onChange={setJobDescription} />
      )}

      {/* ⚠️ Rendered only under `job_description`, exactly as the ad's textarea
          above it is — the opposite of the band, which keeps the tick on the
          strip and states the reason. In a dialog the mode is the whole screen,
          so a control for a different mode is noise rather than a lesson. */}
      {mode === 'job_description' && coverLetter.eligible && (
        <AICoverLetterControl
          id="ai-cover-letter"
          state={coverLetter}
          /* ⚠️ `sole` drops the tick, its label and the two-request price. All
             three are answers to "shall a letter ride along with my CV rewrite",
             and a letter-only run has not asked that question: the letter is the
             whole job, the tick is implied by having opened this dialog, and the
             price is one request, not two. Leaving the tick would offer to turn
             off the only thing the run does (owner, 2026-09-08). */
          variant={isLetterOnly ? 'sole' : 'card'}
        />
      )}

      {mode === 'custom' && (
        <AICustomPromptConfig value={customPrompt} onChange={setCustomPrompt} />
      )}

      {mode === 'professional' && <AIPromotionalCard type="professional" />}

      {mode === 'translate_close' && <AIPromotionalCard type="translate_close" />}

      {/* ⚠️ `!isLetterOnly`: translation is call 1's work, and a letter-only run
          has no call 1 to do it. Offered anyway it is a tick that silently does
          nothing — which is what shipped until 2026-09-08. */}
      {isWholeCV && !isLetterOnly && (
        <AITranslationConfig
          describedBy={translationTooLong ? tooLongReasonId : undefined}
          translateToAnotherLanguage={translateToAnotherLanguage}
          setTranslateToAnotherLanguage={setTranslateToAnotherLanguage}
          targetLang={targetLang}
          setTargetLang={setTargetLang}
          cvLanguage={cvLanguage}
          isTranslationMode={isTranslationMode}
        />
      )}

      {/* Skill Reorg Toggle — only for skills section or whole CV */}
      {/* ⚠️ `&& !isLetterOnly`, exactly like the translation gate above rather
          than folded into `isReorgEligible` — that value is a property of the
          TARGET and the composer bar reads it on another surface. */}
      {isReorgEligible && !isLetterOnly && (
        <AIReorganizationControl
          id="allow-reorg"
          checked={allowReorg}
          onCheckedChange={setAllowReorg}
          sectionName={t('editor.sections.skills')}
        />
      )}

      {/* Limit Reached UI - Only for Pro users who exhausted their limit */}
      {isPremium && isResolvingUsage && (
        <StatePanel variant="loading" title={t('common.loading')} announce />
      )}

      {isDailyLimitReached && (
        <StatePanel
          variant="warning"
          title={t('ai.limit_reached_title')}
          description={t('ai.limit_reached_desc', { limit: AI_PRO_DAILY_LIMIT })}
        />
      )}

      <div className="flex flex-col gap-3 pt-6 sm:pt-8">
        <Button
          onClick={() => {
            if (needsUpgrade) {
              setMonetizationMode(isDailyLimitReached ? 'limit' : 'generic');
              analytics.track(ANALYTICS_EVENTS.AI_PAYWALL_SHOWN, {
                mode,
                reason: isDailyLimitReached ? 'daily_limit' : 'generic',
                ...getAITrackingParams(activeTarget),
              });
              setIsUpgradeModalOpen(true);
              return;
            }
            analytics.track(ANALYTICS_EVENTS.AI_SUGGESTION_REQUESTED, {
              mode,
              isPremium,
              ...getAITrackingParams(activeTarget),
            });
            handleGenerate();
          }}
          disabled={
            isLoading ||
            isResolvingUsage ||
            (mode === 'job_description' && !jobDescription.trim()) ||
            (mode === 'custom' && !customPrompt.trim()) ||
            // Chosen "my writing style" with nothing pasted: the letter cannot
            // honour the choice, so nothing is spent on one that would not.
            (coverLetter.enabled && coverLetter.needsSample) ||
            translationTooLong
          }
          // The inner id lets the translation toggle point at the same sentence.
          disabledReason={
            translationTooLong ? (
              <span id={tooLongReasonId}>{t('ai.translate_too_long')}</span>
            ) : undefined
          }
          loading={isLoading || isResolvingUsage}
          loadingLabel={isResolvingUsage ? t('common.loading') : t('ai.optimizing')}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {/* ⚠️ A letter-only run names the letter. "Improve with AI" is the
              label of the generic config screen, and this dialog is not that
              any more — it has one job and the button should say it.

              Borrowed from the Cover Letter section's own empty state, which
              already carries this exact sentence for this exact action in all
              fifteen locales; a new key would be fourteen fresh translations
              for a string that already exists. `i18n:check` fails if the
              empty state ever drops it.

              Two `t()` calls, not one with the key chosen inside: `i18n:check`
              rejects a computed key it cannot read out of the source. */}
          <span>{isLetterOnly ? t('editor.coverLetter.empty_title') : t('ai.suggest')}</span>
        </Button>

        {/* ⚠️ Absent on a letter-only run, which has nowhere to go back TO.
            `setMode(null)` returns to the CV action cards, and picking anything
            there leaves `job_description` — at which point the request builder
            returns `null` and `useAIGeneration` bails on a bare `return` before
            any POST, i.e. a primary button that does nothing at all and logs
            nothing.

            ⚠️ NOT the worker's `MISSING_PARAMS`, which an earlier version of
            this comment named: the client guard returns first, so that
            rejection is unreachable from here and someone weighing whether to
            restore Back would have priced it against a failure they could see
            logged (code-reviewer, 2026-09-08). The dialog has one purpose; the
            frame's own close is the way out. */}
        {!isLetterOnly && (
          <Button onClick={() => setMode(null)} variant="quiet" className="w-full">
            {t('common.back')}
          </Button>
        )}
      </div>
    </div>
  );
};
