import React, { useEffect } from 'react';

import { LocaleSelect } from '@/components/ui/LocaleSelect';
import { useTranslation } from '@/hooks/useTranslation';
import { type LocaleCode } from '@/locales';
import { getAlternateLanguage, translationTargets } from '@/utils/ai';
import { cn } from '@/utils/cn';

interface AIEditTranslationConfigProps {
  translateToAnotherLanguage: boolean;
  setTranslateToAnotherLanguage: (value: boolean) => void;
  targetLang: LocaleCode;
  setTargetLang: (value: LocaleCode) => void;
  /**
   * The language the CV is currently in, excluded from the target list. Empty
   * when the source is a language KiwiCV does not ship an interface for (the
   * import flow's "other"): nothing to exclude, every target is valid.
   */
  cvLanguage: LocaleCode | '';
  isTranslationMode: boolean;
  /** Id of a reason the run is refused for, read out with the toggle. */
  describedBy?: string;
}

export const AITranslationConfig: React.FC<AIEditTranslationConfigProps> = ({
  translateToAnotherLanguage,
  setTranslateToAnotherLanguage,
  targetLang,
  setTargetLang,
  cvLanguage,
  isTranslationMode,
  describedBy,
}) => {
  const { t } = useTranslation();

  // Keep the target language valid whenever translation is enabled. In the
  // import flow it starts as '' (no selection), so relying on the checkbox
  // onChange alone leaves the state empty while the select visually shows the
  // first option — and the submit button stays disabled. This also re-picks a
  // valid target if the CV/source language later changes to the current target.
  useEffect(() => {
    if (
      translateToAnotherLanguage &&
      !isTranslationMode &&
      (!targetLang || targetLang === cvLanguage)
    ) {
      setTargetLang(getAlternateLanguage(cvLanguage));
    }
  }, [translateToAnotherLanguage, isTranslationMode, targetLang, cvLanguage, setTargetLang]);

  return (
    <div
      className={cn(
        'bg-muted/30 border-border/50 flex items-start gap-3 rounded-2xl border p-4 transition-all select-none',
        isTranslationMode && 'cursor-not-allowed opacity-80',
      )}
    >
      <input
        type="checkbox"
        id="translate-cv-toggle"
        className="accent-primary focus:ring-primary-strong/20 mt-1 h-4 w-4 shrink-0 rounded border-gray-300 transition-all"
        checked={translateToAnotherLanguage}
        disabled={isTranslationMode}
        aria-describedby={describedBy}
        onChange={(e) => setTranslateToAnotherLanguage(e.target.checked)}
      />
      <div className="flex-1 space-y-1.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label
            htmlFor="translate-cv-toggle"
            className="text-foreground cursor-pointer text-sm font-semibold"
          >
            {t('ai.translate_toggle_label')}
          </label>

          {translateToAnotherLanguage && (
            <LocaleSelect
              label={t('ai.translate_toggle_label')}
              showLabel={false}
              value={targetLang}
              disabled={isTranslationMode}
              onValueChange={(language) => language && setTargetLang(language)}
              localeCodes={translationTargets(
                cvLanguage,
                isTranslationMode ? targetLang : undefined,
              )}
              wrapperClassName="min-w-48"
              className="py-2"
            />
          )}
        </div>
      </div>
    </div>
  );
};
