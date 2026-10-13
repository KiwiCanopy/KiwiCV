import {
  Entry,
  SectionHeader,
} from '@/components/preview/themes/oneColumn/plain2/helpers/shared/CommonHTML';
import type { Plain2SharedProps } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainAwardsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
  label,
}: Plain2SharedProps<ResumeData['awards']>) => {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <SectionHeader title={label || labels.awards} p={p} />
      {items.map((award: ResumeData['awards'][number], i: number) => (
        <Entry
          key={i}
          title={award.title}
          subtitle={[award.awarder, award.location].filter(Boolean).join(' · ') || undefined}
          date={formatCVDate(award.date)}
          url={award.url}
          p={p}
        >
          {award.summary && (
            <p style={{ margin: '4px 0', fontSize: '0.929em', color: p.textMain }}>
              {award.summary}
            </p>
          )}
        </Entry>
      ))}
    </section>
  );
};
