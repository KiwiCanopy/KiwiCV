import {
  MistySection,
  TimelineEntry,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';

export const MainWorkSection = ({
  data: items,
  p,
  labels,
  cvLocale,
  formatCVDateRange,
}: MistySharedProps<ResumeData['work']>) => {
  if (!items || items.length === 0) return null;

  return (
    <MistySection title={labels?.work || ''} p={p}>
      <div style={{ paddingLeft: '4px' }}>
        {items.map((job, i) => {
          const dateStr = formatCVDateRange(job.startDate, job.endDate);
          const isPresent = isOngoingEndDate(job.endDate);
          return (
            <TimelineEntry
              key={i}
              title={cvLocale?.boldHeaderWork === 'company' ? job.name : job.position}
              subtitle={cvLocale?.boldHeaderWork === 'company' ? job.position : job.name}
              location={job.location}
              date={dateStr}
              summary={job.summary}
              highlights={job.highlights}
              url={job.url}
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
