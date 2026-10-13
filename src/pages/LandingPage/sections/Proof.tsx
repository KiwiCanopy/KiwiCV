import { useTranslation } from '@/hooks/useTranslation';
import { LandingBadge } from '@/pages/LandingPage/components/LandingBadge';
import { LandingSection } from '@/pages/LandingPage/components/LandingSection';
import { CopyPlus, FileJson2, Languages, LayoutTemplate } from 'lucide-react';

const proofItems = [
  { key: 'templates', icon: LayoutTemplate },
  { key: 'versions', icon: CopyPlus },
  // ⚠️ Reading any language is a shipped capability that appeared NOWHERE on the
  // landing page — `landing.ts` had no occurrence of "language" or "translate"
  // at all. For someone whose CV is not in English it is a disqualifying
  // question, so it was silently costing visits.
  { key: 'languages', icon: Languages },
  { key: 'ownership', icon: FileJson2 },
] as const;

export function Proof() {
  const { t } = useTranslation();

  return (
    <LandingSection id="proof" className="bg-secondary">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div>
          <LandingBadge className="mx-0">{t('landing.proof.eyebrow')}</LandingBadge>
          <h2 className="mt-4 max-w-lg text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
            {t('landing.proof.title')}
          </h2>
        </div>

        <div className="border-border divide-border divide-y border-y">
          {proofItems.map(({ key, icon: Icon }) => (
            <article key={key} className="grid grid-cols-[3rem_1fr] gap-4 py-7 sm:py-8">
              <div className="bg-card text-primary-strong flex h-11 w-11 items-center justify-center rounded-xl shadow-[var(--elevation-1)]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold">{t(`landing.proof.${key}.title`)}</h3>
                <p className="text-muted-foreground mt-1 max-w-[52ch] leading-6">
                  {t(`landing.proof.${key}.description`)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}
