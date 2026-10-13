import { useState } from 'react';
import { SiGithub, SiKofi, SiX } from 'react-icons/si';
import { Link } from 'react-router-dom';

import { JsonLd } from '@/components/ui/JsonLd';
import { BRAND_CONFIG } from '@/config/brand';
import { RESPONSIBLE_NAME } from '@/constants/contact';
import { KIWICANOPY_URL, KIWICV_KOFI_URL, KIWICV_SOURCE_URL, KIWICV_X_URL } from '@/constants/urls';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';
import { LandingBadge } from '@/pages/LandingPage/components/LandingBadge';
import { LandingSection } from '@/pages/LandingPage/components/LandingSection';
import { localizedPath } from '@/utils/localeRouting';
import { toPlainText } from '@/utils/structured-data';
import { ArrowRight, ArrowUpRight, ChevronDown, FileInput } from 'lucide-react';

interface FAQProps {
  /** A non-empty CV is stored in this browser; the primary action then resumes it. */
  hasCv: boolean;
  onCreate: () => void;
  onImport: () => void;
}

export function FAQ({ hasCv, onCreate, onImport }: FAQProps) {
  const { t, tObject } = useTranslation();
  const lang = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const faqData =
    tObject<Record<string, { question: string; answer: string } | string>>(
      'landing.sections.faq',
    ) || {};

  // Every `q<n>` in the active locale renders. There is deliberately no cap:
  // a hardcoded one silently hid q6 and q7 — both written and translated in
  // all 15 locales — so adding a question meant editing this file too.
  const faqItems = Object.keys(faqData)
    .filter((key) => /^q\d+$/.test(key))
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
    .map((key) => faqData[key] as { question: string; answer: string });

  // FAQPage structured data, built from the same array the accordion renders
  // so the two can never disagree. Answers are stripped to plain text: Google
  // reads this JSON rather than the page, and q1 carries anchor markup and
  // paragraph breaks that would otherwise appear verbatim in the snippet.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: toPlainText(item.question),
      acceptedAnswer: { '@type': 'Answer', text: toPlainText(item.answer) },
    })),
  };

  return (
    <LandingSection id="faq" withBorder={false} className="pb-8 sm:pb-10">
      {faqItems.length > 0 && <JsonLd data={faqSchema} />}
      <div className="grid gap-12 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
        <div>
          <LandingBadge className="mx-0">{t('landing.closing.eyebrow')}</LandingBadge>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t('landing.sections.faq.title')}
          </h2>
        </div>

        <div className="border-border divide-border divide-y border-y">
          {faqItems.map((item, index) => {
            const isOpen = activeIndex === index;
            const panelId = `faq-panel-${index}`;

            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="text-foreground hover:text-primary-strong flex min-h-11 w-full items-center justify-between gap-5 py-5 text-left text-base font-semibold transition-colors sm:text-lg"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={panelId}
                  hidden={!isOpen}
                  className="text-muted-foreground max-w-[68ch] pb-6 text-sm leading-6 sm:text-base"
                >
                  <p dangerouslySetInnerHTML={{ __html: item.answer }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-secondary mt-16 rounded-3xl px-6 py-10 text-center sm:mt-24 sm:px-10 sm:py-14">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t('landing.closing.title')}
        </h2>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={onCreate} className="btn-primary min-h-11 gap-2 px-5 py-3">
            {hasCv ? t('cvs.continue_editing') : t('landing.closing.primary_action')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onImport}
            className="btn-outline bg-card min-h-11 gap-2 px-5 py-3"
          >
            <FileInput className="h-4 w-4" aria-hidden="true" />
            {t('landing.closing.secondary_action')}
          </button>
        </div>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={KIWICV_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border-input bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
          >
            <SiGithub className="h-4 w-4" aria-hidden="true" />
            GitHub
          </a>
          <a
            href={KIWICV_KOFI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border-input bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
          >
            <SiKofi className="h-4 w-4" aria-hidden="true" />
            {t('landing.closing.kofi')}
          </a>
        </div>
      </div>

      <footer className="border-border mt-12 flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link
            to={localizedPath(lang, `/privacy`)}
            className="text-muted-foreground hover:text-foreground"
          >
            {t('common.pages.privacy')}
          </Link>
          <Link
            to={localizedPath(lang, `/terms`)}
            className="text-muted-foreground hover:text-foreground"
          >
            {t('common.pages.terms')}
          </Link>
          <Link
            to={localizedPath(lang, `/withdrawal`)}
            className="text-muted-foreground hover:text-foreground"
          >
            {t('common.pages.withdrawal')}
          </Link>
          <Link
            to={localizedPath(lang, `/legal-notice`)}
            className="text-muted-foreground hover:text-foreground"
          >
            {t('common.pages.notice')}
          </Link>
          <a
            href={KIWICV_KOFI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
          >
            <SiKofi className="h-4 w-4" aria-hidden="true" />
            Ko-fi
          </a>
          <a
            href={KIWICV_X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
          >
            <SiX className="h-3.5 w-3.5" aria-hidden="true" />
            X.com
          </a>
          <a
            href={KIWICV_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
          >
            <SiGithub className="h-4 w-4" aria-hidden="true" />
            GitHub
          </a>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          {/* The logo is a second, redundant anchor to the same product: it gives
              the well-trained "click the brand logo" affordance a live target and
              a tap-sized hit area, while `aria-hidden`/`tabIndex={-1}` keep it out
              of the a11y tree so only the text link below is announced/focusable. */}
          <a
            href={KIWICANOPY_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-hidden="true"
            tabIndex={-1}
            className="shrink-0 transition-opacity hover:opacity-80"
          >
            {/* Intrinsic 96×78 — 2× the 48×40 box it paints into. It shipped at
                1536×1245 and 3 MB, on the marketing page, below the fold. */}
            <img
              src="/logos/kiwicv/KiwiCanopy.png"
              alt=""
              width={96}
              height={78}
              loading="lazy"
              decoding="async"
              className="h-10 w-12 object-contain"
            />
          </a>
          <div>
            {/* Underlined at rest (not hover-only) with an external-link icon: the
                block reads as a brand signature, so without a persistent cue it
                looks like static attribution rather than a link. */}
            <a
              href={KIWICANOPY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary-strong inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-2 transition-colors"
            >
              {BRAND_CONFIG.endorsedName}
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
            {/* The license link doubles as the AGPL § 13 source offer (owner ruling on
                the relicense); the GitHub links above point at the same repository. */}
            <p className="text-muted-foreground mt-0.5 text-xs">
              © {new Date().getFullYear()} {RESPONSIBLE_NAME} ·{' '}
              <a
                href={KIWICV_SOURCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground inline-flex items-center gap-1 underline underline-offset-2"
              >
                {t('common.footer.open_source')}
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </a>
            </p>
          </div>
        </div>
      </footer>
    </LandingSection>
  );
}
