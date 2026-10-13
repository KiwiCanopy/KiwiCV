import {
  GlassPanel,
  SectionHeader,
  SideTimelineEntry,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import { projectTimelineRow } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/timelineRows';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Folder } from 'lucide-react';

export const SideProjectsSection = ({
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
    <GlassPanel p={p}>
      <SectionHeader
        icon={icon || <Folder size={18} />}
        title={label || labels?.projects || ''}
        p={p}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((project, i) => (
          <SideTimelineEntry key={i} {...projectTimelineRow(project, formatCVDateRange)} p={p} />
        ))}
      </div>
    </GlassPanel>
  );
};
