import React from 'react';
import { SiGithub } from 'react-icons/si';

import { Button } from '@/components/ui/Button';
import { DialogFrame } from '@/components/ui/DialogFrame';
import { GoogleDriveIcon } from '@/components/ui/Icons';
import { OptionCard } from '@/components/ui/OptionCard';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { Cloud } from 'lucide-react';

interface SyncGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectGitHub: () => void;
  onConnectGoogle: () => void;
}

export const SyncGatewayModal: React.FC<SyncGatewayModalProps> = ({
  isOpen,
  onClose,
  onConnectGitHub,
  onConnectGoogle,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const handleGoogleClick = () => {
    setIsGoogleLoading(true);
    onConnectGoogle();
  };

  return (
    <DialogFrame
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      // While Google auth is in flight, block Escape and the close button — the
      // frame keeps the close button mounted and aria-busy rather than dropping it.
      busy={isGoogleLoading}
      maxWidth="2xl"
      zIndexClassName="z-[60]"
      icon={<Cloud className="h-6 w-6" />}
      title={t('sync.gateway_title')}
      description={t('sync.gateway_desc')}
      footer={
        <div className="text-center">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isGoogleLoading}
            className="w-full rounded-xl py-3 text-sm font-bold sm:w-auto sm:px-10"
          >
            {t('common.cancel')}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-3">
        <OptionCard
          onClick={onConnectGitHub}
          disabled={isGoogleLoading}
          title={t('sync.connect_github')}
          description={t('sync.connect_github_desc')}
          icon={<SiGithub className="h-7 w-7" />}
        />

        <OptionCard
          onClick={handleGoogleClick}
          disabled={isGoogleLoading}
          loading={isGoogleLoading}
          title={user ? t('sync.google_drive_title') : t('auth.sign_in_google')}
          description={t('sync.login_google_desc')}
          icon={<GoogleDriveIcon size={28} />}
        />
      </div>
    </DialogFrame>
  );
};
