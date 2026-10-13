import {
  SectionHeader,
  TimelineEntry,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import { projectTimelineRow } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/timelineRows';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Folder } from 'lucide-react';

export const MainProjectsSection = ({
  data,
  p,
  labels,
  label,
  icon,
  formatCVDateRange,
}: SkylineSharedProps<ResumeData['projects']>) => {
  const items = data;
  if (!items?.length) return null;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(255, 255, 255, 1)',
        boxShadow: `-8px 8px 32px 0 ${p.primaryLight}`,
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '16px',
      }}
    >
      <SectionHeader
        icon={icon || <Folder size={18} />}
        title={label || labels?.projects || ''}
        isMain
        p={p}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((proj, i) => (
          <TimelineEntry
            key={i}
            {...projectTimelineRow(proj, formatCVDateRange)}
            isLast={i === items.length - 1}
            p={p}
          />
        ))}
      </div>
    </div>
  );
};
