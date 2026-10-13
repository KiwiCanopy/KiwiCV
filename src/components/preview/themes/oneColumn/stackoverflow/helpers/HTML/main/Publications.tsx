import {
  SOEntry,
  SOSection,
} from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/CommonHTML';
import type { StackoverflowSharedProps } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainPublicationsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: StackoverflowSharedProps<ResumeData['publications']>) => {
  if (!items || items.length === 0 || !p || !labels) return null;
  return (
    <SOSection title={labels.publications} p={p}>
      {items.map((pub, i) => (
        <SOEntry
          key={i}
          title={pub.name}
          org={pub.publisher}
          date={formatCVDate(pub.releaseDate)}
          url={pub.url}
          p={p}
        >
          {pub.summary && (
            <p style={{ margin: '4px 0 8px', fontSize: '0.929em', color: p.text }}>{pub.summary}</p>
          )}
        </SOEntry>
      ))}
    </SOSection>
  );
};
