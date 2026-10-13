import {
  SectionHeader,
  TimelineEntry,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import { workTimelineRow } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/timelineRows';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Briefcase } from 'lucide-react';

export const MainWorkSection = ({
  data,
  p,
  labels,
  cvLocale,
  formatCVDateRange,
}: SkylineSharedProps<ResumeData['work']>) => {
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
      <SectionHeader icon={<Briefcase size={18} />} title={labels.work} isMain p={p} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((job, i) => (
          <TimelineEntry
            key={i}
            {...workTimelineRow(job, cvLocale, formatCVDateRange)}
            isLast={i === items.length - 1}
            p={p}
          />
        ))}
      </div>
    </div>
  );
};
