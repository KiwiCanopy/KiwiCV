import type { PricingTab } from '@/components/monetization/pricing/types';

/**
 * How each paid family paints itself. Gold, for the one family there is.
 *
 * ⚠️ **Keyed by `PricingTab`, and that is the whole point.** These five strings
 * used to be four `isCredits ? … : …` ternaries in `PricingPlanCard` plus a
 * separate pair of CTA constants on the account page. With two members in the
 * union, `: ` silently meant "passes" — so a third tier would have compiled
 * clean, passed lint and tests, and rendered in gold. A wrong-but-plausible
 * result is the worst failure shape, and a `Record<PricingTab, …>` turns it
 * into a build error instead.
 *
 * ⚠️ It also collapses a duplicate. `PricingPlanCard` carried a comment saying
 * its pill used "the same gradient as the account page's Buy Pass button" — a
 * comment asserting two files agreed, with nothing checking. Both now read
 * `cta`/`pill` from here, so the claim is structural rather than aspirational.
 *
 * ⚠️ `border` is at full strength rather than tinted: `--premium` is
 * `43 92% 58%` and tops out near 2.1:1 on a near-white card at any opacity, so
 * a `/50` gold edge would not separate from the surface at all.
 *
 * ⚠️ The `Record` is kept now that only `passes` remains. It costs one line and
 * it is what will fail loudly when a second family is added — which is how the
 * credits family stayed correctly painted for as long as it existed.
 */
export interface PlanAccent {
  /** Gradient origin for the card's tinted surface. */
  surface: string;
  /** The card's edge when it is the recommended plan. */
  border: string;
  /** The icon well behind the plan's glyph. */
  well: string;
  /** The "recommended" pill. */
  pill: string;
  /** The buy button, shared with the account page's billing card. */
  cta: string;
}

export const PLAN_ACCENT: Record<PricingTab, PlanAccent> = {
  passes: {
    surface: 'from-premium/10',
    border: 'border-premium-deep',
    well: 'bg-premium/20',
    pill: 'from-premium to-premium-deep text-premium-foreground bg-gradient-to-r',
    cta: 'bg-gradient-to-r from-premium to-premium-deep text-premium-foreground hover:from-premium-deep hover:to-premium-deep focus-visible:ring-premium/50',
  },
};
