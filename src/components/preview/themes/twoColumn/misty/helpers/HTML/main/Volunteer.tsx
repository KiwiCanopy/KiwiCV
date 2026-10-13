import {
  MistySection,
  TimelineEntry,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';

export const MainVolunteerSection = ({
  data: items,
  p,
  labels,
  formatCVDateRange,
}: MistySharedProps<ResumeData['volunteer']>) => {
  if (!items || items.length === 0) return null;

  return (
    <MistySection title={labels?.volunteer || ''} p={p}>
      <div style={{ paddingLeft: '4px' }}>
        {items.map((vol, i) => {
          const dateStr = formatCVDateRange(vol.startDate, vol.endDate);
          const isPresent = isOngoingEndDate(vol.endDate);
          return (
            <TimelineEntry
              key={i}
              title={vol.position}
              subtitle={vol.organization}
              location={vol.location}
              date={dateStr}
              summary={vol.summary}
              highlights={vol.highlights}
              url={vol.url}
              isPresent={isPresent}
              isFirst={i === 0}
              isLast={i === items.length - 1}
              p={p}
            />
          );
        })}
      </div>
    </MistySection>
  );
};
