import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { DialogFrame, DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { disconnectGitHub } from '@/hooks/sync/disconnectGitHub';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { hasStoredGitHubCreds } from '@/services/storage/githubStorage';
import { useToastStore } from '@/store/ui/useToastStore';
import { Trash2, TriangleAlert } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const { t, formatUIDate } = useTranslation();
  const { user, session, profile, signOut } = useAuth();
  const addToast = useToastStore((state) => state.addToast);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // The token is device-bound, so the offer appears only when one is stored,
  // and starts ticked: deletion is the clearest "I'm leaving". It and
  // the consent are reset on each opening, since the modal stays mounted.
  const [hasGitHubToken, setHasGitHubToken] = useState(() => isOpen && hasStoredGitHubCreds());
  const [removeGitHub, setRemoveGitHub] = useState(true);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setHasGitHubToken(hasStoredGitHubCreds());
      setRemoveGitHub(true);
      setIsConfirmed(false);
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      analytics.track(ANALYTICS_EVENTS.ACCOUNT_DELETE_MODAL_OPENED);
    }
  }, [isOpen]);

  const handleCancel = () => {
    if (!isDeleting) {
      analytics.track(ANALYTICS_EVENTS.ACCOUNT_DELETE_CANCELLED);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!user || !isConfirmed) return;

    setIsDeleting(true);
    try {
      // The account to delete is resolved server-side from this token. Sending
      // an id in the body would be the whole authorization story on an endpoint
      // that holds the service-role key.
      const response = await fetch('/.netlify/functions/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      // Only once the account is gone: a failed deletion leaves the user here,
      // still syncing, so the token stays with them. The deletion has happened,
      // so a storage failure here must not report it as failed.
      if (hasGitHubToken && removeGitHub) {
        try {
          disconnectGitHub();
        } catch (error: unknown) {
          console.error('Removing the GitHub connection failed:', error);
        }
      }

      analytics.track(ANALYTICS_EVENTS.ACCOUNT_DELETE_COMPLETED);
      addToast(t('account.modals.delete_account.success_message'), 'success');

      // Close modal immediately and then sign out
      onClose();
      await signOut(false);
    } catch (error: unknown) {
      console.error('Delete account failed:', error);
      addToast(t('account.modals.delete_account.error_message'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DialogFrame
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
      // While the deletion is in flight, block Escape and the close button —
      // matching the old handleCancel `!isDeleting` guard on both paths.
      busy={isDeleting}
      maxWidth="lg"
      zIndexClassName="z-[120]"
      header={
        <div className="p-6 pr-14 pb-0">
          <DialogFrameTitle className="text-destructive flex items-center gap-2 text-lg font-bold sm:text-xl">
            <Trash2 className="h-6 w-6" aria-hidden="true" />
            {t('account.modals.delete_account.title')}
          </DialogFrameTitle>
        </div>
      }
    >
      <div className="space-y-6 p-6 pt-4">
        <div className="bg-destructive/10 text-destructive flex items-start gap-4 rounded-xl p-4">
          <TriangleAlert className="h-6 w-6 shrink-0" aria-hidden="true" />
          <DialogFrameDescription className="text-sm leading-relaxed font-medium">
            {t('account.modals.delete_account.description')}
          </DialogFrameDescription>
        </div>

        <div className="space-y-3">
          {profile?.premium_until && (
            <div className="text-muted-foreground text-sm font-semibold italic">
              •{' '}
              {t('account.modals.delete_account.premium_warning', {
                date: formatUIDate(profile.premium_until),
              })}
            </div>
          )}
        </div>

        {hasGitHubToken && (
          <label className="border-border flex cursor-pointer items-start gap-3 rounded-lg border p-4">
            <input
              type="checkbox"
              checked={removeGitHub}
              onChange={(e) => setRemoveGitHub(e.target.checked)}
              className="text-primary-strong focus:ring-primary-strong border-input mt-1 h-4 w-4 rounded"
            />
            <span className="text-sm leading-tight">
              {t('account.modals.delete_account.remove_github')}
            </span>
          </label>
        )}

        <label className="border-border bg-accent/30 hover:bg-accent/50 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="text-destructive focus:ring-destructive border-input mt-1 h-4 w-4 rounded"
          />
          <span className="text-sm leading-tight font-bold">
            {t('account.modals.delete_account.consent_label')}
          </span>
        </label>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <Button variant="secondary" onClick={handleCancel} className="rounded-xl sm:flex-1">
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={!isConfirmed}
            // The consent label is the reason: without it the button explains
            // nothing, and a natively disabled button cannot be asked why.
            disabledReason={t('account.modals.delete_account.consent_label')}
            loading={isDeleting}
            loadingLabel={`${t('common.deleting')}...`}
            className="rounded-xl sm:flex-[2]"
          >
            {t('account.modals.delete_account.confirm_btn')}
          </Button>
        </div>
      </div>
    </DialogFrame>
  );
};
