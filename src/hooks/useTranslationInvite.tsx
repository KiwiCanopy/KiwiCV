import { useState } from 'react';

import { TranslationInviteModal } from '@/components/modals/TranslationInviteModal';
import { useAIEntryGuard } from '@/hooks/useAIEntryGuard';
import type { LocaleCode } from '@/locales';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';

/**
 * Hook to manage the flow of inviting a user to translate their CV.
 * Handles the "Motivation Modal", Authentication, and AI access checks.
 */
export function useTranslationInvite() {
  const openTranslationModal = useResumeStore((state) => state.openTranslationModal);
  const { allowRun, modals: guardModals } = useAIEntryGuard('translation_invite');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [pendingTargetLang, setPendingTargetLang] = useState<LocaleCode | null>(null);

  /**
   * Primary entry point: show the premium invitation modal.
   */
  const inviteToTranslate = async (targetLang: LocaleCode) => {
    setPendingTargetLang(targetLang);
    setShowInviteModal(true);
  };

  /**
   * Handle the positive response from the premium modal.
   * Proceeds to Auth and AI access checks.
   */
  const handleConfirmInvite = () => {
    setShowInviteModal(false);
    if (!pendingTargetLang) return;
    if (!allowRun()) return;

    // A translation keeps the CV's structure unless the user asks otherwise; the
    // modal's `resetPrompt` on close restores the default (#57).
    useFlowStore.getState().setAllowReorg(false);
    openTranslationModal(pendingTargetLang);
  };

  /**
   * Render the necessary modals.
   * These should be placed at the root of the component using the hook.
   */
  const modals = (
    <>
      <TranslationInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onConfirm={handleConfirmInvite}
      />
      {guardModals}
    </>
  );

  return { inviteToTranslate, modals };
}
