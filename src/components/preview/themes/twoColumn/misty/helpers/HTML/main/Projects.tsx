import {
  MistySection,
  TimelineEntry,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';

export const MainProjectsSection = ({
  data: items,
  p,
  labels,
  label,
  formatCVDateRange,
}: MistySharedProps<ResumeData['projects']>) => {
  if (!items || items.length === 0) return null;
  return (
    <MistySection title={label || labels?.projects || ''} p={p}>
      <div style={{ paddingLeft: '4px' }}>
        {items.map((proj, i) => {
          const dateStr = formatCVDateRange(proj.startDate, proj.endDate);
          const isPresent = isOngoingEndDate(proj.endDate);
          return (
            <TimelineEntry
              key={i}
              title={proj.name}
              subtitle={[proj.entity, proj.type].filter(Boolean).join(' — ')}
              location={proj.location}
              date={dateStr}
              summary={proj.description}
              highlights={proj.highlights}
              url={proj.url}
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
