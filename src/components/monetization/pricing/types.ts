import type { ReactNode } from 'react';

/**
 * The paid families. One member since the credits system was removed — kept as
 * a union rather than inlined so `PLAN_ACCENT` stays a `Record` and a second
 * family is a build error until it is painted.
 */
export type PricingTab = 'passes';

export interface PricingPlan {
  id: string;
  translationKey: string;
  icon: ReactNode;
  /** Length of the Pass; the card divides the price by it. */
  days: number;
  /** What Stripe charges for this Pass's lookup key, in euro cents. */
  priceCents: number;
  recommended?: boolean;
}
