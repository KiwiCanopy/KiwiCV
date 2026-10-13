import { SectionHeader } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/CommonHTML';
import type { TimelessSharedProps } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainVolunteerSection = ({
  data: items,
  p,
  labels,
  formatCVDateRange,
}: TimelessSharedProps<ResumeData['volunteer']>) => {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <SectionHeader label={labels.volunteer || 'Volunteer'} p={p} />
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
                    {item.position}
                    <ExternalLink size={14} style={{ opacity: 0.5 }} />
                  </a>
                ) : (
                  <>{item.position}</>
                )}
              </h3>
              <span style={{ fontSize: '0.9rem', color: p.textLight }}>
                {formatCVDateRange(item.startDate, item.endDate)}
              </span>
            </div>
            {(item.organization || item.location) && (
              <div
                style={{
                  fontWeight: 600,
                  color: p.textMuted,
                  marginBottom: '8px',
                  fontSize: '1rem',
                }}
              >
                {[item.organization, item.location].filter(Boolean).join(' · ')}
              </div>
            )}
            {item.summary && (
              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  color: p.textMuted,
                  margin: '8px 0 0 0',
                }}
              >
                {item.summary}
              </p>
            )}
            {item.highlights && item.highlights.length > 0 && (
              <ul style={{ paddingLeft: '1.25rem', margin: '8px 0 0 0' }}>
                {item.highlights.map((highlight, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: '1rem',
                      color: p.textMuted,
                      marginBottom: '4px',
                    }}
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
