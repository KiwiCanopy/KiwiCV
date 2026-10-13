import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { hasStoredGoogleDriveCreds } from '@/services/storage/googleStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';

/**
 * Global hook to ensure sync configuration remains consistent with browser storage/auth.
 * If a sync service is enabled but its required credentials are missing, it will
 * automatically be set to disabled.
 */
export function useSyncSelfHeal() {
  const { user, hasDrivePermission, loading } = useAuth();
  const sync = useResumeStore((state) => state.sync);
  const updateSync = useResumeStore((state) => state.updateSync);
  const location = useLocation();

  useEffect(() => {
    // 1. GitHub Check (Local Storage)
    const githubEnabled = !!sync?.github?.enabled;
    const hasPat = !!(localStorage.getItem('github_pat') || sessionStorage.getItem('github_pat'));

    if (githubEnabled && !hasPat) {
      updateSync({
        github: {
          ...sync?.github,
          enabled: false,
        },
      });
    }

    // 2. Google Drive Check (Auth State)
    // We only check if auth is not loading to avoid accidental deactivation on cold start
    if (!loading) {
      const googleEnabled = !!sync?.googleDrive?.enabled;
      const hasDriveCreds = hasStoredGoogleDriveCreds();
      const isMissingAuth = !user || hasDrivePermission === false || !hasDriveCreds;

      if (googleEnabled && isMissingAuth) {
        updateSync({
          googleDrive: {
            ...sync?.googleDrive,
            enabled: false,
          },
        });
      }
    }
  }, [
    sync?.github,
    sync?.googleDrive,
    user,
    hasDrivePermission,
    loading,
    updateSync,
    location.pathname,
  ]);
}
