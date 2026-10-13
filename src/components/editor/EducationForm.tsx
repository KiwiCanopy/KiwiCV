import { ArrayForm } from '@/components/editor/ArrayForm';
import { withMainColumnHints } from '@/components/editor/mainColumnHints';
import { type SectionVariant } from '@/components/ui/section/types';
import { useTranslation } from '@/hooks/useTranslation';

interface EducationFormProps {
  variant?: SectionVariant;
  defaultCollapsed?: boolean;
}

export function EducationForm({ variant = 'nested', defaultCollapsed = true }: EducationFormProps) {
  const { t, tCV } = useTranslation();

  return (
    <ArrayForm
      sectionKey="education"
      title={t('editor.sections.education')}
      itemTitleKey="institution"
      itemStartDateKey="startDate"
      itemEndDateKey="endDate"
      subtitleFormatter={(item) =>
        item.studyType && item.area
          ? `${item.studyType} — ${item.area}`
          : item.studyType || item.area || ''
      }
      variant={variant}
      defaultCollapsed={defaultCollapsed}
      emptyLabel={t('editor.modules.education.empty')}
      addFirstLabel={t('editor.modules.education.add_first')}
      fields={withMainColumnHints('education', t, [
        {
          name: 'startDate',
          label: t('editor.fields.start_date'),
          type: 'date',
          row: 1,
          placeholder: tCV('placeholders.common.date_format'),
        },
        {
          name: 'endDate',
          label: t('editor.fields.end_date'),
          type: 'date',
          row: 1,
          placeholder: tCV('placeholders.common.present'),
        },
        {
          name: 'institution',
          label: t('editor.fields.institution'),
          row: 2,
          placeholder: tCV('placeholders.education.institution'),
        },
        {
          name: 'location',
          label: t('editor.fields.location'),
          row: 2,
          placeholder: tCV('placeholders.common.location'),
        },
        {
          name: 'area',
          label: t('editor.fields.area'),
          row: 3,
          placeholder: tCV('placeholders.education.area'),
        },
        {
          name: 'studyType',
          label: t('editor.fields.study_type'),
          row: 3,
          placeholder: tCV('placeholders.education.study_type'),
        },
        {
          name: 'score',
          label: t('editor.fields.score'),
          row: 3,
          placeholder: tCV('placeholders.education.score'),
        },
        {
          name: 'courses',
          label: t('editor.fields.courses'),
          type: 'tags',
          placeholder: tCV('placeholders.education.courses'),
        },
        {
          name: 'url',
          label: t('editor.fields.website'),
          placeholder: tCV('placeholders.common.https'),
        },
      ])}
    />
  );
}
