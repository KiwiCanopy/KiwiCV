import React from 'react';
import { useNavigate } from 'react-router-dom';

import { InsufficientPremiumAccessModal } from '@/components/modals/InsufficientPremiumAccessModal';
import { AIImportStyleStep } from '@/components/modals/ai/import/AIImportStyleStep';
import { AIImportUploadStep } from '@/components/modals/ai/import/AIImportUploadStep';
import { useAIImport } from '@/components/modals/ai/import/useAIImport';
import { AICompactHeader } from '@/components/modals/ai/template/AICompactHeader';
import { AIModalTemplate } from '@/components/modals/ai/template/AIModalTemplate';
import { AIStatusView } from '@/components/modals/ai/template/AIStatusView';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { localizedPath } from '@/utils/localeRouting';
import { ScanText } from 'lucide-react';

interface AIImportViewProps {
  onBack: () => void;
  onSuccess: () => void;
  showTitle?: boolean;
}

export const AIImportView: React.FC<AIImportViewProps> = ({
  onBack,
  onSuccess,
  showTitle = true,
}) => {
  const { t } = useTranslation();
  const context = useAIImport();
  const {
    activeStyle,
    closeUpgradeModal,
    errorMessage,
    handleFileChange,
    isUpgradeModalOpen,
    resetState,
    setStep,
    status,
    step,
    upgradeModalMode,
  } = context;

  const headerTitle =
    activeStyle === 'job_description'
      ? t('ai.mode_job')
      : activeStyle === 'custom'
        ? t('ai.mode_custom')
        : activeStyle === 'professional'
          ? t('ai.mode_professional')
          : activeStyle === 'literal'
            ? t('ai.import_style_literal')
            : t('ai.import_modal_title');

  return (
    <div className="p-0 sm:p-0">
      {showTitle && (
        <div className="mb-8">
          {step === 'upload' ? (
            <div className="text-center">
              <div className="bg-muted text-primary-strong mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl">
                <ScanText className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                {t('ai.import_modal_title')}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">{t('ai.import_modal_desc')}</p>
            </div>
          ) : (
            <AICompactHeader
              mode={activeStyle}
              title={headerTitle}
              subtitle={t('ai.ai_assistant')}
              borderClass="border-b border-border/50"
              marginClass="-mx-6 -mt-6 mb-8 sm:-mx-8 sm:-mt-8"
            />
          )}
        </div>
      )}

      {step === 'upload' && <AIImportUploadStep onFileDrop={handleFileChange} onBack={onBack} />}

      {step === 'style' && <AIImportStyleStep context={context} onBack={onBack} />}

      {step === 'processing' && (
        <AIStatusView
          status={status}
          errorMessage={errorMessage}
          successTitle={t('ai.status.import_success_title')}
          successDescription={t('ai.status.import_success_desc')}
          processingNote={t('ai.import_refresh_warning')}
          onRetry={() => setStep('style')}
          onBack={resetState}
          onSuccess={() => {
            onSuccess();
            resetState();
          }}
          target="cv"
          mode={activeStyle}
        />
      )}

      <InsufficientPremiumAccessModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        // ⚠️ Not hardcoded `generic`: a pass holder who has spent the day's
        // allowance must not be told to buy a pass they already hold.
        mode={upgradeModalMode}
      />
    </div>
  );
};

export const AIImportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const importStep = useFlowStore((state) => state.import.step);
  const resetImport = useFlowStore((state) => state.resetImport);
  const preventClose = importStep === 'processing';
  const navigate = useNavigate();
  const lang = useLanguage();

  const handleSuccessNavigation = () => navigate(localizedPath(lang, `/dashboard?tab=editor`));
  const handleClose = () => {
    if (preventClose) return;
    onClose();
    resetImport();
  };

  return (
    <AIModalTemplate
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      onClose={handleClose}
      preventClose={preventClose}
      // The import view's step headers are plain headings — they render outside
      // a dialog too, from ImportModal — so the template names this surface.
      title={t('ai.import_modal_title')}
    >
      <div className="custom-scrollbar flex-1 overflow-y-auto px-6 pt-2 pb-8 sm:px-12 sm:pt-4 sm:pb-10">
        <AIImportView
          onBack={handleClose}
          onSuccess={() => {
            handleClose();
            handleSuccessNavigation();
          }}
        />
      </div>
    </AIModalTemplate>
  );
};
