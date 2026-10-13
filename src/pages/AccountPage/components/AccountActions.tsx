import React from 'react';

import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { ExternalLink, LogOut, ShieldCheck, Trash2 } from 'lucide-react';

interface AccountActionsProps {
  handleSignOut: () => void;
  isSigningOut: boolean;
  setIsDeleteModalOpen: (v: boolean) => void;
  localizedPath: (path: string) => string;
}

export const AccountActions: React.FC<AccountActionsProps> = ({
  handleSignOut,
  isSigningOut,
  setIsDeleteModalOpen,
  localizedPath,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 md:col-span-4">
      {/* Security / Legal Sidebar */}
      <div className="bg-card border-border rounded-2xl border p-6 shadow-sm">
        <h3 className="text-muted-foreground mb-4 flex items-center gap-2 text-[11px] font-extrabold tracking-wider uppercase">
          <ShieldCheck className="h-3.5 w-3.5" />
          {t('account.security_privacy')}
        </h3>
        <nav className="space-y-1">
          <button
            onClick={() => window.open(localizedPath('/privacy'), '_blank')}
            className="hover:bg-muted text-muted-foreground hover:text-foreground flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <span>{t('auth.privacy_link')}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-50" />
          </button>
          <button
            onClick={() => window.open(localizedPath('/terms?tab=terms'), '_blank')}
            className="hover:bg-muted text-muted-foreground hover:text-foreground flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <span>{t('auth.terms_link')}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-50" />
          </button>
        </nav>
      </div>

      {/* Logout Card */}
      <div className="bg-card border-border rounded-2xl border p-6 shadow-sm">
        {/* `loading` rather than `disabled`: the Button keeps a busy control in
            the accessibility tree with aria-busy and the loading label, where a
            natively disabled one would announce neither. */}
        <Button
          variant="secondary"
          onClick={handleSignOut}
          loading={isSigningOut}
          loadingLabel={t('common.loading')}
          className="w-full rounded-xl py-3 font-bold"
        >
          <LogOut className="h-4 w-4" />
          {t('common.logout')}
        </Button>

        <div className="border-border mt-6 border-t pt-6">
          <Button
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full rounded-xl py-3 text-xs font-bold whitespace-nowrap"
            title={t('account.modals.delete_account.title')}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t('auth.delete_account')}
          </Button>
        </div>
      </div>
    </div>
  );
};
