import { PricingPlanCard } from '@/components/monetization/pricing/PricingPlanCard';
import { passes } from '@/components/monetization/pricing/catalog';
import type { PricingTab } from '@/components/monetization/pricing/types';
import { useTranslation } from '@/hooks/useTranslation';
import { type PricingPlansProps } from '@/pages/LandingPage/sections/pricing/types';
import { cn } from '@/utils/cn';
import { ArrowUpRight, Zap } from 'lucide-react';

function PlansGrid({
  category,
  handlePurchase,
  isProcessing,
  isSmallScreen,
  plans,
  scrollContainerRef,
}: PricingPlansProps & {
  category: PricingTab;
  plans: typeof passes;
}) {
  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        isSmallScreen
          ? 'clean-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pt-2 pb-6'
          : 'grid grid-cols-1 gap-6 md:grid-cols-3',
      )}
    >
      {plans.map((plan) => (
        <PricingPlanCard
          key={plan.id}
          category={category}
          plan={plan}
          isSmallScreen={isSmallScreen}
          isProcessing={isProcessing}
          handlePurchase={handlePurchase}
        />
      ))}
    </div>
  );
}

export function PassPlans(props: PricingPlansProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <PlansGrid {...props} category="passes" plans={passes} />
      <div className="bg-card border-border rounded-2xl border p-6 md:p-8">
        <h3 className="text-foreground flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <Zap className="text-primary-strong h-5 w-5" />
          {t('monetization.fair_use.title')}
        </h3>
        <div className="border-border/40 my-4 border-b" />
        <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
          {t('monetization.fair_use.description')}
        </p>
        <a
          href={`/${props.language}/terms?tab=terms`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary-strong text-muted-foreground mt-4 flex w-fit items-center gap-1.5 text-xs font-bold transition-colors md:text-sm"
        >
          {t('monetization.fair_use.link')}
          <ArrowUpRight className="h-3 w-3 md:h-3.5 md:w-3.5" />
        </a>
      </div>
    </div>
  );
}
