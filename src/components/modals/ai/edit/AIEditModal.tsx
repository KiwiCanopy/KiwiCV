import { useEffect, useRef } from 'react';

import { InsufficientPremiumAccessModal } from '@/components/modals/InsufficientPremiumAccessModal';
import { AIConfigView } from '@/components/modals/ai/edit/AIConfigView';
import { AIEditHeader } from '@/components/modals/ai/edit/AIEditHeader';
import { AISelectionView } from '@/components/modals/ai/edit/AISelectionView';
import { useAIEdit } from '@/components/modals/ai/edit/useAIEdit';
import { AIModalTemplate } from '@/components/modals/ai/template/AIModalTemplate';
import { AIStatusView } from '@/components/modals/ai/template/AIStatusView';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { cn } from '@/utils/cn';
import { aiDialogCloseAnchor } from '@/utils/focus';

export const AIEditModal = () => {
  const isOpen = useResumeStore((state) => state.ai.isModalOpen);

  if (!isOpen) return null;

  return <AIEditModalContent />;
};

const AIEditModalContent = () => {
  const { t } = useTranslation();
  const editContext = useAIEdit();
  const resetPrompt = useFlowStore((state) => state.resetPrompt);
  const setDraftCoverLetter = useFlowStore((state) => state.setDraftCoverLetter);
  const consumeAutoRun = useResumeStore((state) => state.consumeAutoRun);

  const {
    autoRun,
    mode,
    isLoading,
    status,
    setStatus,
    errorMessage,
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    monetizationMode,
    closeAIModal,
    resetState,
    handleGenerate,
  } = editContext;

  const autoRunFiredRef = useRef(false);
  useEffect(() => {
    if (!autoRun || autoRunFiredRef.current) return;
    autoRunFiredRef.current = true;
    handleGenerate();
  }, [autoRun, handleGenerate]);

  // ⚠️ Clears the store flag once the run is in flight, so the one-shot guard
  // survives a remount the local ref does not. Deliberately not at fire time:
  // `isAutoPending` below reads `autoRun` to hold the busy view through the
  // async gap before `status` becomes 'processing'.
  useEffect(() => {
    if (autoRun && status !== 'idle') consumeAutoRun();
  }, [autoRun, status, consumeAutoRun]);

  const isAutoPending = autoRun && status === 'idle';
  const isBusy = status === 'processing' || status === 'success' || isAutoPending;
  const preventClose = isLoading || status === 'processing' || isAutoPending;

  const handleClose = () => {
    if (preventClose) return;
    // ⚠️ `resetPrompt` deliberately leaves `draftCoverLetter` alone so the band
    // and this modal keep one source of truth. That is about a tick the
    // USER set; one KiwiCV pre-set must not outlive its own dialog, or the next
    // composer opened for something else arrives ticked.
    if (useResumeStore.getState().ai.presetCoverLetter) setDraftCoverLetter(false);
    closeAIModal();
    resetPrompt();
  };

  return (
    <AIModalTemplate
      isOpen={true}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      onClose={handleClose}
      preventClose={preventClose}
      title={t('ai.modal_title')}
      // Header hidden during processing/success/autoRun to block interaction.
      // It carries the dialog's name while shown, so the template only falls back to
      // its sr-only title in those states.
      header={!isBusy ? <AIEditHeader context={editContext} /> : undefined}
      headerOwnsTitle={!isBusy}
      // The composer's run button, the usual opener, unmounts during the run.
      restoreFocusTo={aiDialogCloseAnchor}
    >
      {/* Content */}
      <div
        className={cn(
          'custom-scrollbar flex-1 overflow-y-auto px-6 pt-2 pb-8 sm:px-12 sm:pt-4 sm:pb-10',
          preventClose && 'pointer-events-none',
        )}
      >
        {status !== 'idle' || isAutoPending ? (
          <AIStatusView
            status={status === 'idle' ? 'processing' : status}
            errorMessage={errorMessage}
            onRetry={handleGenerate}
            onCoverLetterRetry={editContext.handleCoverLetterRetry}
            runStage={editContext.runStage}
            coverLetterOutcome={editContext.coverLetterOutcome}
            onBack={() => setStatus('idle')}
            onSuccess={() => {
              closeAIModal();
              resetState();
            }}
            changeDetails={editContext.changeDetails}
            target={editContext.activeTarget}
            mode={mode}
          />
        ) : mode ? (
          <AIConfigView context={editContext} />
        ) : (
          <AISelectionView context={editContext} />
        )}
      </div>

      <InsufficientPremiumAccessModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        mode={monetizationMode}
      />
    </AIModalTemplate>
  );
};
