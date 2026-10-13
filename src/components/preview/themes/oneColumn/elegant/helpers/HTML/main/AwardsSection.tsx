import {
  ElegantEntry,
  ElegantSection,
} from '@/components/preview/themes/oneColumn/elegant/helpers/shared/CommonHTML';
import type { ElegantSharedProps } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainAwardsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: ElegantSharedProps<ResumeData['awards']>) => {
  if (!items || items.length === 0) return null;

  return (
    <ElegantSection title={labels.awards} p={p}>
      {items.map((award, i) => (
        <ElegantEntry
          key={i}
          p={p}
          title={award.title}
          org={award.awarder}
          location={award.location}
          date={formatCVDate(award.date)}
          url={award.url}
        >
          {award.summary && (
            <p style={{ margin: '4px 0', fontSize: '0.929em', color: '#4a5568' }}>
              {award.summary}
            </p>
          )}
        </ElegantEntry>
      ))}
    </ElegantSection>
  );
};
