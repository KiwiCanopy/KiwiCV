import {
  ElegantEntry,
  ElegantSection,
} from '@/components/preview/themes/oneColumn/elegant/helpers/shared/CommonHTML';
import type { ElegantSharedProps } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainCertificatesSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: ElegantSharedProps<ResumeData['certificates']>) => {
  if (!items || items.length === 0) return null;

  return (
    <ElegantSection title={labels.certificates} p={p}>
      {items.map((cert, i) => (
        <ElegantEntry
          key={i}
          p={p}
          title={cert.name}
          org={cert.issuer}
          date={formatCVDate(cert.date)}
          url={cert.url}
        />
      ))}
    </ElegantSection>
  );
};
