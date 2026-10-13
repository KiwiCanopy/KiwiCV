import React from 'react';

import { GoogleDriveIcon } from '@/components/ui/Icons';
import { GOOGLE_DRIVE_FOLDER } from '@/constants/cloud';
import { ServiceCard } from '@/features/settings/shared/ServiceCard';
import { disconnectGoogleDrive } from '@/hooks/sync/disconnectGoogleDrive';
import { useProviderStates } from '@/hooks/sync/useProviderStates';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { hasStoredGoogleDriveCreds } from '@/services/storage/googleStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { useToastStore } from '@/store/ui/useToastStore';
import type { FocusAnchor } from '@/utils/focus';
import { Folder } from 'lucide-react';

// Long enough to read an instruction and a URL; the toast pauses on hover and focus.
const REVOKE_FAILED_TOAST_MS = 15000;

export const GoogleDriveCard: React.FC = () => {
  const { t } = useTranslation();
  const { user, signInWithGoogle } = useAuth();
  const { sync: syncRoot, updateSync } = useResumeStore();
  const confirm = useConfirmStore((state) => state.confirm);
  const addToast = useToastStore((state) => state.addToast);

  const config = syncRoot?.googleDrive || { enabled: false };
  const isEnabled = !!config.enabled;
  const { googleDrive: driveState } = useProviderStates();
  const requiresDrivePermission = driveState === 'permission_required';
  // We hold a credential and the handshake has not resolved. Acting on the
  // toggle now would decide from a state we are about to learn.
  const isChecking = driveState === 'checking';

  // Both entry points: the confirm stays open and busy while Google revokes, and
  // a failed revoke must not claim access is gone — the user finishes it at Google.
  const runDisconnect = async () => {
    let revoked: boolean;
    try {
      revoked = await disconnectGoogleDrive();
    } catch (error) {
      console.error('Google Drive disconnect failed:', error);
      addToast(t('common.error_occurred'), 'error');
      return;
    } finally {
      useConfirmStore.getState().close();
    }
    if (revoked) addToast(t('sync.disconnect_drive_success'), 'success');
    else addToast(t('sync.disconnect_drive_revoke_failed'), 'warning', REVOKE_FAILED_TOAST_MS);
  };

  const handleToggle = async (enabled: boolean) => {
    if (isChecking) return;
    if (enabled) {
      if (!user) {
        useFlowStore.getState().openGoogleLogin({
          description: t('auth.sync_login_required'),
          source: 'settings',
          allowGitHub: false,
          requireDrive: true,
        });
        return;
      }
      if (requiresDrivePermission) {
        await signInWithGoogle({ requireDrive: true });
        return;
      }
    }

    // Switching Drive off is not signing out of KiwiCV, and it offers the same
    // three-way choice GitHub already does: disconnect for real, merely pause,
    // or change nothing.
    if (!enabled) {
      const result = await confirm({
        title: t('sync.confirm_disconnect_drive_title'),
        message: t('sync.confirm_disconnect_drive_message'),
        confirmText: t('sync.confirm_disconnect_drive_yes'),
        cancelText: t('sync.confirm_disconnect_drive_no'),
        variant: 'destructive',
        closeOnConfirm: false,
      });

      // Dismissed with Escape or the close button: no decision was made.
      if (result === null) return;

      if (result === true) {
        await runDisconnect();
      } else {
        updateSync({ googleDrive: { ...config, enabled: false } });
      }
      return;
    }

    analytics.track(ANALYTICS_EVENTS.SYNC_PROVIDER_TOGGLED, {
      provider: 'google_drive',
      enabled,
    });
    updateSync({ googleDrive: { enabled } });
  };

  // Reachable from every state that holds a credential, `connected_disabled`
  // included, and never through the switch: turning sync on first could upload.
  const onDisconnect = async (restoreFocusTo: FocusAnchor) => {
    const result = await confirm({
      title: t('sync.confirm_disconnect_drive_title'),
      message: t('sync.confirm_remove_drive_access_message'),
      confirmText: t('sync.confirm_disconnect_drive_yes'),
      variant: 'destructive',
      closeOnConfirm: false,
      restoreFocusTo,
    });
    if (result !== true) return;
    await runDisconnect();
  };

  const isConfigured = driveState === 'active' || driveState === 'connected_disabled';

  return (
    <>
      <ServiceCard
        title={t('sync.google_drive_title')}
        description={t('sync.google_drive_desc')}
        icon={<GoogleDriveIcon size={32} />}
        isEnabled={isEnabled}
        isConfigured={isConfigured}
        isActionRequired={requiresDrivePermission}
        actionRequiredMessage={t('sync.drive_access_required')}
        actionRequiredShort={t('sync.drive_access_required_short')}
        onActionRequiredClick={() => signInWithGoogle({ requireDrive: true })}
        onToggle={handleToggle}
        isLoading={isChecking}
        statusBadge={
          isChecking ? t('sync.checking_connection') : isEnabled ? t('sync.active') : undefined
        }
        metadata={
          user && isConfigured
            ? [
                {
                  label: t('sync.folder_name'),
                  value: GOOGLE_DRIVE_FOLDER,
                  icon: <Folder size={14} className="text-primary-strong" />,
                },
              ]
            : undefined
        }
        isLocked={!user}
        disconnect={
          hasStoredGoogleDriveCreds()
            ? { onClick: onDisconnect, label: t('sync.disconnect_drive') }
            : undefined
        }
        lockedMessage={t('auth.login_to_enable')}
        onLockedClick={() =>
          useFlowStore.getState().openGoogleLogin({
            description: t('auth.sync_login_required'),
            source: 'settings',
            allowGitHub: false,
            requireDrive: true,
          })
        }
      />
    </>
  );
};
