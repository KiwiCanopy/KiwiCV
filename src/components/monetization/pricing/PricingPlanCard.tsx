import { forwardRef, useId } from 'react';

import { PLAN_ACCENT } from '@/components/monetization/pricing/accents';
import { formatPerDay, formatPrice } from '@/components/monetization/pricing/formatPrice';
import { type PricingPlan, type PricingTab } from '@/components/monetization/pricing/types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { ChevronRight } from 'lucide-react';

interface PricingPlanCardProps {
  category: PricingTab;
  plan: PricingPlan;
  isProcessing: string | null;
  isSmallScreen: boolean;
  handlePurchase: (lookupKey: string) => void;
}

/**
 * The one card the landing pricing section and the pricing dialog both render.
 * `ref` forwards to the card, not to the buy button: the dialog scrolls the
 * recommended card into view, and the button sits at the card's bottom edge. The
 * landing grid scrolls its container instead and passes none.
 */
export const PricingPlanCard = forwardRef<HTMLDivElement, PricingPlanCardProps>(
  function PricingPlanCard({ category, plan, isProcessing, isSmallScreen, handlePurchase }, ref) {
    // `bcp47`, not the bare code: `pt` alone is Brazilian, the app's pt is pt-PT.
    const { t, uiLocale } = useTranslation();
    const translationPath = `monetization.${category}.${plan.translationKey}`;
    const price = formatPrice(plan.priceCents, uiLocale.bcp47);
    const perDay = formatPerDay(plan.priceCents, plan.days, uiLocale.bcp47);
    const busy = Boolean(isProcessing);
    const titleId = useId();
    const ctaId = useId();

    /**
     * Passes are gold — the colour the account page has drawn them in since
     * before the token existed.
     *
     * ⚠️ This used to describe two families, gold passes beside emerald
     * credits, and the asymmetry between them was the point. With the credits
     * system removed there is one family, but the indirection stays: it is
     * `PLAN_ACCENT` that will refuse to compile when a second one is added.
     */
    // Keyed by category, so a new tier is a build error rather than a card
    // that silently renders in gold. See `PLAN_ACCENT`.
    const accent = PLAN_ACCENT[category];

    return (
      // Deliberately not a control. The whole card used to be the `<button>`,
      // which on the small-screen snap carousel meant a 260x220px purchase
      // target directly under a horizontal swipe: any swipe the browser
      // resolved as a tap opened checkout, or the login modal when logged out.
      // Only the buy button below starts the flow.
      <div
        ref={ref}
        className={cn(
          'group relative flex flex-col items-center rounded-2xl border transition-colors',
          isSmallScreen
            ? 'min-h-[220px] w-[260px] shrink-0 snap-center px-6 pt-8 pb-6'
            : 'min-h-[340px] w-full px-6 pt-10 pb-8',
          // ⚠️ The edge takes `--premium-deep` at FULL strength, not
          // `--premium/50`. Measured in the running app, `/50` composited to
          // 1.31:1 against the card while `--border` — which every other card
          // wears — sits at 1.22:1, so the accent meant to single this one out
          // was the default edge. `/60` was tried first and only reached
          // 1.51:1; alpha is the wrong lever, because gold is a light hue and
          // cannot clear 3:1 on a near-white card at any opacity. Full strength
          // is 1.94:1 — 1.6x the plain edge, which is separation you can see.
          //
          // ⚠️ Gold **borders** this card, it does not fill it: near-white with
          // a gold edge, a gold pill and a gradient CTA. (The account page's
          // premium cards are the same idea at a weaker weight — `border-premium/30`
          // — because nothing sits beside them to be confused with. Do not read
          // that as a shared value; there is no invariant tying the two.)
          // Filling the surface was
          // tried twice and is why: a dark gold fill is brown, and a flat light
          // gold fill is a yellow slab. Gold reads as gold when it is an accent
          // with depth on something light.
          //
          // ⚠️ And not `--primary`, which it was before. Marking the recommended
          // *plan* with the action colour is a category error — `--primary`
          // means "press this" — and it forced the card's own CTA to invert to
          // ink just to escape its background.
          plan.recommended
            ? cn('via-card to-card bg-gradient-to-br', accent.surface, accent.border)
            : 'bg-card border-border',
          // Every card dims while any checkout runs, so the dimming is on the
          // card; the pointer feedback belongs on the control that is inert.
          busy && 'opacity-60',
        )}
      >
        {/* Both badges take `text-background`, not `text-white`: the success and
            warning tokens invert between themes, and white on the light dark-mode
            green lands near 2:1 on 10px text. */}
        {plan.recommended && (
          // ⚠️ Was `bg-success`. Green means "it worked" — this badge names a
          // tier, not an outcome. It carries the gold instead, which is where the
          // gold belongs now that the card only wears it on its edge.
          <div
            className={cn(
              'ring-card absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full px-3 py-1 text-center text-[10px] font-bold tracking-wider uppercase shadow-[0_2px_4px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.5)] ring-4',
              accent.pill,
            )}
          >
            {t('monetization.recommended')}
          </div>
        )}
        <div
          className={cn(
            'mb-4 flex items-center justify-center rounded-xl',
            isSmallScreen ? 'h-10 w-10' : 'h-12 w-12',
            plan.recommended ? accent.well : 'bg-secondary',
          )}
        >
          {plan.icon}
        </div>
        <h3
          id={titleId}
          className={cn('leading-tight font-black', isSmallScreen ? 'text-base' : 'text-xl')}
        >
          {t(`${translationPath}.title`)}
        </h3>
        {/* `text-primary-foreground`, not `text-white`: dark-mode `--primary` is
            a light green, so white body copy on the recommended card measured
            1.65:1. Same reasoning as the badges above. `/90` rather than a
            rounder `/80` because dark mode is the tight side — `/80` measures
            4.46:1 against that green, just under AA for 14px. */}
        <p className={cn('mt-2 text-center text-sm leading-relaxed', 'text-muted-foreground')}>
          {t(`${translationPath}.description`)}
        </p>
        <div className="mt-auto flex flex-col items-center pt-6">
          <span className={cn('font-black', isSmallScreen ? 'text-2xl' : 'text-4xl')}>{price}</span>
          {perDay && (
            <span className="text-muted-foreground mt-1 text-sm font-medium">
              {t('monetization.per_day', { price: perDay })}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            if (!busy) handlePurchase(plan.id);
          }}
          // The button's own label is just "Buy now", which says nothing about
          // which plan it buys now that the card is no longer the control.
          // Pointing at the existing title needs no new translation key.
          aria-labelledby={`${titleId} ${ctaId}`}
          // `aria-disabled`, not native `disabled`, per the settled rule that a
          // control needing a busy state stays focusable. The handler is the only
          // thing that blocks a second purchase, so it must guard on `busy`.
          aria-disabled={busy || undefined}
          aria-busy={isProcessing === plan.id || undefined}
          className={cn(
            'mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-opacity',
            plan.recommended
              ? // ⚠️ Both this and the account page's Buy Pass button read `cta`
                // from `PLAN_ACCENT`, so they cannot drift. This comment used to
                // assert they matched by citing `amber-400`/`amber-500`/
                // `amber-950` — tokens none of them use any more, and a claim
                // nothing checked. The shared map is what makes it true.
                //
                // ⚠️ It is also the one gradient sanctioned in the product
                // chrome. `DESIGN_LANGUAGE.md` rules gradients out, and premium
                // is the standing exception because the shipped premium surface
                // already is one. Worth an argued wiki entry rather than
                // spreading by precedent.
                accent.pill
              : 'bg-primary text-primary-foreground',
            busy ? 'cursor-not-allowed' : 'hover:opacity-90',
          )}
        >
          {isProcessing === plan.id && (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {/* The label stays mounted while the spinner shows, only visually
              hidden: it is half of the button's `aria-labelledby`, so removing
              it would drop the control's name mid-checkout. */}
          <span id={ctaId} className={cn(isProcessing === plan.id && 'sr-only')}>
            {t('monetization.buy_now')}
          </span>
          {isProcessing !== plan.id && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);
