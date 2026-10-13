import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { getThemeMeta } from '@/components/preview/ThemeRegistry';
import { useSyncAuthGateway } from '@/hooks/sync/useSyncAuthGateway';
import { useAuth } from '@/hooks/useAuth';
import { type SyncVariant, useCloudSync } from '@/hooks/useCloudSync';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { hasStoredGoogleDriveCreds } from '@/services/storage/googleStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { useUIStore } from '@/store/ui/useUIStore';
import type { SyncConfig } from '@/types/resume';
import { getCleanProjectName } from '@/utils/export';
import type { User } from '@supabase/supabase-js';

export type SyncStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseSyncWorkflowProps {
  mode: 'sync' | 'push' | 'manage';
  variant?: 'root' | 'full' | 'hosting';
  onManage?: () => void;
}

export function useSyncWorkflow({ mode, variant = 'root', onManage }: UseSyncWorkflowProps) {
  const { t } = useTranslation();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isAlreadySynced, setIsAlreadySynced] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const activeModal = useUIStore((state) => state.activeSyncModal);
  const setSyncModal = useUIStore((state) => state.setSyncModal);

  const setActiveModal = useCallback(
    (modal: 'none' | 'name' | 'gateway', target?: 'save' | 'manage' | 'export') => {
      setSyncModal(modal, target || (mode === 'manage' ? 'manage' : 'save'));
    },
    [setSyncModal, mode],
  );

  const { user, hasDrivePermission } = useAuth();
  const location = useLocation();

  const { handleSync: triggerCloudSync } = useCloudSync();
  const confirm = useConfirmStore((state) => state.confirm);
  const sync = useResumeStore((state) => state.sync);

  const performSync = useCallback(
    async (projectName?: string) => {
      if (mode === 'manage') return;

      const syncConfig = useResumeStore.getState().sync;

      if (variant === 'hosting' && !syncConfig?.github?.enabled) {
        useFlowStore.getState().openGitHubLogin({ source: 'sync', syncMode: mode });
        return;
      }

      const hasDriveCreds = hasStoredGoogleDriveCreds();
      if (hasDrivePermission === true && hasDriveCreds && !syncConfig?.googleDrive?.enabled) {
        useResumeStore.getState().updateSync({
          googleDrive: { ...syncConfig?.googleDrive, enabled: true },
        });
      }

      useResumeStore.getState().syncVersion();

      // Start Loading Modal
      confirm({
        title: t('sync.pushing'),
        message: t('sync.backing_up'),
        isLoading: true,
        confirmText: '',
        cancelText: '',
        showCloseButton: false,
        closeOnConfirm: false,
      });

      try {
        const cloudVariant: SyncVariant = projectName
          ? 'full'
          : variant === 'root'
            ? 'config'
            : variant;
        const { success, results, error } = await triggerCloudSync(
          cloudVariant,
          projectName,
          mode as 'sync' | 'push',
        );

        if (success) {
          if (results.length === 0) {
            useConfirmStore.getState().close();
            setSyncStatus('idle');
            const hasPat = !!(
              localStorage.getItem('github_pat') || sessionStorage.getItem('github_pat')
            );
            if (!hasPat && !hasDriveCreds) {
              useFlowStore.getState().openGoogleLogin({
                description: t('auth.sync_login_required'),
                source: 'sync',
                allowGitHub: true,
                syncMode: mode as 'sync' | 'push',
                requireDrive: true,
              });
            } else {
              setActiveModal('gateway');
            }
            return;
          }

          let alreadySynced = false;
          if (results.length > 0 && results.every((r) => r.alreadySynced)) {
            alreadySynced = true;
            setIsAlreadySynced(true);
          }

          setSyncStatus('success');

          // Show Success Modal
          useConfirmStore.getState().setOptions({
            title: alreadySynced ? t('sync.up_to_date') : t('sync.push_success_title'),
            message: t('sync.push_success_msg'),
            isLoading: false,
            confirmText: t('common.ok'),
            cancelText: '',
            showCloseButton: true,
            closeOnConfirm: true,
            variant: 'primary',
          });

          setTimeout(() => {
            setSyncStatus('idle');
            setIsAlreadySynced(false);
          }, 3000);

          // Track Success
          const resume = useResumeStore.getState().resume;
          const themeMeta = getThemeMeta(resume.meta.theme.name);
          const providers = results.filter((r) => r.success).map((r) => r.service);

          if (projectName) {
            analytics.track(ANALYTICS_EVENTS.EXPORT_PERFORMED, {
              type: 'cloud',
              formats: ['pdf', 'html', 'json'],
              providers,
              language: resume.meta.theme.locale,
              themeId: resume.meta.theme.name,
              paletteId: resume.meta.theme.params.palette,
              ...(themeMeta?.layout === 'two-column' && {
                sidebarPosition: resume.meta.content.order.twoColumn.sidebarPosition,
              }),
            });
          } else {
            analytics.track(ANALYTICS_EVENTS.BACKUP_PERFORMED, {
              type: 'manual',
              providers,
            });
          }

          const driveResult = results.find((r) => r.service === 'google_drive' && r.folderName);
          if (driveResult && projectName) {
            const expectedFolderName = getCleanProjectName(projectName);
            if (driveResult.folderName !== expectedFolderName) {
              // Collision logic...
              confirm({
                title: t('sync.collision_title'),
                message: t('sync.collision_message', {
                  name: expectedFolderName,
                  newName: String(driveResult.folderName),
                }),
                confirmText: t('common.ok'),
                cancelText: '',
              });
            }
          }
        } else {
          const atLeastOneSuccess = results.some((r) => r.success);
          if (atLeastOneSuccess) {
            setSyncStatus('success');
            setTimeout(() => {
              setSyncStatus('idle');
              setIsAlreadySynced(false);
            }, 3000);
            return;
          }

          setSyncStatus('error');
          const firstError = results.find((r) => !r.success)?.error || error || t('common.error');
          setErrorMessage(firstError);

          const needsConfig =
            results.length === 0 ||
            results.every((r) => r.error?.includes('config') || r.error?.includes('PAT'));
          const googleAuthError = results.some(
            (r) => r.service === 'google_drive' && r.error?.includes('connection missing'),
          );

          if ((needsConfig || googleAuthError) && location.pathname !== '/settings') {
            useFlowStore.getState().openGoogleLogin({
              description: t('auth.sync_login_required'),
              source: 'sync',
              syncMode: mode as 'sync' | 'push',
              requireDrive: true,
            });
          }
          setTimeout(() => setSyncStatus('idle'), 5000);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Sync failed';
        setSyncStatus('error');
        setErrorMessage(errorMsg);

        // Show Error Modal
        useConfirmStore.getState().setOptions({
          title: t('common.error'),
          message: errorMsg || t('common.error_occurred'),
          isLoading: false,
          confirmText: t('common.ok'),
          cancelText: '',
          showCloseButton: true,
          closeOnConfirm: true,
          variant: 'destructive',
        });
        setTimeout(() => setSyncStatus('idle'), 5000);
      }
    },
    [
      variant,
      mode,
      hasDrivePermission,
      triggerCloudSync,
      t,
      confirm,
      location.pathname,
      setActiveModal,
    ],
  );

  const { ensureConnected } = useSyncAuthGateway();

  const handleTrigger = useCallback(() => {
    // Self-heal: Disable if credentials missing
    const hasPat = !!(localStorage.getItem('github_pat') || sessionStorage.getItem('github_pat'));
    const hasDriveCreds = hasStoredGoogleDriveCreds();

    if ((sync.github.enabled && !hasPat) || (sync.googleDrive.enabled && !hasDriveCreds)) {
      const updates: Partial<SyncConfig> = {};
      if (sync.github.enabled && !hasPat) updates.github = { ...sync.github, enabled: false };
      if (sync.googleDrive.enabled && !hasDriveCreds)
        updates.googleDrive = { ...sync.googleDrive, enabled: false };
      useResumeStore.getState().updateSync(updates);
    }

    ensureConnected({
      mode,
      onSuccess: () => {
        if (mode === 'push') setActiveModal('name');
        else if (mode === 'manage') onManage?.();
        else performSync();
      },
      onSetupRequired: () => setActiveModal('gateway'),
    });
  }, [mode, sync, ensureConnected, onManage, setActiveModal, performSync]);

  // Auth Lifecycle Logic...
  const prevUserRef = useRef<User | null | undefined>(undefined);
  const prevDrivePermission = useRef<boolean | null | undefined>(undefined);
  const waitingForPermissionRef = useRef(false);

  useEffect(() => {
    const auth = useFlowStore.getState().auth;
    const justLoggedIn =
      (prevUserRef.current === null && user) || (prevUserRef.current === undefined && user);

    const isMatch = auth.syncMode === mode || (mode === 'sync' && auth.syncMode === 'manage');
    const isSourceMatch = auth.source === 'sync' || auth.source === 'manage';

    if (justLoggedIn && isSourceMatch && isMatch) {
      waitingForPermissionRef.current = true;
      // The target is passed, not defaulted: `setActiveModal` fills in `'save'`
      // when it is omitted, which would leave `syncGatewayTarget` describing a
      // backup while an export is in flight.
      if (auth.syncMode === 'push') queueMicrotask(() => setActiveModal('name', 'export'));
    }

    const justGrantedDrive = hasDrivePermission === true && prevDrivePermission.current !== true;

    if (isSourceMatch && isMatch && (waitingForPermissionRef.current || justGrantedDrive)) {
      if (hasDrivePermission === true) {
        waitingForPermissionRef.current = false;
        const hasPat = !!(
          localStorage.getItem('github_pat') || sessionStorage.getItem('github_pat')
        );
        const hasDriveCreds = hasStoredGoogleDriveCreds();
        const isGitHubActive = sync.github.enabled && hasPat;
        const isGoogleActive =
          sync.googleDrive.enabled && hasDriveCreds && hasDrivePermission === true;

        if (auth.syncMode === 'push') {
          // The target, for the reason stated above.
          queueMicrotask(() => setActiveModal('name', 'export'));
        } else if (auth.syncMode === 'manage') {
          onManage?.();
        } else if (isGitHubActive || isGoogleActive) {
          queueMicrotask(() => performSync());
        } else {
          queueMicrotask(() => setActiveModal('gateway'));
        }

        useFlowStore.getState().resetAuth();
      } else if (hasDrivePermission === false) {
        waitingForPermissionRef.current = false;
        queueMicrotask(() => setActiveModal('gateway'));
        useFlowStore.getState().resetAuth();
      }
    }

    prevUserRef.current = user;
    prevDrivePermission.current = hasDrivePermission;
  }, [
    user,
    hasDrivePermission,
    mode,
    sync.github.enabled,
    sync.googleDrive.enabled,
    performSync,
    onManage,
    setActiveModal,
  ]);

  return {
    syncStatus,
    isAlreadySynced,
    errorMessage,
    activeModal,
    setActiveModal,
    handleTrigger,
    performSync,
  };
}
