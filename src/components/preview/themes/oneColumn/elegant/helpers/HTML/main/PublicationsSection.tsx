import {
  ElegantEntry,
  ElegantSection,
} from '@/components/preview/themes/oneColumn/elegant/helpers/shared/CommonHTML';
import type { ElegantSharedProps } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainPublicationsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: ElegantSharedProps<ResumeData['publications']>) => {
  if (!items || items.length === 0) return null;

  return (
    <ElegantSection title={labels.publications} p={p}>
      {items.map((pub, i) => (
        <ElegantEntry
          key={i}
          p={p}
          title={pub.name}
          org={pub.publisher}
          date={formatCVDate(pub.releaseDate)}
          url={pub.url}
        >
          {pub.summary && (
            <p style={{ margin: '4px 0', fontSize: '0.929em', color: '#4a5568' }}>{pub.summary}</p>
          )}
        </ElegantEntry>
      ))}
    </ElegantSection>
  );
};
