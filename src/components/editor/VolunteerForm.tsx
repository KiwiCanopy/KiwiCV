import { ArrayForm } from '@/components/editor/ArrayForm';
import { withMainColumnHints } from '@/components/editor/mainColumnHints';
import { type SectionVariant } from '@/components/ui/section/types';
import { useTranslation } from '@/hooks/useTranslation';

interface VolunteerFormProps {
  variant?: SectionVariant;
  defaultCollapsed?: boolean;
}

export const VolunteerForm = ({
  variant = 'nested',
  defaultCollapsed = true,
}: VolunteerFormProps) => {
  const { t, tCV } = useTranslation();

  return (
    <ArrayForm
      sectionKey="volunteer"
      title={t('editor.sections.volunteer')}
      itemTitleKey="organization"
      itemSubtitleKey="position"
      itemSummaryKey="summary"
      itemStartDateKey="startDate"
      itemEndDateKey="endDate"
      defaultCollapsed={defaultCollapsed}
      variant={variant}
      emptyLabel={t('editor.modules.volunteer.empty')}
      addFirstLabel={t('editor.modules.volunteer.add_first')}
      fields={withMainColumnHints('volunteer', t, [
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
          name: 'organization',
          label: t('editor.fields.organization'),
          row: 2,
          placeholder: tCV('placeholders.volunteer.organization'),
        },
        {
          name: 'position',
          label: t('editor.fields.position'),
          row: 2,
          placeholder: tCV('placeholders.volunteer.position'),
        },
        {
          name: 'location',
          label: t('editor.fields.location'),
          row: 3,
          placeholder: tCV('placeholders.common.location'),
        },
        {
          name: 'summary',
          label: t('editor.fields.summary'),
          type: 'textarea',
          placeholder: tCV('placeholders.volunteer.summary'),
        },
        {
          name: 'highlights',
          label: t('editor.fields.highlights'),
          type: 'tags',
          placeholder: tCV('placeholders.work.highlights'),
        },
        {
          name: 'url',
          label: t('editor.fields.website'),
          placeholder: tCV('placeholders.common.https'),
        },
      ])}
    />
  );
};
