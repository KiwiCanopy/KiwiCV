import {
  ElegantEntry,
  ElegantSection,
} from '@/components/preview/themes/oneColumn/elegant/helpers/shared/CommonHTML';
import type { ElegantSharedProps } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainEducationSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
}: ElegantSharedProps<ResumeData['education']>) => {
  if (!items || items.length === 0) return null;

  return (
    <ElegantSection title={labels.education} p={p}>
      {items.map((edu, i) => (
        <ElegantEntry
          key={i}
          p={p}
          title={`${cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType}${(cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area) ? ` ${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area}` : ''}`}
          org={
            cvLocale?.boldHeaderEducation === 'company'
              ? `${edu.studyType}${edu.area ? ` — ${edu.area}` : ''}`
              : edu.institution
          }
          location={edu.location}
          date={formatCVDateRange(edu.startDate, edu.endDate)}
          url={edu.url}
        >
          {edu.score && (
            <div style={{ fontSize: '0.857em', color: '#718096', marginBottom: '4px' }}>
              ø {edu.score}
            </div>
          )}
          {edu.courses && edu.courses.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginTop: '10px',
              }}
            >
              {edu.courses.map((course, j) => (
                <span
                  key={j}
                  style={{
                    padding: '1px 6px',
                    backgroundColor: '#f7fafc',
                    color: '#4a5568',
                    borderRadius: '4px',
                    fontSize: '11px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {course}
                </span>
              ))}
            </div>
          )}
        </ElegantEntry>
      ))}
    </ElegantSection>
  );
};
