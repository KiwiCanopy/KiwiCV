import { ArrayForm } from '@/components/editor/ArrayForm';
import { type SectionVariant } from '@/components/ui/section/types';
import { useTranslation } from '@/hooks/useTranslation';

interface ReferencesFormProps {
  variant?: SectionVariant;
  defaultCollapsed?: boolean;
}

export const ReferencesForm = ({
  variant = 'nested',
  defaultCollapsed = true,
}: ReferencesFormProps) => {
  const { t, tCV } = useTranslation();

  return (
    <ArrayForm
      sectionKey="references"
      title={t('editor.sections.references')}
      itemTitleKey="name"
      variant={variant}
      defaultCollapsed={defaultCollapsed}
      emptyLabel={t('editor.modules.references.empty')}
      addFirstLabel={t('editor.modules.references.add_first')}
      fields={[
        {
          name: 'reference',
          label: t('editor.fields.reference_text'),
          type: 'textarea',
          placeholder: tCV('placeholders.references.text'),
          row: 1,
        },
        {
          name: 'name',
          label: t('editor.fields.reference_name'),
          placeholder: tCV('placeholders.basics.john_doe'),
          row: 2,
        },
      ]}
    />
  );
};
