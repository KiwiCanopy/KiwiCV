import {
  SOEntry,
  SOSection,
} from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/CommonHTML';
import type { StackoverflowSharedProps } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainCertificatesSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: StackoverflowSharedProps<ResumeData['certificates']>) => {
  if (!items || items.length === 0 || !p || !labels) return null;
  return (
    <SOSection title={labels.certificates} p={p}>
      {items.map((c, i) => (
        <SOEntry
          key={i}
          title={c.name}
          org={c.issuer}
          date={formatCVDate(c.date)}
          url={c.url}
          p={p}
        />
      ))}
    </SOSection>
  );
};
