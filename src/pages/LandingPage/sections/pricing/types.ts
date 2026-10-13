import type { RefObject } from 'react';

export type { PricingPlan, PricingTab } from '@/components/monetization/pricing/types';

export interface PricingPlansProps {
  handlePurchase: (lookupKey: string) => Promise<void>;
  isProcessing: string | null;
  isSmallScreen: boolean;
  language: string;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}
