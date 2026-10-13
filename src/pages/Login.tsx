import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthView } from '@/components/auth/AuthView';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { localizedPath as buildLocalizedPath } from '@/utils/localeRouting';

export function Login() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const lang = useLanguage();
  const localizedPath = useCallback((path: string) => buildLocalizedPath(lang, path), [lang]);
  const setAuthSource = useFlowStore((state) => state.setAuthSource);

  // Set the flow store auth source to 'login_page' on mount
  useEffect(() => {
    setAuthSource('login_page');
  }, [setAuthSource]);

  // If already logged in and has accepted everything, go to dashboard
  useEffect(() => {
    if (user && profile?.accepted_terms && profile?.accepted_privacy) {
      navigate(localizedPath('/'), { replace: true });
    }
  }, [user, profile, navigate, localizedPath]);

  return <AuthView variant="page" />;
}
