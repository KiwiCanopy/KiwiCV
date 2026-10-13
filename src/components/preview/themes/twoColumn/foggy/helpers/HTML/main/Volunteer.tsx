import {
  SectionHeader,
  TimelineEntry,
} from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';
import { Heart, LayoutList } from 'lucide-react';

export const MainVolunteerSection = ({
  isCustomSection,
  data: visibleVolunteer,
  p,
  labels,
  formatCVDateRange,
}: FoggySharedProps<ResumeData['volunteer']>) => {
  if (!visibleVolunteer || visibleVolunteer.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: p.bgCard,
        border: `1px solid ${p.border}`,
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: '24px',
      }}
    >
      <SectionHeader
        icon={isCustomSection ? <LayoutList size={16} /> : <Heart size={16} />}
        title={labels.volunteer}
        p={p}
      />
      <div>
        {visibleVolunteer.map((vol, i) => (
          <TimelineEntry
            key={i}
            title={vol.position}
            subtitle={vol.organization}
            location={vol.location}
            date={formatCVDateRange(vol.startDate, vol.endDate)}
            summary={vol.summary}
            highlights={vol.highlights}
            url={vol.url}
            isPresent={isOngoingEndDate(vol.endDate)}
            isLast={i === visibleVolunteer.length - 1}
            p={p}
          />
        ))}
      </div>
    </div>
  );
};
