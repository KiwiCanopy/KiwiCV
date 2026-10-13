import { FormattedText } from '@/components/ui/FormattedText';
import { PageContainer } from '@/components/ui/PageContainer';
import { Section } from '@/components/ui/Section';
import { CONTACT_EMAIL } from '@/constants/contact';
import { useTranslation } from '@/hooks/useTranslation';
import { useUIStore } from '@/store/ui/useUIStore';
import { interpolateLegalTemplate } from '@/utils/legal';
import { FileText } from 'lucide-react';

export function LegalNotice() {
  const { t, tObject } = useTranslation();
  const uiLanguage = useUIStore((state) => state.appLanguage);

  interface LegalNoticeSection {
    title: string;
    content: string;
  }

  const noticeData = tObject<{
    title: string;
    sections: Record<string, LegalNoticeSection>;
  }>('legal.notice');

  if (!noticeData) return null;

  return (
    <PageContainer className="px-6 py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-primary/10 text-primary-strong rounded-lg p-2">
          <FileText className="h-6 w-6" />
        </div>
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
          {noticeData.title}
        </h1>
      </div>

      <div className="space-y-6">
        {Object.entries(noticeData.sections).map(([key, section]) => (
          <Section key={key} title={section.title}>
            <FormattedText content={interpolateLegalTemplate(section.content, CONTACT_EMAIL)} />
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
