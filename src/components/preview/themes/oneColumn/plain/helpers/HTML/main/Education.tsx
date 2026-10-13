import {
  PlainEntry,
  SectionHeader,
} from '@/components/preview/themes/oneColumn/plain/helpers/shared/CommonHTML';
import type { PlainSharedProps } from '@/components/preview/themes/oneColumn/plain/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainEducationSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
}: PlainSharedProps<ResumeData['education']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <section>
      <SectionHeader title={labels.education || ''} p={p} />
      {items.map((edu, i) => (
        <PlainEntry
          key={i}
          left={
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
                }}
              >
                <strong>
                  {cvLocale?.boldHeaderEducation === 'company'
                    ? `${edu.studyType}${edu.area ? ` — ${edu.area}` : ''}`
                    : edu.institution}
                </strong>
                <span style={{ marginLeft: '4px' }}>
                  {cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType}
                  {(cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area)
                    ? ` ${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area}`
                    : ''}
                </span>
                {edu.location && (
                  <span style={{ marginLeft: '4px', opacity: 0.65 }}>
                    {' · '}
                    {edu.location}
                  </span>
                )}
                <ExternalLink
                  size={12}
                  style={{ opacity: 0.5, marginLeft: '8px', flexShrink: 0 }}
                />
              </a>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <strong>
                  {cvLocale?.boldHeaderEducation === 'company'
                    ? `${edu.studyType}${edu.area ? ` — ${edu.area}` : ''}`
                    : edu.institution}
                </strong>
                <span style={{ marginLeft: '4px' }}>
                  {cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType}
                  {(cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area)
                    ? ` ${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area}`
                    : ''}
                </span>
                {edu.location && (
                  <span style={{ marginLeft: '4px', opacity: 0.65 }}>
                    {' · '}
                    {edu.location}
                  </span>
                )}
              </span>
            )
          }
          right={formatCVDateRange(edu.startDate, edu.endDate)}
        >
          {edu.score && (
            <p style={{ margin: '0', color: p.textMuted, fontSize: '0.925em' }}>ø {edu.score}</p>
          )}
          {edu.courses && edu.courses.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
                fontSize: '0.85em',
                color: p.textMuted || '#666',
                marginTop: '4px',
              }}
            >
              {edu.courses.map((course, j) => (
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
        </PlainEntry>
      ))}
    </section>
  );
};
