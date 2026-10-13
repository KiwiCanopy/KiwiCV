import { Link } from 'react-router-dom';

import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';
import { LandingBadge } from '@/pages/LandingPage/components/LandingBadge';
import { LandingSection } from '@/pages/LandingPage/components/LandingSection';
import { TestimonialPlacement } from '@/pages/LandingPage/testimonials/TestimonialQuote';
import { localizedPath } from '@/utils/localeRouting';
import { ArrowUpRight, CloudCog, Laptop, ShieldCheck } from 'lucide-react';

export function Privacy() {
  const { t } = useTranslation();
  const lang = useLanguage();

  return (
    <LandingSection id="privacy">
      <div className="bg-card border-border grid overflow-hidden rounded-3xl border shadow-[var(--elevation-1)] lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.62fr)]">
        <div className="p-7 sm:p-10 lg:p-12">
          <LandingBadge className="mx-0">{t('landing.privacy.eyebrow')}</LandingBadge>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t('landing.privacy.title')}
          </h2>
          <p className="text-muted-foreground mt-5 max-w-[62ch] text-base leading-7 sm:text-lg">
            {t('landing.privacy.summary')}
          </p>
          <Link
            to={localizedPath(lang, `/privacy?tab=privacy`)}
            className="text-primary-strong decoration-mist mt-7 inline-flex min-h-11 items-center gap-2 py-2 text-sm font-semibold underline decoration-2 underline-offset-4"
          >
            {t('landing.privacy.learn_more')}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <TestimonialPlacement
            claim="privacy"
            className="border-border mt-8 max-w-[62ch] border-t pt-8"
          />
        </div>

        <div className="bg-secondary border-border grid content-center gap-6 border-t p-7 lg:border-t-0 lg:border-l lg:p-10">
          <div className="flex gap-4">
            <Laptop className="text-primary-strong mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">{t('dashboard.saved_on_device')}</p>
              <p className="text-muted-foreground mt-1 text-sm leading-5">
                {t('landing.proof.ownership.description')}
              </p>
            </div>
          </div>
          <div className="border-border flex gap-4 border-t pt-6">
            <CloudCog className="text-primary-strong mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">{t('dashboard.backup')}</p>
              <p className="text-muted-foreground mt-1 text-sm leading-5">
                {t('welcome.cloud_sync_desc')}
              </p>
              <p className="text-foreground mt-2 text-xs font-semibold">
                {t('sync.google_drive_title')} · {t('sync.github_title')}
              </p>
            </div>
          </div>
          {/* The one privacy claim the page did not already make anywhere: the
              summary above says the AI is "optional" but never says where it
              runs. `VERTEX_CONFIG.REGION` is 'eu' and Google does not train on
              the input, and both are worth stating outright. */}
          <div className="border-border flex gap-4 border-t pt-6">
            <ShieldCheck
              className="text-primary-strong mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold">{t('landing.privacy.ai_title')}</p>
              <p className="text-muted-foreground mt-1 text-sm leading-5">
                {t('landing.privacy.ai_description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
