import React from 'react';
import { SiGithub } from 'react-icons/si';

import { Button } from '@/components/ui/Button';
import { DialogFrame } from '@/components/ui/DialogFrame';
import { GoogleDriveIcon } from '@/components/ui/Icons';
import { type ProviderState } from '@/hooks/sync/providerState';
import { useProviderStates } from '@/hooks/sync/useProviderStates';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { cn } from '@/utils/cn';
import { type FocusAnchor } from '@/utils/focus';
import { ArrowRight, CircleAlert, Cloud } from 'lucide-react';

interface CloudSyncGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Where focus goes when the control that opened this is gone. The export
   * chain swaps one dialog for another through a single `activeSyncModal` enum,
   * so the opener is unmounted by the commit that mounts this.
   */
  restoreFocusTo?: FocusAnchor;
  onStartSync: () => void;
  onConnectGitHub: () => void;
  onConnectGoogle: () => void;
  label?: string;
  icon?: React.ReactNode;
}

interface SyncService {
  id: string;
  title: string;
  icon: React.ReactNode;
  state: ProviderState;
  enabled: boolean;
  onToggle: () => void;
  onConnect: () => void;
  onActionRequiredClick?: () => void;
}

export const CloudSyncGatewayModal: React.FC<CloudSyncGatewayModalProps> = ({
  isOpen,
  onClose,
  restoreFocusTo,
  onStartSync,
  onConnectGitHub,
  onConnectGoogle,
  label,
  icon,
}) => {
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();
  const sync = useResumeStore((state) => state.sync);
  const updateSync = useResumeStore((state) => state.updateSync);

  const { github: githubState, googleDrive: googleState } = useProviderStates();

  const services: SyncService[] = [
    {
      id: 'github',
      title: t('sync.github_title'),
      icon: <SiGithub className="h-6 w-6" />,
      state: githubState,
      enabled: sync.github.enabled,
      onToggle: () => updateSync({ github: { ...sync.github, enabled: !sync.github.enabled } }),
      onConnect: onConnectGitHub,
    },
    {
      id: 'google_drive',
      title: t('sync.google_drive_title'),
      icon: <GoogleDriveIcon size={24} />,
      state: googleState,
      enabled: sync.googleDrive.enabled,
      onToggle: () =>
        updateSync({ googleDrive: { ...sync.googleDrive, enabled: !sync.googleDrive.enabled } }),
      onConnect: onConnectGoogle,
      onActionRequiredClick: () => signInWithGoogle({ requireDrive: true }),
    },
  ];

  return (
    <DialogFrame
      open={isOpen}
      restoreFocusTo={restoreFocusTo}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      maxWidth="lg"
      zIndexClassName="z-[60]"
      icon={<Cloud className="h-6 w-6" />}
      title={t('sync.gateway_title')}
      description={t('sync.gateway_desc')}
      footer={
        <Button
          variant="primary"
          onClick={() => {
            onClose();
            onStartSync();
          }}
          disabled={!sync.github.enabled && !sync.googleDrive.enabled}
          className="h-14 w-full gap-3 rounded-2xl text-base font-black"
        >
          {icon}
          {label || t('header.push_to_cloud')}
        </Button>
      }
    >
      <div className="space-y-4">
        {services.map((service) => {
          const needsPermission = service.state === 'permission_required';
          const isConnected = service.state === 'active' || service.state === 'connected_disabled';

          return (
            <div
              key={service.id}
              onClick={needsPermission ? service.onActionRequiredClick : undefined}
              className={cn(
                'group relative flex flex-col justify-between gap-3 overflow-hidden rounded-2xl border p-4 transition-all duration-300 sm:flex-row sm:items-center sm:p-5',
                isConnected
                  ? 'bg-muted/30 border-primary-strong/20 ring-primary-strong/5 shadow-sm ring-1'
                  : 'border-border bg-background hover:border-primary-strong/30 hover:shadow-md',
                needsPermission &&
                  'cursor-pointer border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 hover:shadow-md active:scale-[0.99]',
              )}
            >
              <div className="flex w-full items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="bg-background flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm transition-transform group-hover:scale-110">
                    {service.icon}
                  </div>
                  {needsPermission && (
                    <div className="bg-background absolute -right-1.5 -bottom-1.5 rounded-full border p-1 shadow-sm ring-1 ring-amber-500/20">
                      <CircleAlert className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold tracking-tight">{service.title}</h4>
                  </div>
                  <p className="text-muted-foreground text-xs font-medium">
                    {service.state === 'active'
                      ? t('sync.active')
                      : service.state === 'connected_disabled'
                        ? t('sync.not_enabled')
                        : service.state === 'permission_required'
                          ? t('sync.drive_access_required_short')
                          : service.state === 'checking'
                            ? t('sync.checking_connection')
                            : t('sync.not_configured')}
                  </p>
                </div>
              </div>

              {needsPermission ? (
                <div className="mt-2 flex w-full flex-col items-stretch gap-1.5 sm:mt-0 sm:w-auto sm:items-end">
                  <span className="inline-flex items-center justify-center rounded-full bg-amber-500/10 px-2 py-1 text-center text-[9px] font-bold tracking-wider text-amber-600 uppercase ring-1 ring-amber-500/20 ring-inset sm:justify-start sm:py-0.5">
                    {t('sync.drive_access_required_short')}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      service.onActionRequiredClick?.();
                    }}
                    className="animate-gold-pulse flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold whitespace-nowrap text-amber-700 transition-all hover:translate-x-1 hover:bg-amber-500/20 focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:outline-none sm:w-auto dark:text-amber-400"
                  >
                    {t('sync.grant_permission')}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ) : isConnected ? (
                <div className="mt-1 flex w-full items-center justify-between gap-3 sm:mt-0 sm:w-auto sm:justify-end">
                  <span className="text-muted-foreground text-xs font-medium sm:hidden">
                    {service.enabled ? t('sync.active') : t('sync.not_enabled')}
                  </span>
                  <button
                    role="switch"
                    aria-checked={service.enabled}
                    // The switch's state is aria-checked; the name is the service alone.
                    aria-label={service.title}
                    onClick={(e) => {
                      e.stopPropagation();
                      service.onToggle();
                    }}
                    className={cn(
                      'ring-offset-background focus:ring-primary-strong relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none',
                      service.enabled ? 'bg-primary' : 'bg-muted',
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                        service.enabled ? 'translate-x-5' : 'translate-x-0',
                      )}
                    />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={service.onConnect}
                  className="border-input bg-card text-foreground hover:bg-muted focus-visible:ring-primary-strong flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all hover:translate-x-1 focus-visible:ring-2 focus-visible:outline-none sm:w-auto"
                >
                  {t('sync.setup')}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </DialogFrame>
  );
};
