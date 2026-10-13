import { ContactModal } from '@/components/modals/ContactModal';
import { DeleteAccountModal } from '@/components/modals/DeleteAccountModal';
import { GlobalImportWarningsModal } from '@/components/modals/GlobalImportWarningsModal';
import { LanguageOnboardingModal } from '@/components/modals/LanguageOnboardingModal';
import { LegalUpdateModal } from '@/components/modals/LegalUpdateModal';
import { SyncWorkflowModals } from '@/components/modals/SyncWorkflowModals';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ToastContainer } from '@/components/ui/Toast';
import { useUIStore } from '@/store/ui/useUIStore';

function ContactModalWrapper() {
  const isOpen = useUIStore((state) => state.isContactModalOpen);
  const setOpen = useUIStore((state) => state.setContactModalOpen);

  return <ContactModal isOpen={isOpen} onClose={() => setOpen(false)} />;
}

function DeleteAccountModalWrapper() {
  const isOpen = useUIStore((state) => state.isDeleteModalOpen);
  const setOpen = useUIStore((state) => state.setDeleteModalOpen);

  return <DeleteAccountModal isOpen={isOpen} onClose={() => setOpen(false)} />;
}

export function GlobalOverlays() {
  return (
    <>
      <ToastContainer />
      <ConfirmModal />
      <SyncWorkflowModals />
      <GlobalImportWarningsModal />
      <ContactModalWrapper />
      <DeleteAccountModalWrapper />
      <LegalUpdateModal />
      <LanguageOnboardingModal />
    </>
  );
}
