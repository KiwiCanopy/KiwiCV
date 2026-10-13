import { useCallback, useEffect, useRef, useState } from 'react';

import { passes } from '@/components/monetization/pricing/catalog';
import { BREAKPOINTS } from '@/constants/breakpoints';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { purchaseService } from '@/services/purchase';
import { useFlowStore } from '@/store/ui/useFlowStore';

export function usePricing() {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const openGoogleLogin = useFlowStore((state) => state.openGoogleLogin);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const isSmallScreen = useMediaQuery(`(max-width: ${BREAKPOINTS.MD - 1}px)`);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToRecommended = useCallback(() => {
    if (!isSmallScreen || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const recommendedCard = container.children[passes.findIndex((plan) => plan.recommended)] as
      HTMLElement | undefined;
    if (!recommendedCard) return;

    const targetScrollLeft =
      recommendedCard.offsetLeft - (container.clientWidth - recommendedCard.clientWidth) / 2;
    container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
  }, [isSmallScreen]);

  useEffect(() => {
    const timer = window.setTimeout(scrollToRecommended, 100);
    return () => window.clearTimeout(timer);
  }, [isSmallScreen, scrollToRecommended]);

  const handlePurchase = async (lookupKey: string) => {
    if (!user) {
      analytics.track(ANALYTICS_EVENTS.AUTH_MODAL_OPENED, {
        source: 'landing_pricing_section',
        reason: `purchase_${lookupKey}`,
      });
      openGoogleLogin({
        source: 'landing_try_ai',
        description: t('landing.sections.pricing_section.auth_desc'),
      });
      return;
    }

    analytics.track(ANALYTICS_EVENTS.CHECKOUT_STARTED, {
      packageId: lookupKey,
      source: 'landing_pricing_section',
    });
    setIsProcessing(lookupKey);

    try {
      const returnPath = window.location.pathname + window.location.search;
      await purchaseService.purchasePackage(lookupKey, user.id, returnPath);
    } catch (error) {
      console.error('Purchase failed:', error);
      setIsProcessing(null);
    }
  };

  return {
    handlePurchase,
    isProcessing,
    isSmallScreen,
    language,
    scrollContainerRef,
    t,
  };
}
