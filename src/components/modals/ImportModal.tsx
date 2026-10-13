import React from 'react';
import { useNavigate } from 'react-router-dom';

import { AIImportView } from '@/components/modals/ai/import/AIImportModal';
import { ImportChoiceStep } from '@/components/modals/import/ImportChoiceStep';
import { DialogFrame, DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { useImportModalStore } from '@/store/ui/useImportModalStore';
import { useToastStore } from '@/store/ui/useToastStore';
import { importResume } from '@/utils/importResume';
import { localizedPath } from '@/utils/localeRouting';
import { cleanJsonText } from '@/utils/validation';

export const ImportModal: React.FC = () => {
  const { isOpen, step, close, setStep } = useImportModalStore();
  const { user } = useAuth();
  const setResume = useResumeStore((state) => state.setResume);
  const { t, language } = useTranslation();
  const addToast = useToastStore((state) => state.addToast);
  const importStep = useFlowStore((state) => state.import.step);
  const navigate = useNavigate();
  const lang = useLanguage();

  const handleSuccessNavigation = () => {
    navigate(localizedPath(lang, `/dashboard?tab=editor`));
  };

  const handleConnectGoogle = () => {
    const modalSource = useImportModalStore.getState().source;
    const dynamicSource =
      modalSource === 'landing'
        ? 'import_after_tour'
        : modalSource === 'editor'
          ? 'import_editor'
          : modalSource === 'raw_json'
            ? 'import_raw_json'
            : 'import';

    useFlowStore.getState().openGoogleLogin({
      description: t('auth.welcome_subtitle'),
      source: dynamicSource,
      allowGitHub: false,
    });
  };

  const handleClose = () => {
    // Track abandonment if closing while in AI style selection step
    const importState = useFlowStore.getState().import;
    if (importState.step === 'style' && importState.fileName) {
      const format =
        importState.fileType === 'application/pdf'
          ? 'pdf'
          : importState.fileType ===
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ? 'docx'
            : 'text';

      analytics.track(ANALYTICS_EVENTS.AI_IMPORT_ABANDONED, {
        format,
        source: 'import_modal',
      });
    }
    close();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) throw new Error('Empty file');
        const cleanContent = cleanJsonText(content);
        const json = JSON.parse(cleanContent);

        // Basic validation: must be an object
        if (typeof json !== 'object' || Array.isArray(json) || json === null) {
          throw new Error('Not an object');
        }

        const { warnings } = await importResume(setResume, json, { clearAI: true });

        // ⚠️ Was `skippedSkills === 0 && warnings.length === 0`.
        // `skippedSkills` was always `0`, so the first conjunct was a constant and
        // this toast was never gated on it — deleting it changes nothing the user
        // sees. Warnings are still the sole reason to withhold the success toast.
        if (warnings.length === 0) {
          addToast(t('welcome.import_success'), 'success');
        }

        analytics.track(ANALYTICS_EVENTS.CV_IMPORTED_MANUAL, {
          method: 'file',
          format: 'json',
          source: 'import_modal',
          language,
        });

        handleClose();
        handleSuccessNavigation();
      } catch (err) {
        console.error('Invalid JSON', err);
        addToast(t('welcome.import_error'), 'error');
      }
    };
    reader.readAsText(file);
  };

  const isProcessing = (step as string) === 'import_ai' && importStep === 'processing';

  return (
    <DialogFrame
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      // AI extraction in flight: blocks Escape, and the close button goes busy
      // rather than unmounting.
      busy={isProcessing}
      maxWidth="xl"
      zIndexClassName="z-[70]"
      // The visible heading belongs to a step that is not always rendered, and
      // the AI step brings its own, so the name is attached sr-only instead.
      header={
        <>
          <DialogFrameTitle className="sr-only">{t('welcome.title_import')}</DialogFrameTitle>
          <DialogFrameDescription className="sr-only">
            {t('welcome.tagline')}
          </DialogFrameDescription>
        </>
      }
    >
      <div className="custom-scrollbar flex-1 overflow-y-auto p-6 sm:p-8">
        {step !== 'import_ai' && (
          <div className="mb-6 text-center sm:mb-8">
            <h2 className="text-foreground px-12 text-2xl font-extrabold tracking-tight">
              {t('welcome.title_import')}
            </h2>
          </div>
        )}

        {/* ⚠️ No `min-h`. A `min-h-[300px]` sat here from early on with no reason
            recorded, and once the choice step lost its back button the two
            cards no longer reached it — leaving ~70px of dead space under them.
            The AI step is taller than this on its own, so the floor was only
            ever padding the shorter step. */}
        <div>
          {step === 'import_choice' && (
            <ImportChoiceStep
              t={t}
              isLoggedIn={!!user}
              onLoginRequired={handleConnectGoogle}
              onFileUpload={handleFileUpload}
              setStep={setStep}
            />
          )}

          {(step as string) === 'import_ai' && (
            <AIImportView
              showTitle={true}
              onBack={() => setStep('import_choice')}
              onSuccess={() => {
                handleClose();
                handleSuccessNavigation();
              }}
            />
          )}
        </div>
      </div>
    </DialogFrame>
  );
};
