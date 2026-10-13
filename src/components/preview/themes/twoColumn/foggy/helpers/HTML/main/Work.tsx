import {
  SectionHeader,
  TimelineEntry,
} from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';
import { Briefcase } from 'lucide-react';

export const MainWorkSection = ({
  data: visibleWork,
  p,
  labels,
  cvLocale,
  formatCVDateRange,
}: FoggySharedProps<ResumeData['work']>) => {
  if (!visibleWork || visibleWork.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: p.bgCard,
        border: `1px solid ${p.border}`,
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: '28px 32px',
      }}
    >
      <SectionHeader icon={<Briefcase size={16} />} title={labels.work} p={p} />
      <div style={{ paddingLeft: '4px' }}>
        {visibleWork.map((job, i) => {
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
              isLast={i === visibleWork.length - 1}
              p={p}
            />
          );
        })}
      </div>
    </div>
  );
};
