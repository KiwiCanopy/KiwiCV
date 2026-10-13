import { memo } from 'react';

import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { SectionLabel } from '@/features/dashboard/design/helpers/SectionLabel';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { THEME_PARAM_DEFAULTS } from '@/types/resume';
import { Type } from 'lucide-react';

export const BoldHeaderOptions = memo(() => {
  const { t } = useTranslation();
  const resume = useResumeStore((state) => state.resume);
  const updateMeta = useResumeStore((state) => state.updateMeta);

  const boldHeaderWork =
    resume.meta.theme.params?.boldHeaderWork || THEME_PARAM_DEFAULTS.boldHeaderWork;
  const boldHeaderEducation =
    resume.meta.theme.params?.boldHeaderEducation || THEME_PARAM_DEFAULTS.boldHeaderEducation;

  const workOptions = [
    { value: 'position' as const, label: t('editor.fields.position') },
    { value: 'company' as const, label: t('editor.fields.company') },
  ];

  const educationOptions = [
    { value: 'position' as const, label: t('editor.fields.study_type') },
    { value: 'company' as const, label: t('editor.fields.institution') },
  ];

  const handleWorkChange = (val: 'company' | 'position') => {
    if (val === boldHeaderWork) return;
    setTimeout(() => {
      updateMeta({
        theme: {
          ...resume.meta.theme,
          params: { ...resume.meta.theme.params, boldHeaderWork: val },
        },
      });
    }, 0);
  };

  const handleEducationChange = (val: 'company' | 'position') => {
    if (val === boldHeaderEducation) return;
    setTimeout(() => {
      updateMeta({
        theme: {
          ...resume.meta.theme,
          params: { ...resume.meta.theme.params, boldHeaderEducation: val },
        },
      });
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <SectionLabel label={t('design.bold_header.title')} icon={<Type size={22} />} />
        <span className="text-muted-foreground block text-xs">{t('design.bold_header.desc')}</span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <span className="text-foreground text-xs font-bold">{t('editor.sections.work')}</span>
          <SegmentedToggle
            value={boldHeaderWork}
            onChange={handleWorkChange}
            options={workOptions}
          />
        </div>

        <div className="space-y-2">
          <span className="text-foreground text-xs font-bold">
            {t('editor.sections.education')}
          </span>
          <SegmentedToggle
            value={boldHeaderEducation}
            onChange={handleEducationChange}
            options={educationOptions}
          />
        </div>
      </div>
    </div>
  );
});

BoldHeaderOptions.displayName = 'BoldHeaderOptions';
