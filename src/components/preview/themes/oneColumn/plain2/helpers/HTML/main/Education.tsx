import {
  Entry,
  SectionHeader,
} from '@/components/preview/themes/oneColumn/plain2/helpers/shared/CommonHTML';
import type { Plain2SharedProps } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainEducationSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
  label,
}: Plain2SharedProps<ResumeData['education']>) => {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <SectionHeader title={label || labels.education} p={p} />
      {items.map((edu: ResumeData['education'][number], i: number) => (
        <Entry
          key={i}
          title={`${cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType}${(cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area) ? ` ${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area}` : ''}`}
          subtitle={[
            cvLocale?.boldHeaderEducation === 'company'
              ? `${edu.studyType}${edu.area ? ` — ${edu.area}` : ''}`
              : edu.institution,
            edu.location,
          ]
            .filter(Boolean)
            .join(' · ')}
          date={formatCVDateRange(edu.startDate, edu.endDate)}
          url={edu.url}
          p={p}
        >
          {edu.score && (
            <div style={{ margin: '-2px 0 0', fontSize: '0.857em', color: p.textMuted }}>
              ø {edu.score}
            </div>
          )}
          {edu.courses && edu.courses.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
                fontSize: '0.8125em',
                color: p.textMuted,
                marginTop: '4px',
              }}
            >
              {edu.courses.map((course: string, j: number) => (
                <span
                  key={j}
                  style={{
                    fontSize: '0.75rem',
                    padding: '1px 6px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '2px',
                    border: '1px solid #eee',
                    color: p.textMuted,
                  }}
                >
                  {course}
                </span>
              ))}
            </div>
          )}
        </Entry>
      ))}
    </section>
  );
};
