import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useSignOutFlow } from '@/hooks/useSignOutFlow';
import { useTranslation } from '@/hooks/useTranslation';
import { useUIStore } from '@/store/ui/useUIStore';
import { localizedPath as buildLocalizedPath } from '@/utils/localeRouting';

export function useAccount() {
  const navigate = useNavigate();
  const { t, formatUIDate } = useTranslation();
  const { user, profile, loading, refreshProfile } = useAuth();
  const signOut = useSignOutFlow();
  const lang = useLanguage();
  const isVerifyingPayment = useUIStore((state) => state.isVerifyingPayment);

  const params = new URLSearchParams(window.location.search);
  const isPurchaseRedirect = params.get('success') === 'true' || params.get('session_id') !== null;

  const [isSigningOut, setIsSigningOut] = useState(false);

  // Safety: Reset flags if auth loading finishes and we are still not logged in
  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.removeItem('google_oauth_in_progress');
    }
  }, [loading, user]);

  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const isDeleteModalOpen = useUIStore((state) => state.isDeleteModalOpen);
  const setIsDeleteModalOpen = useUIStore((state) => state.setDeleteModalOpen);
  const openPricing = () => setIsPricingOpen(true);

  const localizedPath = (path: string) => buildLocalizedPath(lang, path);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (_error) {
      console.error('Sign out failed:', _error);
    } finally {
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user, refreshProfile]);

  const handleCloseMissingProfile = () => {
    navigate(localizedPath('/'));
  };

  return {
    t,
    formatUIDate,
    user,
    profile,
    loading,
    isVerifyingPayment,
    isPurchaseRedirect,
    isSigningOut,
    isPricingOpen,
    setIsPricingOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    openPricing,
    localizedPath,
    handleSignOut,
    handleCloseMissingProfile,
  };
}
