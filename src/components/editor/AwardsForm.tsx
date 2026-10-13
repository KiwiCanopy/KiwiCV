import { ArrayForm } from '@/components/editor/ArrayForm';
import { withMainColumnHints } from '@/components/editor/mainColumnHints';
import { type SectionVariant } from '@/components/ui/section/types';
import { useTranslation } from '@/hooks/useTranslation';

interface AwardsFormProps {
  variant?: SectionVariant;
  defaultCollapsed?: boolean;
}

export const AwardsForm = ({ variant = 'nested', defaultCollapsed = true }: AwardsFormProps) => {
  const { t, tCV } = useTranslation();

  return (
    <ArrayForm
      sectionKey="awards"
      title={t('editor.sections.awards')}
      itemTitleKey="title"
      itemSubtitleKey="awarder"
      itemSummaryKey="summary"
      itemStartDateKey="date"
      variant={variant}
      defaultCollapsed={defaultCollapsed}
      emptyLabel={t('editor.modules.awards.empty')}
      addFirstLabel={t('editor.modules.awards.add_first')}
      fields={withMainColumnHints('awards', t, [
        {
          name: 'date',
          label: t('editor.fields.date'),
          type: 'date',
          row: 1,
          placeholder: tCV('placeholders.common.date_format'),
        },
        {
          name: 'title',
          label: t('editor.fields.award_title'),
          row: 2,
          placeholder: tCV('placeholders.awards.title'),
        },
        {
          name: 'awarder',
          label: t('editor.fields.awarder'),
          row: 3,
          placeholder: tCV('placeholders.awards.awarder'),
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
          row: 4,
          placeholder: tCV('placeholders.awards.summary'),
        },
        {
          name: 'url',
          label: t('editor.fields.verification_url'),
          row: 5,
          placeholder: tCV('placeholders.common.https'),
        },
      ])}
    />
  );
};
