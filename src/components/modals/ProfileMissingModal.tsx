import React from 'react';

import { Button } from '@/components/ui/Button';
import { DialogFrame, DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { SUPPORT_EMAIL } from '@/constants/contact';
import { useTranslation } from '@/hooks/useTranslation';
import { CircleAlert, LogOut, Trash2 } from 'lucide-react';

interface ProfileMissingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  isSigningOut: boolean;
}

export const ProfileMissingModal: React.FC<ProfileMissingModalProps> = ({
  isOpen,
  onClose,
  onSignOut,
  onDeleteAccount,
  isSigningOut,
}) => {
  const { t } = useTranslation();

  const descriptionText = t('account.modals.profile_missing.description');
  const descriptionParts = descriptionText.split('{{email}}');

  return (
    <DialogFrame
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      maxWidth="lg"
      zIndexClassName="z-[90]"
      header={
        <DialogFrameTitle className="mb-6 flex items-center gap-2 px-6 pt-6 pr-14 text-lg font-black tracking-tight text-rose-600 sm:text-xl md:pr-16">
          <CircleAlert className="h-6 w-6" aria-hidden="true" />
          {t('account.modals.profile_missing.title')}
        </DialogFrameTitle>
      }
    >
      <div className="space-y-8 px-6 pb-6">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
          <DialogFrameDescription className="text-sm leading-relaxed font-bold">
            {descriptionParts[0]}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="underline decoration-rose-500/30 underline-offset-4 transition-colors hover:text-rose-600"
            >
              {SUPPORT_EMAIL}
            </a>
            {descriptionParts[1]}
          </DialogFrameDescription>
        </div>

        <div className="flex flex-col gap-4">
          {/* `loading` rather than `disabled`: a natively disabled button leaves
              the accessibility tree, so neither aria-busy nor the loading label
              would be announced. Same rule as AccountActions and DialogFrame. */}
          <Button
            variant="secondary"
            onClick={onSignOut}
            loading={isSigningOut}
            loadingLabel={t('common.loading')}
            size="lg"
            className="w-full rounded-2xl py-4 font-black"
          >
            <LogOut className="h-5 w-5" />
            {t('common.logout')}
          </Button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-rose-500/10" />
            <span className="text-[10px] font-black tracking-[0.2em] text-rose-500/40 uppercase">
              {t('common.or')}
            </span>
            <div className="h-px flex-1 bg-rose-500/10" />
          </div>

          <button
            type="button"
            onClick={onDeleteAccount}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-rose-500/20 py-3 text-xs font-black text-rose-500/60 transition-all hover:border-rose-500/40 hover:bg-rose-500/5 hover:text-rose-600 active:scale-[0.98]"
          >
            <Trash2 className="h-4 w-4 opacity-50 group-hover:opacity-100" />
            {t('auth.delete_account')}
          </button>
        </div>
      </div>
    </DialogFrame>
  );
};
