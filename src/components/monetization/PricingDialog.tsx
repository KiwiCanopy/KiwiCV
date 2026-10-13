import React, { type ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ProfileMissingModal } from '@/components/modals/ProfileMissingModal';
import { PricingPlanCard } from '@/components/monetization/pricing/PricingPlanCard';
import { passes } from '@/components/monetization/pricing/catalog';
import { DialogFrame, DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { BREAKPOINTS } from '@/constants/breakpoints';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useSignOutFlow } from '@/hooks/useSignOutFlow';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { purchaseService } from '@/services/purchase';
import { useUIStore } from '@/store/ui/useUIStore';
import { cn } from '@/utils/cn';
import { localizedPath } from '@/utils/localeRouting';
import { ArrowUpRight, Zap } from 'lucide-react';

interface PricingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// `max-w-[95vw]` and `md:max-h-[85vh]` beat ModalContainer's own 92vw and
// h-responsive's 90vh, as they did before the migration. Without the height cap
// an 8vh top offset would let the dialog reach 98vh.
const PANEL_CLASS = 'max-w-[95vw] md:top-[8vh] md:max-h-[85vh] md:translate-y-0';

function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-primary/5 border-primary-strong/10 rounded-3xl border-2 px-5 py-5 transition-none md:px-8 md:py-6">
      <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
        <Zap className="text-primary-strong h-5 w-5" aria-hidden="true" />
        {title}
      </h3>
      <div className="border-primary-strong/10 my-4 border-b" />
      {children}
    </div>
  );
}

export const PricingDialog: React.FC<PricingDialogProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const lang = useLanguage();
  const { t, language } = useTranslation();
  const { user, profile } = useAuth();
  const signOut = useSignOutFlow();
  const setIsDeleteModalOpen = useUIStore((state) => state.setDeleteModalOpen);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleClose = () => {
    if (user && !profile) {
      navigate(localizedPath(lang));
    }
    onClose();
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const signedOut = await signOut();
    setIsSigningOut(false);
    if (signedOut) onClose();
  };

  // ⚠️ No tab state. Passes were one of two families until the credits system
  // was removed; a single-family surface has nothing to switch between, so the
  // toggle, the switch counter and the tab dimension on every event went with
  // it.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      analytics.track(ANALYTICS_EVENTS.PRICING_MODAL_OPENED);
    }
  }

  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const isSmallScreen = useMediaQuery(`(max-width: ${BREAKPOINTS.MD - 1}px)`);
  const recommendedPassRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (recommendedPassRef.current) {
          recommendedPassRef.current.scrollIntoView({
            behavior: 'auto',
            inline: 'center',
            block: 'nearest',
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handlePurchase = async (lookupKey: string) => {
    if (!user || !profile) return;
    analytics.track(ANALYTICS_EVENTS.CHECKOUT_STARTED, { packageId: lookupKey });
    setIsProcessing(lookupKey);
    try {
      const returnPath = window.location.pathname + window.location.search;
      await purchaseService.purchasePackage(lookupKey, user.id, returnPath);
    } catch (error) {
      console.error('Purchase failed:', error);
      setIsProcessing(null);
    }
  };

  // A signed-in user without a profile cannot buy anything, so the pricing
  // surface is replaced outright by the recovery dialog `AccountPage` uses.
  if (user && !profile) {
    return (
      <ProfileMissingModal
        isOpen={isOpen}
        onClose={handleClose}
        onSignOut={handleSignOut}
        onDeleteAccount={() => setIsDeleteModalOpen(true)}
        isSigningOut={isSigningOut}
      />
    );
  }

  const header = (
    <>
      <div
        className={cn(
          'bg-primary/5 relative overflow-hidden rounded-t-3xl',
          isSmallScreen ? 'p-4' : 'p-10',
        )}
      >
        <div className="relative z-10 text-center">
          <DialogFrameTitle
            className={cn('font-black tracking-tight', isSmallScreen ? 'text-xl' : 'text-3xl')}
          >
            {t('monetization.title')}
          </DialogFrameTitle>
          {!isSmallScreen && (
            <DialogFrameDescription className="text-muted-foreground mx-auto mt-2 max-w-md text-base">
              {t('monetization.description')}
            </DialogFrameDescription>
          )}
        </div>

        {/* Decor */}
        <div className="bg-primary/10 absolute -top-12 -right-12 h-48 w-48 rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute -bottom-12 -left-12 h-48 w-48 rounded-full blur-3xl" />
      </div>
    </>
  );

  return (
    <DialogFrame
      open={isOpen}
      onOpenChange={(open, reason) => {
        if (open) return;
        // Escape closed the dialog untracked before this migration; only the
        // close button reports, and it keeps reporting under the same name.
        if (reason === 'close-button') {
          analytics.track(ANALYTICS_EVENTS.PRICING_MODAL_CLOSED, { method: 'x_button' });
        }
        handleClose();
      }}
      header={header}
      className={PANEL_CLASS}
    >
      <div className={cn('p-5 md:p-8', isSmallScreen ? 'space-y-4' : 'space-y-8')}>
        <div
          className={cn(
            isSmallScreen
              ? 'clean-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pt-2 pb-6'
              : 'grid grid-cols-1 gap-5 md:grid-cols-3',
          )}
        >
          {passes.map((plan) => (
            <PricingPlanCard
              key={plan.id}
              category="passes"
              plan={plan}
              isProcessing={isProcessing}
              isSmallScreen={isSmallScreen}
              handlePurchase={handlePurchase}
              ref={plan.recommended ? recommendedPassRef : undefined}
            />
          ))}
        </div>

        <InfoPanel title={t('monetization.fair_use.title')}>
          <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
            {t('monetization.fair_use.description')}
          </p>
          <a
            href={localizedPath(language, `/terms?tab=terms`)}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-strong mt-3 flex items-center gap-1.5 text-xs font-bold transition-colors md:text-sm"
          >
            {t('monetization.fair_use.link')}
            <ArrowUpRight className="h-3 w-3 md:h-3.5 md:w-3.5" aria-hidden="true" />
          </a>
        </InfoPanel>
      </div>
    </DialogFrame>
  );
};
