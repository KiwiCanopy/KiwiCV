import {
  GlassPanel,
  SectionHeader,
  SideTimelineEntry,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import { volunteerTimelineRow } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/timelineRows';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Heart, LayoutList } from 'lucide-react';

export const SideVolunteerSection = ({
  isCustomSection,
  data,
  p,
  labels,
  formatCVDateRange,
}: SkylineSharedProps<ResumeData['volunteer']>) => {
  const items = data;
  if (!items?.length) return null;

  return (
    <GlassPanel p={p}>
      <SectionHeader
        icon={isCustomSection ? <LayoutList size={18} /> : <Heart size={18} />}
        title={labels.volunteer}
        p={p}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((vol, i) => (
          <SideTimelineEntry key={i} {...volunteerTimelineRow(vol, formatCVDateRange)} p={p} />
        ))}
      </div>
    </GlassPanel>
  );
};
