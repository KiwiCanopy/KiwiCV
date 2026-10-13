import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { localizedPath } from '@/utils/localeRouting';

export function usePostAuthNavigation() {
  const navigate = useNavigate();
  const lang = useLanguage();
  const { user, hasDrivePermission } = useAuth();
  const authSurface = useFlowStore((state) => state.auth.authSurface);
  const closeGoogleLogin = useFlowStore((state) => state.closeGoogleLogin);
  const closeGitHubLogin = useFlowStore((state) => state.closeGitHubLogin);
  const isPendingRedirect = useFlowStore((state) => state.auth.isPendingRedirect);
  const setPendingRedirect = useFlowStore((state) => state.setPendingRedirect);
  const resetAuth = useFlowStore((state) => state.resetAuth);
  const prevUser = useRef(user);
  const prevDrivePermission = useRef(hasDrivePermission);

  useEffect(() => {
    const justLoggedIn = !prevUser.current && user;
    const justGrantedDrive = prevDrivePermission.current !== true && hasDrivePermission === true;

    if (justLoggedIn || justGrantedDrive) {
      if (authSurface === 'google') closeGoogleLogin();
      if (justLoggedIn && authSurface === 'github') closeGitHubLogin();
    }

    if (justLoggedIn) {
      const authSource = useFlowStore.getState().auth.source;
      const isNewUser =
        user?.created_at && Date.now() - new Date(user.created_at).getTime() < 60_000;

      if (isNewUser) {
        analytics.track(ANALYTICS_EVENTS.SIGNUP_COMPLETED, {
          source: authSource || 'unknown',
        });
      }
    }

    prevUser.current = user;
    prevDrivePermission.current = hasDrivePermission;
  }, [user, hasDrivePermission, authSurface, closeGoogleLogin, closeGitHubLogin]);

  useEffect(() => {
    if (!isPendingRedirect) return;

    const authSource = useFlowStore.getState().auth.source;
    setPendingRedirect(false);
    resetAuth();
    navigate(
      authSource === 'landing_try_ai'
        ? localizedPath(lang, `/dashboard?action=try_ai`)
        : localizedPath(lang),
    );
  }, [isPendingRedirect, setPendingRedirect, resetAuth, navigate, lang]);
}
