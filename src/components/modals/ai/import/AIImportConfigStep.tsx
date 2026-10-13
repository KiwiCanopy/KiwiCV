import {
  hasImportSourceLanguage,
  isOtherSourceLanguage,
} from '@/components/modals/ai/import/sourceLanguage';
import { type AIImportContext } from '@/components/modals/ai/import/useAIImport';
import { AICustomPromptConfig } from '@/components/modals/ai/template/AICustomPromptConfig';
import { AIJobDescriptionConfig } from '@/components/modals/ai/template/AIJobDescriptionConfig';
import { AIPromotionalCard } from '@/components/modals/ai/template/AIPromotionalCard';
import { AIReorganizationControl } from '@/components/modals/ai/template/AIReorganizationControl';
import { AITranslationConfig } from '@/components/modals/ai/template/AITranslationConfig';
import { Button } from '@/components/ui/Button';
import { StatePanel } from '@/components/ui/StatePanel';
import { AI_PRO_DAILY_LIMIT } from '@/constants/ai';
import { useTranslation } from '@/hooks/useTranslation';
import { type LocaleCode } from '@/locales';
import { cn } from '@/utils/cn';

interface AIImportConfigStepProps {
  context: AIImportContext;
}

export function AIImportConfigStep({ context }: AIImportConfigStepProps) {
  const { t } = useTranslation();
  const {
    activeStyle,
    setActiveStyle,
    customInstructions,
    setCustomInstructions,
    handleParse,
    isStarting,
    allowReorg,
    setAllowReorg,
    sourceLanguage,
    sourceLanguageOther,
    targetLanguage,
    setTargetLanguage,
    isTranslationEnabled,
    setIsTranslationEnabled,
    isDailyLimitReached,
  } = context;
  const isLanguageSelected = hasImportSourceLanguage(sourceLanguage, sourceLanguageOther);

  if (!activeStyle) return null;

  const reorganizationControlId =
    activeStyle === 'professional'
      ? 'allow-reorg-import'
      : activeStyle === 'job_description'
        ? 'allow-reorg-import-jd'
        : `allow-reorg-import-${activeStyle}`;

  const translationConfig = (
    <AITranslationConfig
      translateToAnotherLanguage={isTranslationEnabled}
      setTranslateToAnotherLanguage={setIsTranslationEnabled}
      targetLang={targetLanguage as LocaleCode}
      setTargetLang={setTargetLanguage as (language: LocaleCode) => void}
      // A CV in an unsupported language excludes nothing from the target list.
      cvLanguage={isOtherSourceLanguage(sourceLanguage) ? '' : (sourceLanguage as LocaleCode)}
      isTranslationMode={false}
    />
  );
  const reorganizationControl = (
    <AIReorganizationControl
      id={reorganizationControlId}
      checked={allowReorg}
      onCheckedChange={setAllowReorg}
      sectionName={t('editor.sections.skills')}
    />
  );
  const needsInstructions = activeStyle === 'job_description' || activeStyle === 'custom';
  const isStartDisabled =
    !isLanguageSelected ||
    (isTranslationEnabled && !targetLanguage) ||
    (needsInstructions && !customInstructions.trim());

  return (
    <div className="space-y-6">
      {isDailyLimitReached && (
        <StatePanel
          variant="warning"
          title={t('ai.limit_reached_title')}
          description={t('ai.limit_reached_desc', { limit: AI_PRO_DAILY_LIMIT })}
        />
      )}

      {activeStyle === 'professional' && <AIPromotionalCard type="professional" />}
      {activeStyle === 'literal' && <AIPromotionalCard type="literal" />}
      {activeStyle === 'job_description' && (
        <AIJobDescriptionConfig value={customInstructions} onChange={setCustomInstructions} />
      )}
      {activeStyle === 'custom' && (
        <AICustomPromptConfig value={customInstructions} onChange={setCustomInstructions} />
      )}

      {translationConfig}
      {reorganizationControl}

      <div className="mt-8 space-y-3">
        <Button
          onClick={() => handleParse(activeStyle)}
          disabled={isStartDisabled}
          loading={isStarting}
          variant="primary"
          size="lg"
          className={cn('w-full', activeStyle === 'professional' && 'text-base')}
        >
          {t('ai.import_start')}
        </Button>
        <Button onClick={() => setActiveStyle(null)} variant="quiet" className="w-full">
          {t('common.back')}
        </Button>
      </div>
    </div>
  );
}
