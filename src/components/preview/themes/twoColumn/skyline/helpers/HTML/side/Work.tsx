import {
  GlassPanel,
  SectionHeader,
  SideTimelineEntry,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import { workTimelineRow } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/timelineRows';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Briefcase } from 'lucide-react';

export const SideWorkSection = ({
  cvLocale,
  data,
  p,
  labels,
  formatCVDateRange,
}: SkylineSharedProps<ResumeData['work']>) => {
  const items = data;
  if (!items?.length) return null;

  return (
    <GlassPanel p={p}>
      <SectionHeader icon={<Briefcase size={18} />} title={labels.work} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((job, i) => (
          <SideTimelineEntry key={i} {...workTimelineRow(job, cvLocale, formatCVDateRange)} p={p} />
        ))}
      </div>
    </GlassPanel>
  );
};
