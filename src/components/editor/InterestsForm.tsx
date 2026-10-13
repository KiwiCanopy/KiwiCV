import { ArrayForm } from '@/components/editor/ArrayForm';
import { withMainColumnHints } from '@/components/editor/mainColumnHints';
import { type SectionVariant } from '@/components/ui/section/types';
import { useTranslation } from '@/hooks/useTranslation';

interface InterestsFormProps {
  variant?: SectionVariant;
  defaultCollapsed?: boolean;
}

export const InterestsForm = ({
  variant = 'nested',
  defaultCollapsed = true,
}: InterestsFormProps) => {
  const { t, tCV } = useTranslation();

  return (
    <ArrayForm
      sectionKey="interests"
      title={t('editor.sections.interests')}
      itemTitleKey="name"
      variant={variant}
      defaultCollapsed={defaultCollapsed}
      emptyLabel={t('editor.modules.interests.empty')}
      addFirstLabel={t('editor.modules.interests.add_first')}
      fields={withMainColumnHints('interests', t, [
        {
          name: 'name',
          label: t('editor.fields.interest_name'),
          placeholder: tCV('placeholders.interests.name'),
        },
        {
          name: 'keywords',
          label: t('editor.fields.keywords'),
          type: 'tags',
          placeholder: tCV('placeholders.interests.keywords'),
        },
      ])}
    />
  );
};
