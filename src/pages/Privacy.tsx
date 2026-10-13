import { FormattedText } from '@/components/ui/FormattedText';
import { PageContainer } from '@/components/ui/PageContainer';
import { Section } from '@/components/ui/Section';
import { useTranslation } from '@/hooks/useTranslation';
import { useUIStore } from '@/store/ui/useUIStore';
import { ShieldCheck } from 'lucide-react';

export function Privacy() {
  const { t, tObject } = useTranslation();
  const uiLanguage = useUIStore((state) => state.appLanguage);

  interface PrivacySubSection {
    title: string;
    content: string;
    link?: {
      text: string;
      url: string;
    };
  }

  interface PrivacyChapter {
    title: string;
    [key: string]: string | PrivacySubSection;
  }

  const privacyData = tObject<{
    title: string;
    sections: Record<string, PrivacyChapter>;
  }>('legal.privacy');

  if (!privacyData) return null;

  return (
    <PageContainer className="px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-primary/10 text-primary-strong rounded-lg p-2">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
          {privacyData.title}
        </h1>
      </div>

      <div className="space-y-8">
        {Object.entries(privacyData.sections)
          .sort(([, a], [, b]) => {
            const numA = parseInt(a.title) || 0;
            const numB = parseInt(b.title) || 0;
            return numA - numB;
          })
          .map(([key, chapter]) => (
            <Section key={key} title={chapter.title}>
              <div className="space-y-6">
                {Object.entries(chapter).map(([subKey, section]) => {
                  if (subKey === 'title') return null;

                  if (typeof section === 'string') {
                    return <FormattedText key={subKey} content={section} />;
                  }

                  return (
                    <div key={subKey} className="space-y-4">
                      <h4 className="text-foreground font-bold">{section.title}</h4>
                      <FormattedText content={section.content} />
                      {section.link && (
                        <div className="flex justify-start pt-2 sm:justify-center">
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
                })}
              </div>
            </Section>
          ))}
      </div>

      {uiLanguage !== 'de' && t('legal.translation_note') && (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground bg-muted/30 border-border/50 rounded-lg border p-4 text-sm italic">
            {t('legal.translation_note')}
          </p>
        </div>
      )}
    </PageContainer>
  );
}
