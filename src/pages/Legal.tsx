import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import licensesData from '@/assets/licenses.json';
import { AccordionItem } from '@/components/ui/Accordion';
import { DialogFrame } from '@/components/ui/DialogFrame';
import { FormattedText } from '@/components/ui/FormattedText';
import { PageContainer } from '@/components/ui/PageContainer';
import { Section } from '@/components/ui/Section';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { KIWICV_SOURCE_URL } from '@/constants/urls';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';
import { useUIStore } from '@/store/ui/useUIStore';
import { interpolateLegalTemplate } from '@/utils/legal';
import { localizedPath } from '@/utils/localeRouting';
import { ArrowUpRight, FileText, RotateCcw, ShieldCheck } from 'lucide-react';

type LegalTabId = 'privacy' | 'terms' | 'withdrawal';

export function Legal() {
  const { t, tObject } = useTranslation();
  const lang = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const uiLanguage = useUIStore((state) => state.appLanguage);
  const [isLicensesOpen, setIsLicensesOpen] = useState(false);

  // Determine active tab from URL path first, then fallback to search param
  const activeTab = useMemo(() => {
    if (location.pathname.includes('/terms')) return 'terms';
    if (location.pathname.includes('/withdrawal')) return 'withdrawal';
    if (location.pathname.includes('/privacy')) return 'privacy';
    return (searchParams.get('tab') as LegalTabId) || 'privacy';
  }, [location.pathname, searchParams]);

  const setActiveTab = (tab: LegalTabId) => {
    navigate(localizedPath(lang, `/${tab}`), { replace: true });
  };

  interface SubSection {
    title: string;
    content: string;
    link?: {
      text: string;
      url: string;
    };
  }

  interface Chapter {
    title: string;
    [key: string]: string | SubSection;
  }

  const legalData = tObject<{
    title: string;
    sections: Record<string, Chapter>;
  }>(`legal.${activeTab}`);

  if (!legalData) return null;

  const tabs = [
    {
      id: 'privacy',
      label: t('legal.privacy.tabLabel'),
      icon: ShieldCheck,
    },
    {
      id: 'terms',
      label: t('legal.terms.tabLabel'),
      icon: FileText,
    },
    {
      id: 'withdrawal',
      label: t('legal.withdrawal.tabLabel'),
      icon: RotateCcw,
    },
  ];

  return (
    <PageContainer className="px-4 py-12 sm:px-6">
      {/* Tab Navigation */}
      <div className="mb-12 flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary-strong rounded-lg p-2">
            {activeTab === 'privacy' && <ShieldCheck className="h-6 w-6" />}
            {activeTab === 'withdrawal' && <RotateCcw className="h-6 w-6" />}
            {activeTab === 'terms' && <FileText className="h-6 w-6" />}
          </div>
          <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-4xl">
            {legalData.title}
          </h1>
        </div>

        <div className="w-full max-w-md">
          <SegmentedToggle
            value={activeTab}
            onChange={(val) => setActiveTab(val as LegalTabId)}
            options={tabs.map((tab) => ({
              value: tab.id,
              label: tab.label,
              icon: <tab.icon className="h-4 w-4" />,
            }))}
          />
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(legalData.sections)
          .sort(([keyA], [keyB]) => {
            // For sections named "1", "2", etc.
            const numA = parseInt(keyA) || 0;
            const numB = parseInt(keyB) || 0;
            if (numA !== 0 || numB !== 0) return numA - numB;
            return keyA.localeCompare(keyB);
          })
          .map(([key, chapter]) => (
            <Section key={key} title={chapter.title || ''}>
              <div className="space-y-6">
                {(Object.entries(chapter) as [string, string | SubSection][]).map(
                  ([subKey, section]) => {
                    if (subKey === 'title') return null;

                    if (typeof section === 'string') {
                      return (
                        <FormattedText key={subKey} content={interpolateLegalTemplate(section)} />
                      );
                    }

                    return (
                      <div key={subKey} className="space-y-4">
                        <h4 className="text-foreground font-bold">{section.title}</h4>
                        <FormattedText content={interpolateLegalTemplate(section.content)} />
                        {section.link && (
                          <div className="flex justify-start pt-2">
                            <a
                              href={section.link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-strong inline-flex items-center font-medium hover:underline"
                            >
                              {section.link.text}
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </Section>
          ))}
      </div>

      <div className="mt-16 flex flex-col items-center gap-4">
        {uiLanguage !== 'de' && t('legal.translation_note') && (
          <p className="text-muted-foreground bg-muted/30 border-border/50 rounded-lg border p-4 text-center text-sm italic">
            {t('legal.translation_note')}
          </p>
        )}

        {/* DialogFrame owns Dialog.Root, so there is no Dialog.Trigger to compose
            against — the link drives the same state the frame reads. */}
        <button
          type="button"
          onClick={() => setIsLicensesOpen(true)}
          className="text-muted-foreground hover:text-foreground text-xs font-medium underline-offset-4 hover:underline"
        >
          {t('legal.licenses.title')}
        </button>

        <DialogFrame
          open={isLicensesOpen}
          onOpenChange={setIsLicensesOpen}
          title={t('legal.licenses.title')}
          description={t('legal.licenses.description')}
          maxWidth="2xl"
          zIndexClassName="z-50"
        >
          {/* KiwiCV's own licence; the link is the AGPL § 13 source offer, as in the footer. */}
          <p className="mb-4 text-sm">
            <a
              href={KIWICV_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary-strong inline-flex items-center gap-1 font-medium underline underline-offset-2"
            >
              {t('common.footer.open_source')}
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
          </p>
          <div className="space-y-3">
            {Object.entries(licensesData).map(([id, pkg]) => (
              <AccordionItem
                key={id}
                title={pkg.name}
                subtitle={`${pkg.version} • ${pkg.licenses}`}
              >
                <div className="space-y-4">
                  {pkg.copyright && (
                    <p className="text-foreground/80 text-sm font-semibold">{pkg.copyright}</p>
                  )}
                  <pre className="bg-muted/50 text-muted-foreground rounded-lg p-4 font-mono text-[10px] leading-relaxed whitespace-pre-wrap">
                    {pkg.licenseText}
                  </pre>
                </div>
              </AccordionItem>
            ))}
          </div>
        </DialogFrame>
      </div>
    </PageContainer>
  );
}
