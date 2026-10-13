import {
  SectionHeader,
  TimelineEntry,
} from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';
import { GraduationCap } from 'lucide-react';

export const MainEducationSection = ({
  data: visibleEducation,
  p,
  labels,
  cvLocale,
  formatCVDateRange,
}: FoggySharedProps<ResumeData['education']>) => {
  if (!visibleEducation || visibleEducation.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: p.bgCard,
        border: `1px solid ${p.border}`,
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: '24px 32px',
      }}
    >
      <SectionHeader icon={<GraduationCap size={16} />} title={labels.education} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {visibleEducation.map((edu, i) => {
          const dateStr = formatCVDateRange(edu.startDate, edu.endDate);
          const isPresent = isOngoingEndDate(edu.endDate);
          return (
            <TimelineEntry
              key={i}
              location={edu.location}
              title={
                (cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType) +
                ((cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area)
                  ? ` ${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area}`
                  : '')
              }
              subtitle={
                cvLocale?.boldHeaderEducation === 'company'
                  ? `${edu.studyType}${edu.area ? ` — ${edu.area}` : ''}`
                  : edu.institution
              }
              date={dateStr}
              summary={edu.score ? `ø ${edu.score}` : undefined}
              url={edu.url}
              isPresent={isPresent}
              isLast={i === visibleEducation.length - 1}
              p={p}
            >
              {edu.courses && edu.courses.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginTop: '8px',
                  }}
                >
                  {edu.courses.map((course, j) => (
                    <span
                      key={j}
                      style={{
                        fontSize: '0.786em',
                        backgroundColor: p.primaryVeryLight,
                        color: p.textMuted,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: `1px solid ${p.border}`,
                      }}
                    >
                      {course}
                    </span>
                  ))}
                </div>
              )}
            </TimelineEntry>
          );
        })}
      </div>
    </div>
  );
};
