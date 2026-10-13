import React from 'react';

import { PLAN_ACCENT } from '@/components/monetization/pricing/accents';
import { useTranslation } from '@/hooks/useTranslation';
import type { Profile } from '@/providers/AuthContext';
import { cn } from '@/utils/cn';
import { ChevronRight, Crown, LoaderCircle } from 'lucide-react';

// The premium CTA keeps its gold identity to match its card, but comes off the
// legacy btn-3d bottom-shadow onto a flat fill.
//
// ⚠️ It reads from a token rather than a raw Tailwind hue. `--premium` is the
// same value the pricing section uses, so a pass card and a pass plan are
// finally the same gold — the two surfaces used to drift.
//
// ⚠️ Scope: the gold half only. The expired and free states below now take
// semantic tokens too, which needed a decision rather than a sweep.
//
// ⚠️ Expired is `--destructive`, NOT a bespoke `--expired`. It is duller than
// the old `rose-500` on purpose: an expired pass is a lapsed state, not an
// error demanding action, and a bright alarm red over-signalled it. A second
// token meaning "this ended" would duplicate what `--destructive` already owns,
// which is how a palette grows two words for one idea.
//
// ⚠️ Free is `--info`, a token that did not exist before this change. Nothing is
// wrong with being on the free plan, so `--warning` and `--destructive` both
// over-signal it, and there was no neutral-notice colour in the palette at all.
// That absence is why the raw `blue-500` had nowhere to go.
//
// ⚠️ `slate-*` is gone with them. It was a cool grey in a warm-neutral palette,
// visible as a blue cast on the empty-state card; `--muted-foreground` is the
// family's own neutral.
// ⚠️ The CTA comes from `PLAN_ACCENT`, not from a local constant. It used to be
// declared here AND in `PricingPlanCard`, with a comment in the latter
// asserting the two gradients matched — a claim nothing checked.
const GOLD_CTA = PLAN_ACCENT.passes.cta;
const CTA_BASE =
  'flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] font-black tracking-widest uppercase shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98]';

interface BillingSectionProps {
  profile: Profile | null;
  isVerifyingPayment: boolean;
  openPricing: () => void;
  formatUIDate: (date: string) => string;
}

export const BillingSection: React.FC<BillingSectionProps> = ({
  profile,
  isVerifyingPayment,
  openPricing,
  formatUIDate,
}) => {
  const { t } = useTranslation();
  const hasNeverHadAPass = !profile?.isPremium && !profile?.premium_until;

  return (
    <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-border border-b px-6 py-4 md:px-8">
        <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-extrabold tracking-wider uppercase">
          <Crown className="text-premium-deep h-4 w-4" />
          {t('auth.premium_overview')}
        </h3>
      </div>

      <div className="p-6 md:p-8">
        {/* SVG Gradients for Icons */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="premium-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--premium))" />
              <stop offset="100%" stopColor="hsl(var(--premium-deep))" />
            </linearGradient>
          </defs>
        </svg>

        {/* ⚠️ One card, not a two-column grid. This sat beside a credits-balance
            card until the credits system was removed; `sm:grid-cols-2` with a
            single child left the pass card at half width against dead space. */}
        <div>
          {/* Account Tier */}
          <div
            className={cn(
              'group relative flex flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl',
              profile?.isPremium
                ? 'via-background to-background border-premium/30 from-premium/10 shadow-premium/5 hover:shadow-premium/10 bg-gradient-to-br'
                : profile?.premium_until
                  ? 'via-background to-background border-destructive/25 from-destructive/10 bg-gradient-to-br'
                  : 'border-premium/15 shadow-sm',
            )}
          >
            {/* Background Layers for Smooth Empty State Transition */}
            {!profile?.premium_until && (
              <>
                <div className="from-premium/5 via-muted/40 to-muted/40 dark:from-premium/20 absolute inset-0 bg-gradient-to-br transition-opacity duration-500 group-hover:opacity-0" />
                <div className="via-background to-background from-premium/15 dark:from-premium/30 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </>
            )}

            {/* Decorative Background Icon */}
            <Crown
              className={cn(
                'absolute -top-8 -right-8 h-32 w-32 -rotate-12 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6',
                profile?.isPremium
                  ? 'text-premium/15'
                  : 'text-muted-foreground/15 group-hover:text-premium/15',
              )}
              style={{ fill: profile?.isPremium ? 'url(#premium-gradient)' : 'none' }}
            />

            <div className="relative z-10 mb-4 flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-black tracking-widest uppercase">
                {t('common.premium_pass')}
              </span>
              <div
                className={cn(
                  'rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase transition-all duration-500',
                  'shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.5)]',
                  profile?.isPremium
                    ? 'from-premium/85 to-premium-deep/85 text-premium-foreground ring-premium/30 bg-gradient-to-br ring-1'
                    : profile?.premium_until
                      ? 'bg-destructive/10 text-destructive ring-destructive/25 ring-1'
                      : 'bg-info/10 text-info ring-info/25 ring-1',
                )}
              >
                {profile?.isPremium
                  ? t('auth.status_active')
                  : profile?.premium_until
                    ? t('auth.status_expired')
                    : t('auth.status_none')}
              </div>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  {t('account.status')}
                </span>
                <div
                  className={cn(
                    'rounded-md px-2 py-0.5 text-[10px] font-black tracking-widest uppercase transition-all duration-500',
                    'shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.5)]',
                    profile?.isPremium
                      ? 'from-premium/85 to-premium-deep/85 text-premium-foreground ring-premium/30 bg-gradient-to-br ring-1'
                      : 'bg-muted-foreground/10 text-muted-foreground group-hover:bg-premium/85 group-hover:text-premium-foreground group-hover:ring-premium/20 group-hover:ring-1',
                  )}
                >
                  {profile?.isPremium ? t('account.status_pro') : t('account.status_free')}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  {t('account.valid_until')}
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      'text-3xl font-black tracking-tighter transition-colors duration-500 sm:text-4xl',
                      !profile?.premium_until &&
                        'text-muted-foreground/30 group-hover:text-foreground',
                    )}
                  >
                    {profile?.premium_until ? formatUIDate(profile.premium_until) : '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-auto flex justify-end pt-8">
              {isVerifyingPayment ? (
                <div className="bg-warning/10 text-warning ring-warning/20 flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black tracking-widest uppercase ring-1">
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  {t('monetization.processing_order')}
                </div>
              ) : (
                <button
                  onClick={openPricing}
                  className={cn(CTA_BASE, GOLD_CTA, hasNeverHadAPass && 'animate-heavenly-glow')}
                >
                  {!profile?.premium_until
                    ? t('account.get_premium')
                    : profile?.isPremium
                      ? t('account.extend')
                      : t('account.renew')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
