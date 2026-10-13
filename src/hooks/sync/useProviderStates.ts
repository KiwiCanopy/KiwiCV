import {
  type ProviderState,
  deriveGitHubState,
  deriveGoogleDriveState,
} from '@/hooks/sync/providerState';
import { useAuth } from '@/hooks/useAuth';
import { hasStoredGitHubCreds } from '@/services/storage/githubStorage';
import { hasStoredGoogleDriveCreds } from '@/services/storage/googleStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';

export interface ProviderStates {
  github: ProviderState;
  googleDrive: ProviderState;
}

/**
 * Reads every provider connectivity signal in one place and returns the state
 * each surface should display.
 *
 * Surfaces consume states, not raw booleans, so the signals stay acquired in a
 * single location. When a server-side store replaces browser-local Drive credentials with a
 * durable server-side connection status, only this hook body changes.
 */
export function useProviderStates(): ProviderStates {
  const { user, hasDrivePermission } = useAuth();
  const sync = useResumeStore((state) => state.sync);

  return {
    github: deriveGitHubState({
      hasPat: hasStoredGitHubCreds(),
      hasRepo: !!sync?.github?.repo,
      isEnabled: !!sync?.github?.enabled,
    }),
    googleDrive: deriveGoogleDriveState({
      isSignedIn: !!user,
      hasDriveCredentials: hasStoredGoogleDriveCreds(),
      hasDrivePermission,
      isEnabled: !!sync?.googleDrive?.enabled,
    }),
  };
}
