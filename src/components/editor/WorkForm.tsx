import { ArrayForm } from '@/components/editor/ArrayForm';
import { withMainColumnHints } from '@/components/editor/mainColumnHints';
import { type SectionVariant } from '@/components/ui/section/types';
import { useTranslation } from '@/hooks/useTranslation';

interface WorkFormProps {
  variant?: SectionVariant;
  defaultCollapsed?: boolean;
}

export const WorkForm = ({ variant = 'nested', defaultCollapsed = true }: WorkFormProps) => {
  const { t, tCV } = useTranslation();

  return (
    <ArrayForm
      sectionKey="work"
      title={t('editor.sections.work')}
      itemTitleKey="name"
      itemSubtitleKey="position"
      itemStartDateKey="startDate"
      itemEndDateKey="endDate"
      variant={variant}
      defaultCollapsed={defaultCollapsed}
      emptyLabel={t('editor.modules.work.empty')}
      addFirstLabel={t('editor.modules.work.add_first')}
      fields={withMainColumnHints('work', t, [
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
          name: 'position',
          label: t('editor.fields.position'),
          row: 2,
          placeholder: tCV('placeholders.work.position'),
        },
        {
          name: 'name',
          label: t('editor.fields.company'),
          row: 2,
          placeholder: tCV('placeholders.work.company'),
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
          placeholder: tCV('placeholders.work.summary'),
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
