import {
  BulletList,
  ElegantEntry,
  ElegantSection,
} from '@/components/preview/themes/oneColumn/elegant/helpers/shared/CommonHTML';
import type { ElegantSharedProps } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainVolunteerSection = ({
  data: items,
  p,
  labels,
  formatCVDateRange,
}: ElegantSharedProps<ResumeData['volunteer']>) => {
  if (!items || items.length === 0) return null;

  return (
    <ElegantSection title={labels.volunteer} p={p}>
      {items.map((vol, i) => (
        <ElegantEntry
          key={i}
          p={p}
          title={vol.position}
          org={vol.organization}
          location={vol.location}
          date={formatCVDateRange(vol.startDate, vol.endDate)}
          url={vol.url}
        >
          {vol.summary && (
            <p style={{ margin: '4px 0', fontSize: '0.929em', color: '#4a5568' }}>{vol.summary}</p>
          )}
          <BulletList items={vol.highlights} p={p} />
        </ElegantEntry>
      ))}
    </ElegantSection>
  );
};
