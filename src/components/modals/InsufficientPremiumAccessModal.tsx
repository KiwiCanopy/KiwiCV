import React from 'react';

import { PricingDialog } from '@/components/monetization/PricingDialog';
import { DialogFrame, DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { CircleAlert, Crown, Sparkles } from 'lucide-react';

interface InsufficientPremiumAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'generic' | 'limit';
}

export const InsufficientPremiumAccessModal: React.FC<InsufficientPremiumAccessModalProps> = ({
  isOpen,
  onClose,
  mode = 'generic',
}) => {
  const { t } = useTranslation();
  const [isPricingOpen, setIsPricingOpen] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      analytics.track(ANALYTICS_EVENTS.PAYWALL_SHOWN, { mode });
    }
  }, [isOpen, mode]);

  const openPricing = () => {
    analytics.track(ANALYTICS_EVENTS.PAYWALL_OPTION_SELECTED, { mode });
    setIsPricingOpen(true);
  };

  const title =
    mode === 'limit'
      ? t('ai.insufficient_premium_access_limit_title')
      : t('ai.insufficient_premium_access_title');

  const description =
    mode === 'limit'
      ? t('ai.insufficient_premium_access_limit_desc')
      : t('ai.insufficient_premium_access_desc');

  return (
    <>
      <DialogFrame
        open={isOpen}
        onOpenChange={(open, reason) => {
          if (open) return;
          // Only the X button reported PAYWALL_CLOSED before this migration;
          // Escape closed silently. `reason` preserves that split.
          if (reason === 'close-button') {
            analytics.track(ANALYTICS_EVENTS.PAYWALL_CLOSED, { mode, method: 'x_button' });
          }
          onClose();
        }}
        maxWidth="md"
        zIndexClassName="z-[80]"
        header={
          <div className="flex items-center gap-3 pt-6 pr-14 pb-2 pl-6 md:pr-16">
            <div className="from-warning/20 to-warning/5 text-warning ring-warning/20 flex items-center justify-center rounded-xl bg-linear-to-br p-2.5 ring-1">
              <Sparkles className="h-5 w-5" />
            </div>
            <DialogFrameTitle className="text-foreground text-lg font-black tracking-tight">
              {title}
            </DialogFrameTitle>
          </div>
        }
      >
        {/* Content */}
        <div className="p-6 pt-4 text-center sm:p-10 sm:pt-4">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-linear-to-br from-amber-500/20 to-amber-500/5 shadow-[0_8px_16px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/20">
            <CircleAlert className="text-warning h-8 w-8" />
          </div>

          <DialogFrameDescription className="text-muted-foreground/80 mx-auto max-w-[280px] text-sm leading-relaxed sm:max-w-none">
            {description}
          </DialogFrameDescription>

          {/* ⚠️ `limit` deliberately offers NO action. This used to show a
              "Top Up Credits" button — the only button it showed in that mode —
              and buying a second Pass does nothing for a spent daily allowance.
              The honest answer is to explain and wait, so the mode renders the
              description alone. */}
          {mode !== 'limit' && (
            <div className="mt-8 grid gap-4">
              <button
                type="button"
                onClick={openPricing}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-4 text-sm font-bold text-amber-950 transition-all hover:scale-[1.02] hover:from-amber-500 hover:to-amber-600 focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:outline-none"
              >
                <Crown className="h-4 w-4 transition-transform group-hover:rotate-12" />
                {t('ai.insufficient_premium_access_get_pass')}
              </button>
            </div>
          )}
        </div>
      </DialogFrame>

      <PricingDialog
        isOpen={isPricingOpen}
        onClose={() => {
          setIsPricingOpen(false);
          onClose(); // Close this modal too when pricing is closed
        }}
      />
    </>
  );
};
