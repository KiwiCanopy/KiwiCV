import { ArrayForm } from '@/components/editor/ArrayForm';
import { withMainColumnHints } from '@/components/editor/mainColumnHints';
import { type SectionVariant } from '@/components/ui/section/types';
import { useTranslation } from '@/hooks/useTranslation';

interface PublicationsFormProps {
  variant?: SectionVariant;
  defaultCollapsed?: boolean;
}

export const PublicationsForm = ({
  variant = 'nested',
  defaultCollapsed = true,
}: PublicationsFormProps) => {
  const { t, tCV } = useTranslation();

  return (
    <ArrayForm
      sectionKey="publications"
      title={t('editor.sections.publications')}
      itemTitleKey="name"
      itemSubtitleKey="publisher"
      itemSummaryKey="summary"
      itemStartDateKey="releaseDate"
      variant={variant}
      defaultCollapsed={defaultCollapsed}
      emptyLabel={t('editor.modules.publications.empty')}
      addFirstLabel={t('editor.modules.publications.add_first')}
      fields={withMainColumnHints('publications', t, [
        {
          name: 'releaseDate',
          label: t('editor.fields.release_date'),
          type: 'date',
          row: 1,
          placeholder: tCV('placeholders.common.date_format'),
        },
        {
          name: 'name',
          label: t('editor.fields.publication_title'),
          row: 2,
          placeholder: tCV('placeholders.publications.title'),
        },
        {
          name: 'publisher',
          label: t('editor.fields.publisher'),
          row: 2,
          placeholder: tCV('placeholders.publications.publisher'),
        },
        {
          name: 'summary',
          label: t('editor.fields.summary'),
          type: 'textarea',
          row: 3,
          placeholder: tCV('placeholders.publications.summary'),
        },
        {
          name: 'url',
          label: t('editor.fields.website'),
          row: 4,
          placeholder: tCV('placeholders.common.https'),
        },
      ])}
    />
  );
};
