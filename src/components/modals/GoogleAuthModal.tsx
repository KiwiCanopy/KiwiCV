import React, { useEffect } from 'react';

import { AuthView } from '@/components/auth/AuthView';
import { DialogFrame } from '@/components/ui/DialogFrame';
import { useAuth } from '@/hooks/useAuth';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { anchorById } from '@/utils/focus';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  description?: string;
  allowGHAlternative?: boolean;
  onSelectGH?: () => void;
}

/**
 * A premium modal that prompts the user to sign in with Google.
 * Features a persuasive "Value Proposition" dual-pane layout via AuthView.
 */
export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  description,
  allowGHAlternative,
  onSelectGH,
}) => {
  const { user, loading } = useAuth();
  const requireDrive = useFlowStore((state) => state.auth.requireDrive);
  /**
   * Read here rather than drilled from `MainLayoutOverlays`, exactly as
   * `requireDrive` above is. As an optional prop it could be omitted by a second
   * renderer and would silently break focus restoration; the store cannot be
   * forgotten. `DialogFrame` snapshots it at open, so `resetAuth()` clearing it
   * during close does not matter.
   */
  const restoreFocusToId = useFlowStore((state) => state.auth.restoreFocusToId);

  // Safety: Reset flags if auth loading finishes and we are still not logged in
  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.removeItem('google_oauth_in_progress');
    }
  }, [loading, user]);

  return (
    <DialogFrame
      open={isOpen}
      onOpenChange={onClose}
      restoreFocusTo={restoreFocusToId ? anchorById(restoreFocusToId) : undefined}
      maxWidth="4xl"
      zIndexClassName="z-[150]"
      // AuthView owns the whole surface, dual-pane and flush to the edges, so
      // there is no title row of its own. An empty header still selects the
      // flush layout, which positions the close button absolutely over
      // AuthView rather than inline in a header.
      //
      // The name comes from AuthView's own visible heading via
      // `ownsDialogTitle`. It used to be an sr-only DialogFrameTitle here,
      // which named the dialog with a hidden second copy of the string
      // AuthView already renders — the duplication DialogFrameTitle's contract
      // rules out, and the same defect that was fixed in PricingDialog.
      header={<></>}
    >
      <AuthView
        variant="modal"
        ownsDialogTitle
        description={description}
        allowGHAlternative={allowGHAlternative}
        requireDrive={requireDrive}
        onSelectGH={() => {
          onClose();
          onSelectGH?.();
        }}
      />
    </DialogFrame>
  );
};
