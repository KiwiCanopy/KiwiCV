import { type FlowFocusAnchorId } from '@/constants/focusAnchors';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { hasStoredGoogleDriveCreds } from '@/services/storage/googleStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';

/**
 * Reusable hook to handle the "Sync Gateway" logic.
 * Checks if cloud services are active and handles authentication/setup redirects.
 */
export function useSyncAuthGateway() {
  const { t } = useTranslation();
  const { user, hasDrivePermission } = useAuth();
  const syncConfig = useResumeStore((state) => state.sync);

  const hasPat = !!(localStorage.getItem('github_pat') || sessionStorage.getItem('github_pat'));
  const hasDriveCreds = hasStoredGoogleDriveCreds();

  const isGitHubActive = syncConfig.github.enabled && hasPat;
  const isGoogleActive =
    syncConfig.googleDrive.enabled && hasDriveCreds && hasDrivePermission === true;

  const isCloudActive = isGitHubActive || isGoogleActive;

  /**
   * Ensures the user is connected to a cloud service, opening the login modal or
   * the setup gateway when they are not.
   *
   * ⚠️ `onInterrupt` and `restoreFocusToId` are one decision, so the type makes
   * them one field. A caller passing `onInterrupt` is **closing the surface its
   * own opener lives on** in the same state update that opens the auth modal —
   * which is exactly when `DialogFrame` will find the captured opener unmounted
   * and need somewhere else to go. Naming the anchor is therefore not a
   * courtesy the caller may skip; omitting it is a build error.
   *
   * ⚠️ **The union binds this exit only.** `onSetupRequired` below also destroys
   * `ExportModalBody`'s surface, through a route this hook cannot see, and is
   * anchored in `SyncWorkflowModals` instead — `code/UI_PATTERNS.md` § A dialog
   * opened as the side effect of another closing argues why.
   *
   * Callers that neither interrupt nor swap keep a live opener, so
   * `DialogFrame`'s first rung answers them and an anchor would be dead weight.
   */
  const ensureConnected = ({
    onSuccess,
    onSetupRequired,
    mode,
    ...interruption
  }: {
    onSuccess: () => void;
    onSetupRequired: () => void;
    mode: 'push' | 'sync' | 'manage';
  } & (
    | { onInterrupt?: undefined; restoreFocusToId?: never }
    | { onInterrupt: () => void; restoreFocusToId: FlowFocusAnchorId }
  )) => {
    const { onInterrupt, restoreFocusToId } = interruption;
    // 1. Specialized streamlining for Management mode:
    // We skip the intermediate Gateway if credentials exist OR if a login is needed.
    if (mode === 'manage') {
      const isCloudSetup = hasPat || (hasDriveCreds && hasDrivePermission === true);

      if (isCloudSetup) {
        onSuccess();
        return;
      }

      // If they are logged in but lack Google Drive credentials or permissions,
      // redirect them to the Gateway modal so they can resolve the connection/permission gap.
      if (user && (!hasDriveCreds || hasDrivePermission === false)) {
        onSetupRequired();
        return;
      }

      onInterrupt?.();
      useFlowStore.getState().openGoogleLogin({
        description: t('auth.sync_login_required'),
        source: 'manage',
        allowGitHub: true,
        syncMode: mode,
        requireDrive: true,
        restoreFocusToId,
      });
      return;
    }

    // 2. Default flow for sync/push/export (maintains current Gateway logic)
    if (isCloudActive) {
      onSuccess();
      return;
    }

    if (!user) {
      onInterrupt?.();
      useFlowStore.getState().openGoogleLogin({
        description: t('auth.sync_login_required'),
        source: 'sync',
        allowGitHub: true,
        syncMode: mode,
        requireDrive: true,
        restoreFocusToId,
      });
      return;
    }

    onSetupRequired();
  };

  return {
    isCloudActive,
    isGitHubActive,
    isGoogleActive,
    ensureConnected,
    user,
  };
}
