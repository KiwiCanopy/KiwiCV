import { SectionHeader } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/CommonHTML';
import type { TimelessSharedProps } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainEducationSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
}: TimelessSharedProps<ResumeData['education']>) => {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <SectionHeader label={labels.education || 'Education'} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {items.map((item, i) => (
          <div key={i}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '4px',
              }}
            >
              <h3
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: p.text,
                  margin: 0,
                }}
              >
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {cvLocale?.boldHeaderEducation === 'company'
                      ? item.institution
                      : item.studyType}
                    {(cvLocale?.boldHeaderEducation === 'company'
                      ? item.institution
                      : item.studyType) &&
                    (cvLocale?.boldHeaderEducation === 'company' ? '' : item.area)
                      ? ' — '
                      : ''}
                    {cvLocale?.boldHeaderEducation === 'company' ? '' : item.area}
                    <ExternalLink size={14} style={{ opacity: 0.5 }} />
                  </a>
                ) : (
                  <>
                    {cvLocale?.boldHeaderEducation === 'company'
                      ? item.institution
                      : item.studyType}
                    {(cvLocale?.boldHeaderEducation === 'company'
                      ? item.institution
                      : item.studyType) &&
                    (cvLocale?.boldHeaderEducation === 'company' ? '' : item.area)
                      ? ' — '
                      : ''}
                    {cvLocale?.boldHeaderEducation === 'company' ? '' : item.area}
                  </>
                )}
              </h3>
              <span style={{ fontSize: '0.9rem', color: p.textLight }}>
                {formatCVDateRange(item.startDate, item.endDate)}
              </span>
            </div>
            <div style={{ color: p.textMuted, fontSize: '1rem' }}>
              {[
                cvLocale?.boldHeaderEducation === 'company'
                  ? `${item.studyType}${item.area ? ` — ${item.area}` : ''}`
                  : item.institution,
                item.location,
              ]
                .filter(Boolean)
                .join(' · ')}
            </div>
            {item.score && (
              <div style={{ color: p.textMuted, fontSize: '0.9rem', marginTop: '4px' }}>
                ø {item.score}
              </div>
            )}
            {item.courses && item.courses.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '12px',
                }}
              >
                {item.courses.map((course, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: '0.875rem',
                      padding: '4px 10px',
                      backgroundColor: p.bgLight,
                      borderRadius: '4px',
                      color: p.textMuted,
                      fontWeight: 500,
                    }}
                  >
                    {course}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
