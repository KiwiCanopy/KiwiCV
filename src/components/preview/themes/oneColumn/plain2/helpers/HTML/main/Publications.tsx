import {
  Entry,
  SectionHeader,
} from '@/components/preview/themes/oneColumn/plain2/helpers/shared/CommonHTML';
import type { Plain2SharedProps } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainPublicationsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
  label,
}: Plain2SharedProps<ResumeData['publications']>) => {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <SectionHeader title={label || labels.publications} p={p} />
      {items.map((pub: ResumeData['publications'][number], i: number) => (
        <Entry
          key={i}
          title={pub.name}
          subtitle={pub.publisher}
          date={formatCVDate(pub.releaseDate)}
          url={pub.url}
          p={p}
        >
          {pub.summary && (
            <p style={{ margin: '4px 0', fontSize: '0.929em', color: p.textMain }}>{pub.summary}</p>
          )}
        </Entry>
      ))}
    </section>
  );
};
