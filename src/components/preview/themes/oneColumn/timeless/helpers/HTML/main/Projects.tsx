import { SectionHeader } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/CommonHTML';
import type { TimelessSharedProps } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainProjectsSection = ({
  data: items,
  p,
  labels,
  label,
  formatCVDateRange,
}: TimelessSharedProps<ResumeData['projects']>) => {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <SectionHeader label={label || labels.projects || 'Projects'} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {items.map((item, i) => (
          <div key={i}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                marginBottom: '4px',
              }}
            >
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'Lora', serif",
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: p.text,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {item.name}
                  <ExternalLink size={14} style={{ opacity: 0.5 }} />
                </a>
              ) : (
                <h3
                  style={{
                    fontFamily: "'Lora', serif",
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: p.text,
                    margin: 0,
                  }}
                >
                  {item.name}
                </h3>
              )}
            </div>
            {formatCVDateRange(item.startDate, item.endDate) && (
              <div
                style={{
                  fontSize: '0.875rem',
                  color: p.textMuted,
                  marginBottom: '6px',
                  fontStyle: 'italic',
                }}
              >
                {formatCVDateRange(item.startDate, item.endDate)}
              </div>
            )}
            {(item.entity || item.location) && (
              <div style={{ color: p.textMuted, fontSize: '0.9375rem', marginBottom: '4px' }}>
                {[item.entity, item.location].filter(Boolean).join(' · ')}
              </div>
            )}
            {item.description && (
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: p.textMuted,
                  lineHeight: 1.6,
                  margin: '4px 0 0 0',
                }}
              >
                {item.description}
              </p>
            )}
            {item.highlights && item.highlights.length > 0 && (
              <ul style={{ paddingLeft: '1.25rem', margin: '8px 0 0 0' }}>
                {item.highlights.map((highlight, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: '0.9375rem',
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
