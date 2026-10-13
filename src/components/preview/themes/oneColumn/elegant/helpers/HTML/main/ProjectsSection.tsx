import {
  BulletList,
  ElegantEntry,
  ElegantSection,
} from '@/components/preview/themes/oneColumn/elegant/helpers/shared/CommonHTML';
import type { ElegantSharedProps } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainProjectsSection = ({
  data: items,
  p,
  labels,
  label,
  formatCVDateRange,
}: ElegantSharedProps<ResumeData['projects']>) => {
  if (!items || items.length === 0) return null;

  return (
    <ElegantSection title={label || labels.projects} p={p}>
      {items.map((proj, i) => (
        <ElegantEntry
          key={i}
          p={p}
          title={proj.name}
          org={[proj.entity, proj.type].filter(Boolean).join(' — ') || undefined}
          location={proj.location}
          date={formatCVDateRange(proj.startDate, proj.endDate)}
          url={proj.url}
        >
          {proj.description && (
            <p style={{ margin: '4px 0', fontSize: '0.929em', color: '#4a5568' }}>
              {proj.description}
            </p>
          )}
          <BulletList items={proj.highlights} p={p} />
        </ElegantEntry>
      ))}
    </ElegantSection>
  );
};
