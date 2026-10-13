import { memo } from 'react';
import { PiSignature } from 'react-icons/pi';

import { getCityCountry, getPlaceholderCity } from '@/components/preview/themes/shared';
import { ExportOption } from '@/components/ui/ExportOption';
import { Input } from '@/components/ui/Input';
import { SectionLabel } from '@/features/dashboard/design/helpers/SectionLabel';
import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { cn } from '@/utils/cn';

export const PdfFooterSection = memo(() => {
  const { t, cvLocale } = useTranslation();
  const lang = useLanguage();
  const resume = useResumeStore((state) => state.resume);
  const updateMeta = useResumeStore((state) => state.updateMeta);

  const bcp47 = cvLocale.bcp47 || 'en-US';
  const footerLocaleCode = resume.meta.theme.locale || lang;
  const defaultFooterLocation =
    getCityCountry(resume.basics.location, footerLocaleCode) ||
    getPlaceholderCity(footerLocaleCode);

  const defaultDate = new Date().toLocaleDateString(bcp47, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const { isStandard } = useEditorBreakpoints();

  return (
    <div className="space-y-6">
      <SectionLabel label={t('design.pdf_footer.title')} icon={<PiSignature size={22} />} />
      <ExportOption
        label={t('design.pdf_footer.show')}
        description={t('design.pdf_footer.desc')}
        checked={resume.meta.theme.params?.showFooter !== false}
        onChange={(checked) => {
          if (checked === (resume.meta.theme.params?.showFooter !== false)) return;
          setTimeout(() => {
            updateMeta({
              theme: {
                ...resume.meta.theme,
                params: { ...resume.meta.theme.params, showFooter: checked },
              },
            });
          }, 0);
        }}
      />
      {resume.meta.theme.params?.showFooter !== false && (
        <div className={cn('mt-2 grid gap-6', isStandard ? 'grid-cols-2' : 'grid-cols-1')}>
          <div className="space-y-2">
            <ExportOption
              label={t('design.pdf_footer.location')}
              checked={resume.meta.theme.params?.footerLocation !== 'none'}
              onChange={(checked) => {
                const isNone = resume.meta.theme.params?.footerLocation === 'none';
                if (checked === !isNone) return;
                setTimeout(() => {
                  updateMeta({
                    theme: {
                      ...resume.meta.theme,
                      params: {
                        ...resume.meta.theme.params,
                        footerLocation: checked ? 'auto' : 'none',
                      },
                    },
                  });
                }, 0);
              }}
            />
            {resume.meta.theme.params?.footerLocation !== 'none' && (
              <Input
                value={
                  resume.meta.theme.params?.footerLocation === 'auto'
                    ? ''
                    : resume.meta.theme.params?.footerLocation || ''
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value;
                  const currentVal = resume.meta.theme.params?.footerLocation;
                  if (val === (currentVal === 'auto' ? '' : currentVal)) return;
                  setTimeout(() => {
                    updateMeta({
                      theme: {
                        ...resume.meta.theme,
                        params: {
                          ...resume.meta.theme.params,
                          footerLocation: val || 'auto',
                        },
                      },
                    });
                  }, 0);
                }}
                placeholder={defaultFooterLocation}
              />
            )}
          </div>

          <div className="space-y-2">
            <ExportOption
              label={t('design.pdf_footer.date')}
              checked={resume.meta.theme.params?.footerDate !== 'none'}
              onChange={(checked) => {
                const isNone = resume.meta.theme.params?.footerDate === 'none';
                if (checked === !isNone) return;
                updateMeta({
                  theme: {
                    ...resume.meta.theme,
                    params: {
                      ...resume.meta.theme.params,
                      footerDate: checked ? 'auto' : 'none',
                    },
                  },
                });
              }}
            />
            {resume.meta.theme.params?.footerDate !== 'none' && (
              <Input
                value={
                  resume.meta.theme.params?.footerDate === 'auto'
                    ? ''
                    : resume.meta.theme.params?.footerDate || ''
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value;
                  const currentVal = resume.meta.theme.params?.footerDate;
                  if (val === (currentVal === 'auto' ? '' : currentVal)) return;
                  updateMeta({
                    theme: {
                      ...resume.meta.theme,
                      params: { ...resume.meta.theme.params, footerDate: val || 'auto' },
                    },
                  });
                }}
                placeholder={defaultDate}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
});

PdfFooterSection.displayName = 'PdfFooterSection';
