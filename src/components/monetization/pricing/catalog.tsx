import { type PricingPlan } from '@/components/monetization/pricing/types';
import { Calendar, Clock, Zap } from 'lucide-react';

// The single source for both the landing pricing section and the pricing dialog.
// Ids, lengths and prices must match the Stripe price behind each lookup key; the two
// surfaces used to keep divergent copies of this list.
export const passes: PricingPlan[] = [
  {
    id: 'pro_1_days',
    translationKey: '1_days',
    days: 1,
    priceCents: 299,
    icon: <Zap className="h-5 w-5" />,
  },
  {
    id: 'pro_7_days',
    translationKey: '7_days',
    days: 7,
    priceCents: 1399,
    icon: <Clock className="h-5 w-5" />,
    recommended: true,
  },
  {
    id: 'pro_30_days',
    translationKey: '30_days',
    days: 30,
    priceCents: 2999,
    icon: <Calendar className="h-5 w-5" />,
  },
];
