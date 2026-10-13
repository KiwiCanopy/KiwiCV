import {
  Entry,
  SectionHeader,
} from '@/components/preview/themes/oneColumn/plain2/helpers/shared/CommonHTML';
import type { Plain2SharedProps } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainCertificatesSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
  label,
}: Plain2SharedProps<ResumeData['certificates']>) => {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <SectionHeader title={label || labels.certificates} p={p} />
      {items.map((cert: ResumeData['certificates'][number], i: number) => (
        <Entry
          key={i}
          title={cert.name}
          subtitle={cert.issuer}
          date={formatCVDate(cert.date)}
          url={cert.url}
          p={p}
        />
      ))}
    </section>
  );
};
