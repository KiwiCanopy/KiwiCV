import { AIImportConfigStep } from '@/components/modals/ai/import/AIImportConfigStep';
import {
  type ImportSourceLanguage,
  OTHER_SOURCE_LANGUAGE,
  hasImportSourceLanguage,
  isOtherSourceLanguage,
} from '@/components/modals/ai/import/sourceLanguage';
import { type AIImportContext } from '@/components/modals/ai/import/useAIImport';
import { AIActionCards } from '@/components/modals/ai/template/AIActionCards';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { LocaleSelect } from '@/components/ui/LocaleSelect';
import { AI_LANGUAGE_NAME_MAX_LENGTH } from '@/constants/ai';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { FileText, Languages, X } from 'lucide-react';

interface AIImportStyleStepProps {
  context: AIImportContext;
  onBack: () => void;
}

export function AIImportStyleStep({ context, onBack }: AIImportStyleStepProps) {
  const { t } = useTranslation();
  const {
    activeStyle,
    fileName,
    handleStyleSelect,
    resetState,
    setSourceLanguage,
    setSourceLanguageOther,
    sourceLanguage,
    sourceLanguageOther,
  } = context;
  const isOther = isOtherSourceLanguage(sourceLanguage);
  const isLanguageSelected = hasImportSourceLanguage(sourceLanguage, sourceLanguageOther);

  if (activeStyle) return <AIImportConfigStep context={context} />;

  return (
    <div className="space-y-4">
      <div className="border-border bg-muted/30 mb-6 flex items-center justify-between rounded-xl border px-4 py-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-primary/10 text-primary-strong flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-muted-foreground text-xs font-medium">
              {t('ai.import_file_selected')}
            </span>
            <span className="text-foreground truncate text-sm font-semibold">{fileName}</span>
          </div>
        </div>
        <IconButton
          onClick={resetState}
          label={t('ai.import_remove_file')}
          variant="quiet"
          className="hover:text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      </div>

      <div className="mb-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary-strong mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <Languages className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="cv-source-language-select"
                className="text-foreground text-sm font-semibold"
              >
                {t('ai.import_language_label')}
              </label>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {t('ai.import_language_desc')}
              </p>
            </div>
          </div>

          <LocaleSelect<typeof OTHER_SOURCE_LANGUAGE>
            id="cv-source-language-select"
            label={t('ai.import_language_label')}
            showLabel={false}
            value={sourceLanguage as ImportSourceLanguage}
            onValueChange={setSourceLanguage}
            extraOptions={[
              { value: OTHER_SOURCE_LANGUAGE, label: t('ai.import_language_other_option') },
            ]}
            placeholder={t('ai.import_language_placeholder')}
            className={cn('py-3', sourceLanguage ? 'text-foreground' : 'text-muted-foreground')}
          />

          {isOther && (
            <div className="space-y-2">
              <Input
                id="cv-source-language-other"
                label={t('ai.import_language_other_label')}
                value={sourceLanguageOther}
                onChange={(event) => setSourceLanguageOther(event.target.value)}
                placeholder={t('ai.import_language_other_placeholder')}
                maxLength={AI_LANGUAGE_NAME_MAX_LENGTH}
                autoComplete="off"
                aria-describedby="cv-source-language-other-hint"
                // Without this the value only lands on blur outside the HTML
                // view, so the action cards below stay disabled while the user
                // is still typing the language they just named.
                liveUpdate
              />
              <p
                id="cv-source-language-other-hint"
                className="text-muted-foreground text-xs leading-relaxed"
              >
                {t('ai.import_language_other_hint')}
              </p>
            </div>
          )}
        </div>
      </div>

      <AIActionCards
        onSelect={handleStyleSelect}
        showLiteral={true}
        disabled={!isLanguageSelected}
      />

      <Button
        onClick={() => {
          resetState();
          onBack();
        }}
        variant="quiet"
        className="mt-4 w-full"
      >
        {t('common.back')}
      </Button>
    </div>
  );
}
