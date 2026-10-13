import { useTranslation } from '@/hooks/useTranslation';
import { LandingBadge } from '@/pages/LandingPage/components/LandingBadge';
import { LandingSection } from '@/pages/LandingPage/components/LandingSection';
import { Cloud, FileInput, ScanSearch, Sparkles, SquarePen } from 'lucide-react';

const steps = [
  { key: 'create', icon: FileInput },
  { key: 'edit', icon: SquarePen },
  { key: 'tailor', icon: Sparkles },
  { key: 'preview', icon: ScanSearch },
  { key: 'export', icon: Cloud },
] as const;

export function Workflow() {
  const { t } = useTranslation();

  return (
    <LandingSection id="workflow">
      <div className="max-w-2xl">
        <LandingBadge className="mx-0">{t('landing.workflow.eyebrow')}</LandingBadge>
        <h2 className="mt-4 text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
          {t('landing.workflow.title')}
        </h2>
      </div>

      <ol className="border-border mt-12 grid gap-0 border-y md:grid-cols-5">
        {steps.map(({ key, icon: Icon }, index) => (
          <li
            key={key}
            className="border-border grid grid-cols-[2.75rem_1fr] gap-3 border-b py-5 last:border-b-0 md:block md:border-r md:border-b-0 md:px-5 md:py-7 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
          >
            <div className="bg-secondary text-primary-strong flex h-10 w-10 items-center justify-center rounded-lg">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="md:mt-5">
              <p className="text-muted-foreground text-xs font-semibold tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-1 font-extrabold">{t(`landing.workflow.${key}.title`)}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-5">
                {t(`landing.workflow.${key}.description`)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </LandingSection>
  );
}
