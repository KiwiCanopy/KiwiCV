import {
  Entry,
  Section,
} from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainEducationSection = ({
  cvLocale,

  data: education,
  label,
  formatCVDateRange,
  p,
}: LunarSharedProps<ResumeData['education']>) => (
  <>
    {education.map((edu: ResumeData['education'][number], i: number) => (
      <Section key={i} title={i === 0 ? label || '' : ''} p={p}>
        <Entry
          title={
            edu.url ? (
              <a
                href={edu.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3em',
                }}
              >
                {cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType}
                {(cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area)
                  ? ` — ${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area}`
                  : ''}{' '}
                <ExternalLink size="1em" style={{ opacity: 0.5 }} />
              </a>
            ) : (
              <span>
                {cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType}
                {(cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area)
                  ? ` — ${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area}`
                  : ''}
              </span>
            )
          }
          subtitle={
            cvLocale?.boldHeaderEducation === 'company'
              ? `${edu.studyType}${edu.area ? ` — ${edu.area}` : ''}`
              : edu.institution
          }
          location={edu.location}
          date={formatCVDateRange(edu.startDate, edu.endDate)}
          p={p}
        >
          {edu.score && (
            <div style={{ fontSize: '0.93em', color: p?.textMuted || '#777', marginTop: '0.2em' }}>
              ø {edu.score}
            </div>
          )}
          {edu.courses && edu.courses.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.4em',
                marginTop: '0.6em',
              }}
            >
              {edu.courses.map((course, j) => (
                <span
                  key={j}
                  style={{
                    fontSize: '0.86em',
                    padding: '0.2em 0.8em',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    color: p?.textMuted || '#777',
                  }}
                >
                  {course}
                </span>
              ))}
            </div>
          )}
        </Entry>
      </Section>
    ))}
  </>
);
