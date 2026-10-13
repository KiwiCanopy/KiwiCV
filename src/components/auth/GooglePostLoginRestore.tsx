import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { PENDING_GOOGLE_RESTORE_KEY } from '@/constants/auth';
import { useAuth } from '@/hooks/useAuth';
import { useCloudRestorePrompt } from '@/hooks/useCloudRestorePrompt';
import { useLanguage } from '@/hooks/useLanguage';
import { localizedPath } from '@/utils/localeRouting';

export function GooglePostLoginRestore() {
  const { user, hasDrivePermission, availableBackups, loading } = useAuth();
  const { discoverBackupsForRoute } = useCloudRestorePrompt();
  const navigate = useNavigate();
  const lang = useLanguage();
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const shouldCheckRestore = sessionStorage.getItem(PENDING_GOOGLE_RESTORE_KEY) === 'true';

    if (
      !shouldCheckRestore ||
      loading ||
      !user ||
      hasDrivePermission !== true ||
      isProcessingRef.current
    ) {
      return;
    }

    isProcessingRef.current = true;
    sessionStorage.removeItem(PENDING_GOOGLE_RESTORE_KEY);

    // `useAuth` already fetched these, so seeding the library store from them
    // means opening the page costs no second Drive call.
    void discoverBackupsForRoute('google_drive', availableBackups)
      .then(({ hasBackups }) => {
        if (hasBackups) navigate(localizedPath(lang, `/cvs?source=google_drive`));
      })
      .catch((error) => {
        console.error('[GooglePostLoginRestore] Restore check failed:', error);
      })
      .finally(() => {
        isProcessingRef.current = false;
      });
  }, [
    user,
    hasDrivePermission,
    loading,
    discoverBackupsForRoute,
    availableBackups,
    navigate,
    lang,
  ]);

  useEffect(() => {
    const shouldCheckRestore = sessionStorage.getItem(PENDING_GOOGLE_RESTORE_KEY) === 'true';

    if (!shouldCheckRestore || loading || !user || hasDrivePermission !== false) {
      return;
    }

    sessionStorage.removeItem(PENDING_GOOGLE_RESTORE_KEY);
  }, [user, hasDrivePermission, loading]);

  return null;
}
