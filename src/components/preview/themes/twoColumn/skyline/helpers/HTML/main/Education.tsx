import { SectionHeader } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import {
  educationTimelineRow,
  subtitleLine,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/timelineRows';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink, GraduationCap } from 'lucide-react';

export const MainEducationSection = ({
  cvLocale,

  data,
  p,
  labels,
  formatCVDateRange,
}: SkylineSharedProps<ResumeData['education']>) => {
  const items = data;
  if (!items?.length) return null;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(255, 255, 255, 1)',
        boxShadow: `-8px 8px 32px 0 ${p.primaryLight}`,
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '16px',
      }}
    >
      <SectionHeader icon={<GraduationCap size={18} />} title={labels.education} isMain p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {items.map((edu, i) => {
          const row = educationTimelineRow(edu, cvLocale, formatCVDateRange);
          const title = (
            <div style={{ fontSize: '1em', fontWeight: 700, color: p.textMain }}>{row.title}</div>
          );
          return (
            <div key={i}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                  marginBottom: '4px',
                }}
              >
                {row.url ? (
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    {title}
                    <ExternalLink size={14} style={{ color: p.primary, flexShrink: 0 }} />
                  </a>
                ) : (
                  title
                )}
                <div
                  style={{
                    fontSize: '0.8125em',
                    color: p.primary,
                    backgroundColor: p.primaryVeryLight,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.date}
                </div>
              </div>

              <div style={{ fontSize: '0.85em', fontWeight: 500, color: p.primary }}>
                {subtitleLine(row)}
              </div>

              {row.score && (
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: '0.875em',
                    color: p.textMuted,
                    opacity: 0.9,
                  }}
                >
                  ø {row.score}
                </p>
              )}

              {row.courses && row.courses.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  {row.courses.map((course, j) => (
                    <span
                      key={j}
                      style={{
                        padding: '4px 12px',
                        background: '#ffffff',
                        borderRadius: '10px',
                        border: `1px solid ${p.border}`,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                        fontSize: '0.8em',
                        fontWeight: 600,
                        color: p.textMuted,
                      }}
                    >
                      {course}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
