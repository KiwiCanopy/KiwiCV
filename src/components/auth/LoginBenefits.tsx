import { type InfoCardColor } from '@/components/ui/InfoCard';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { Cloud, ShieldCheck, Sparkles } from 'lucide-react';

interface Benefit {
  icon: typeof Sparkles;
  title: string;
  desc: string;
  color: InfoCardColor;
}

interface LoginBenefitsProps {
  requireDrive?: boolean;
}

/**
 * Desktop only, by design. There used to be a compacted `InfoCard` badge grid
 * below `md`; even compacted, two or three cards plus their titles pushed the
 * sign-in buttons off a short phone viewport. Selling the product to someone
 * who has already opened the login modal is landing-page work.
 */
export const LoginBenefits: React.FC<LoginBenefitsProps> = ({ requireDrive = false }) => {
  const { t } = useTranslation();

  const marketingBenefits: Benefit[] = [
    ...(requireDrive
      ? [
          {
            icon: Cloud,
            title: t('auth.benefit_sync_title'),
            desc: t('auth.benefit_sync_desc'),
            color: 'brand' as const,
          },
        ]
      : []),
    {
      // These three used to be hue-coded (blue / purple / emerald) so they read
      // as separate cards. That was the ten-hue rainbow DESIGN_LANGUAGE.md
      // rules out: none of them is a status, so none of them earns a color of
      // its own. Icon and title carry the distinction now.
      icon: Sparkles,
      title: t('auth.benefit_ai_title'),
      desc: t('auth.benefit_ai_desc'),
      color: 'brand' as const,
    },
    {
      icon: ShieldCheck,
      title: t('auth.benefit_privacy_title'),
      desc: t('auth.benefit_privacy_desc'),
      color: 'brand' as const,
    },
  ];

  const desktopBenefits = requireDrive
    ? [marketingBenefits[1], marketingBenefits[0], marketingBenefits[2]]
    : marketingBenefits;

  const desktopColorMap: Record<InfoCardColor, { text: string; bg: string }> = {
    brand: { text: 'text-primary-strong', bg: 'bg-primary/10' },
    neutral: { text: 'text-muted-foreground', bg: 'bg-muted/40' },
    success: { text: 'text-success', bg: 'bg-success/10' },
    warning: { text: 'text-warning', bg: 'bg-warning/10' },
    danger: { text: 'text-danger', bg: 'bg-danger/10' },
  };

  return (
    <div className="relative hidden space-y-8 md:block">
      {desktopBenefits.map((benefit, idx) => {
        const colors = desktopColorMap[benefit.color];
        return (
          <div
            key={idx}
            className="group flex items-start gap-5 transition-transform duration-300 hover:translate-x-1"
          >
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-all group-hover:scale-110 group-hover:rotate-3',
                colors.bg,
                colors.text,
              )}
            >
              <benefit.icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-foreground mb-1.5 leading-none font-extrabold">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed antialiased">
                {benefit.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
