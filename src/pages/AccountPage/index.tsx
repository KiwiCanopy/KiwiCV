import React from 'react';

import { ProfileMissingModal } from '@/components/modals/ProfileMissingModal';
import { PricingDialog } from '@/components/monetization/PricingDialog';
import { PageContainer } from '@/components/ui/PageContainer';
import { StatePanel } from '@/components/ui/StatePanel';
import { BRAND_CONFIG } from '@/config/brand';
import { AccountActions } from '@/pages/AccountPage/components/AccountActions';
import { BillingSection } from '@/pages/AccountPage/components/BillingSection';
import { LoginState } from '@/pages/AccountPage/components/LoginState';
import { ProfileSection } from '@/pages/AccountPage/components/ProfileSection';
import { useAccount } from '@/pages/AccountPage/useAccount';

export const Account: React.FC = () => {
  const {
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
    setIsDeleteModalOpen,
    openPricing,
    localizedPath,
    handleSignOut,
    handleCloseMissingProfile,
  } = useAccount();

  const isPendingRestore = sessionStorage.getItem('pending_google_restore') === 'true';
  const isVerifying = isPendingRestore || isPurchaseRedirect;

  // Patience: If we have a user but no profile, wait up to 3 seconds before showing the "Missing Profile" modal.
  // This prevents flashes during reloads or redirects where synchronization is briefly delayed.
  const [hasTimedOut, setHasTimedOut] = React.useState(false);
  React.useEffect(() => {
    if (user && !profile) {
      const timer = setTimeout(() => setHasTimedOut(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [user, profile]);

  if (loading || (user && !profile && (isVerifying || !hasTimedOut))) {
    return (
      <PageContainer className="flex h-[60vh] items-center justify-center">
        <StatePanel
          variant="loading"
          title={isPendingRestore ? t('common.restoring') : t('common.loading')}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-4 pb-10 md:space-y-8 md:pb-20" maxHeight="responsive">
      {/* Header */}
      {user && (
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center">
              <img
                src={BRAND_CONFIG.assets.symbol}
                alt={t('common.logo_alt')}
                className="h-9 w-9 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase opacity-60">
                  KiwiCV
                </span>
              </div>
              <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
                {t('auth.account_management')}
              </h1>
            </div>
          </div>
        </div>
      )}

      {!user ? (
        <LoginState />
      ) : !profile ? (
        <>
          <div className="pointer-events-none grid gap-6 opacity-20 blur-sm md:grid-cols-12">
            <div className="space-y-6 md:col-span-8">
              <div className="bg-muted h-48 animate-pulse rounded-3xl" />
              <div className="bg-muted h-64 animate-pulse rounded-3xl" />
            </div>
            <div className="bg-muted h-96 animate-pulse rounded-3xl md:col-span-4" />
          </div>
          <ProfileMissingModal
            isOpen={!isVerifying && hasTimedOut}
            onClose={handleCloseMissingProfile}
            onSignOut={handleSignOut}
            onDeleteAccount={() => setIsDeleteModalOpen(true)}
            isSigningOut={isSigningOut}
          />
        </>
      ) : (
        <div className="grid gap-6 md:grid-cols-12">
          {/* Main Content */}
          <div className="space-y-6 md:col-span-8">
            <ProfileSection user={user} profile={profile} formatUIDate={formatUIDate} />
            <BillingSection
              profile={profile}
              isVerifyingPayment={isVerifyingPayment}
              openPricing={openPricing}
              formatUIDate={formatUIDate}
            />
          </div>

          {/* Sidebar / Actions */}
          <AccountActions
            handleSignOut={handleSignOut}
            isSigningOut={isSigningOut}
            setIsDeleteModalOpen={setIsDeleteModalOpen}
            localizedPath={localizedPath}
          />
        </div>
      )}

      <PricingDialog isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </PageContainer>
  );
};

export default Account;
