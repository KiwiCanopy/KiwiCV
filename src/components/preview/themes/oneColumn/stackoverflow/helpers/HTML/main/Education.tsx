import {
  SOEntry,
  SOSection,
} from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/CommonHTML';
import type { StackoverflowSharedProps } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainEducationSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
}: StackoverflowSharedProps<ResumeData['education']>) => {
  if (!items || items.length === 0 || !p || !labels) return null;
  return (
    <SOSection title={labels.education} p={p}>
      {items.map((item, i) => (
        <SOEntry
          key={i}
          title={
            (cvLocale?.boldHeaderEducation === 'company' ? item.institution : item.studyType) &&
            (cvLocale?.boldHeaderEducation === 'company' ? '' : item.area)
              ? `${cvLocale?.boldHeaderEducation === 'company' ? item.institution : item.studyType} — ${cvLocale?.boldHeaderEducation === 'company' ? '' : item.area}`
              : (cvLocale?.boldHeaderEducation === 'company' ? item.institution : item.studyType) ||
                (cvLocale?.boldHeaderEducation === 'company' ? '' : item.area) ||
                ''
          }
          org={[
            cvLocale?.boldHeaderEducation === 'company'
              ? `${item.studyType}${item.area ? ` — ${item.area}` : ''}`
              : item.institution,
            item.location,
          ]
            .filter(Boolean)
            .join(' · ')}
          date={formatCVDateRange(item.startDate, item.endDate)}
          url={item.url}
          p={p}
        >
          {item.score && (
            <p style={{ margin: '4px 0 8px', fontSize: '0.929em', color: p.text }}>
              ø {item.score}
            </p>
          )}
          {item.courses && item.courses.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {item.courses.map((course, j) => (
                <span
                  key={j}
                  style={{
                    padding: '1px 5px',
                    backgroundColor: p.bgLight,
                    fontSize: '0.75em',
                    borderRadius: '1px',
                    color: p.textMuted,
                    border: `1px solid ${p.border}`,
                  }}
                >
                  {course}
                </span>
              ))}
            </div>
          )}
        </SOEntry>
      ))}
    </SOSection>
  );
};
