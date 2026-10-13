import { LandingBadge } from '@/pages/LandingPage/components/LandingBadge';
import { LandingSection } from '@/pages/LandingPage/components/LandingSection';
import { PassPlans } from '@/pages/LandingPage/sections/pricing/PricingPlans';
import { usePricing } from '@/pages/LandingPage/sections/pricing/usePricing';
import { TestimonialPlacement } from '@/pages/LandingPage/testimonials/TestimonialQuote';
import { Check, ShieldCheck, Sparkles } from 'lucide-react';

const FREE_ITEMS = ['editor', 'templates', 'export', 'sync'] as const;
const PASS_ITEMS = ['tailor', 'keywords', 'letter', 'improve', 'translate', 'import'] as const;

export function Pricing() {
  const pricing = usePricing();
  // Destructured so the i18n call-site scan sees these keys; it reads bare `t(…)` only.
  const { t } = pricing;
  const planProps = {
    handlePurchase: pricing.handlePurchase,
    isProcessing: pricing.isProcessing,
    isSmallScreen: pricing.isSmallScreen,
    language: pricing.language,
    scrollContainerRef: pricing.scrollContainerRef,
  };

  return (
    <LandingSection id="pricing" containerClassName="max-w-5xl">
      <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
        <LandingBadge>{t('landing.pricing.eyebrow')}</LandingBadge>
        <h2 className="text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t('landing.pricing.title')}
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-base sm:text-lg">
          {t('landing.pricing.subtitle')}
        </p>
      </div>

      {/* Before the prices, so a price is never read as the price of the whole
          tool: the editor is free, and a Pass buys only the AI. Columns under
          headings, not cards — the plan grid below spends the card budget. */}
      <div className="mx-auto mb-10 grid max-w-3xl gap-8 sm:mb-12 sm:grid-cols-2">
        <div>
          <h3 className="text-foreground text-base font-bold">{t('landing.pricing.free.title')}</h3>
          <ul className="mt-3 space-y-2">
            {FREE_ITEMS.map((item) => (
              <li key={item} className="text-muted-foreground flex gap-2 text-sm leading-6">
                <Check className="text-primary-strong mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                {t(`landing.pricing.free.${item}`)}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-foreground text-base font-bold">{t('landing.pricing.pass.title')}</h3>
          <ul className="mt-3 space-y-2">
            {PASS_ITEMS.map((item) => (
              <li key={item} className="text-muted-foreground flex gap-2 text-sm leading-6">
                <Sparkles
                  className="text-primary-strong mt-1 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                {t(`landing.pricing.pass.${item}`)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ⚠️ No family toggle. Passes shared this section with a credits tab
          until the credits system was removed; a toggle with one option is a
          control that cannot be operated. */}
      <div className="space-y-8">
        <PassPlans {...planProps} />
      </div>

      {/* Third-party word on the Pass price, read right after the price it vouches for. */}
      <TestimonialPlacement claim="pricing" className="mx-auto mt-12 max-w-2xl sm:mt-14" />

      {/* Deliberately after the plans: it
          answers the objection at the moment it exists — once a price has been
          read — and can never reflow between a price and its Buy button. As a
          divider-topped strip rather than a card, because every other section
          on this page groups with dividers and the plan grid already spends
          the page's card budget. */}
      <div className="border-border mt-12 border-t pt-8 sm:mt-14">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
          <ShieldCheck
            className="text-primary-strong h-5 w-5 shrink-0 sm:mt-0.5"
            aria-hidden="true"
          />
          <p className="text-muted-foreground text-sm leading-6">
            <span className="text-foreground font-semibold">
              {t('landing.pricing.promise_title')}
            </span>{' '}
            {t('landing.pricing.promise_paywall')}
          </p>
        </div>
      </div>
    </LandingSection>
  );
}
