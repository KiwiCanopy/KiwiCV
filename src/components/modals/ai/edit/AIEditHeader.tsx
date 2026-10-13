import { type AIEditContext } from '@/components/modals/ai/edit/types';
import { AICompactHeader } from '@/components/modals/ai/template/AICompactHeader';
import { DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { sectionLabelKey } from '@/features/dashboard/editor/rail/railSections';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { parseAITarget } from '@/utils/aiTarget';
import { customSectionDisplayTitle, findCustomSection } from '@/utils/layout/customSections';
import { Sparkles } from 'lucide-react';

interface AIEditHeaderProps {
  context: AIEditContext;
}

export const AIEditHeader = ({ context }: AIEditHeaderProps) => {
  const { t } = useTranslation();
  const { mode, activeTarget, isTranslationMode, targetLang } = context;
  // A custom section is named by its own heading, never by its token.
  const customSection = useResumeStore((state) =>
    findCustomSection(state.resume, parseAITarget(activeTarget ?? '').sectionKey),
  );

  if (!mode) {
    const { type, sectionKey: id } = parseAITarget(activeTarget ?? '');
    const labelKey = sectionLabelKey(id);
    const sectionName = customSection
      ? customSectionDisplayTitle(customSection, t('common.untitled'))
      : labelKey
        ? t(labelKey)
        : id || t('ai.modal_title');

    return (
      <div className="flex flex-col items-center px-6 pt-10 pb-2 text-center sm:pt-12">
        <div className="bg-muted text-primary-strong mb-5 flex h-14 w-14 items-center justify-center rounded-xl sm:h-16 sm:w-16">
          <Sparkles className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
        </div>

        <DialogFrameTitle className="text-foreground text-2xl font-semibold tracking-tight">
          {isTranslationMode
            ? t('ai.translate_modal_title', {
                language: t(`languages.${targetLang}`),
              })
            : activeTarget === 'cv' || !activeTarget
              ? t('ai.modal_title')
              : type === 'section'
                ? t('ai.optimize_section', { section: sectionName })
                : t('ai.optimize_item')}
        </DialogFrameTitle>

        {activeTarget && activeTarget !== 'cv' && (
          <DialogFrameDescription className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
            {type === 'section'
              ? t('ai.target_section_desc')
              : t('ai.target_item_context', { section: sectionName })}
          </DialogFrameDescription>
        )}
      </div>
    );
  }

  return (
    <AICompactHeader
      mode={mode}
      title={
        mode === 'job_description'
          ? t('ai.mode_job')
          : mode === 'custom'
            ? t('ai.mode_custom')
            : mode === 'professional'
              ? t('ai.mode_professional')
              : t('ai.mode_translate_close')
      }
      subtitle={t('ai.ai_assistant')}
      borderClass="border-b border-border"
      isDialogTitle={true}
    />
  );
};
