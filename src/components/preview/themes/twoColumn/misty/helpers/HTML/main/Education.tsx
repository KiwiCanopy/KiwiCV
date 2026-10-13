import {
  MistySection,
  TimelineEntry,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';

export const MainEducationSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
}: MistySharedProps<ResumeData['education']>) => {
  if (!items || items.length === 0) return null;

  return (
    <MistySection title={labels?.education || ''} p={p}>
      <div style={{ paddingLeft: '4px' }}>
        {items.map((edu, i) => (
          <TimelineEntry
            key={i}
            title={`${cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType}${(cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area) ? ` ${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area}` : ''}`}
            subtitle={
              cvLocale?.boldHeaderEducation === 'company'
                ? `${edu.studyType}${edu.area ? ` — ${edu.area}` : ''}`
                : edu.institution
            }
            location={edu.location}
            date={formatCVDateRange(edu.startDate, edu.endDate)}
            summary={edu.score ? `ø ${edu.score}` : ''}
            url={edu.url}
            isPresent={isOngoingEndDate(edu.endDate)}
            isFirst={i === 0}
            isLast={i === items.length - 1}
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
                      fontSize: '0.814em',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      backgroundColor: p.primary + '15',
                      color: p.primary,
                      border: `1px solid ${p.border}`,
                    }}
                  >
                    {course}
                  </span>
                ))}
              </div>
            )}
          </TimelineEntry>
        ))}
      </div>
    </MistySection>
  );
};
