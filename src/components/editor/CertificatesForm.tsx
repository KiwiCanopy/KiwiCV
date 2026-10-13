import { ArrayForm } from '@/components/editor/ArrayForm';
import { type SectionVariant } from '@/components/ui/section/types';
import { useTranslation } from '@/hooks/useTranslation';

interface CertificatesFormProps {
  variant?: SectionVariant;
  defaultCollapsed?: boolean;
}

export const CertificatesForm = ({
  variant = 'nested',
  defaultCollapsed = true,
}: CertificatesFormProps) => {
  const { t, tCV } = useTranslation();

  return (
    <ArrayForm
      sectionKey="certificates"
      title={t('editor.sections.certificates')}
      itemTitleKey="name"
      itemSubtitleKey="issuer"
      itemStartDateKey="date"
      variant={variant}
      defaultCollapsed={defaultCollapsed}
      emptyLabel={t('editor.modules.certificates.empty')}
      addFirstLabel={t('editor.modules.certificates.add_first')}
      fields={[
        {
          name: 'date',
          label: t('editor.fields.date'),
          type: 'date',
          row: 1,
          placeholder: tCV('placeholders.common.date_format'),
        },
        {
          name: 'name',
          label: t('editor.fields.certificate_name'),
          row: 2,
          placeholder: tCV('placeholders.certificates.name'),
        },
        {
          name: 'issuer',
          label: t('editor.fields.issuer'),
          row: 2,
          placeholder: tCV('placeholders.certificates.issuer'),
        },
        {
          name: 'url',
          label: t('editor.fields.verification_url'),
          row: 3,
          placeholder: tCV('placeholders.common.https'),
        },
      ]}
    />
  );
};
