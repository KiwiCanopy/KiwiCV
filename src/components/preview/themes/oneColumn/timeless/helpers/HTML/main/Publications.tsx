import { SectionHeader } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/CommonHTML';
import type { TimelessSharedProps } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainPublicationsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: TimelessSharedProps<ResumeData['publications']>) => {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <SectionHeader label={labels.publications || 'Publications'} p={p} />
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
                    {item.name}
                    <ExternalLink size={14} style={{ opacity: 0.5 }} />
                  </a>
                ) : (
                  <>{item.name}</>
                )}
              </h3>
              <span style={{ fontSize: '0.9rem', color: p.textLight }}>
                {formatCVDate(item.releaseDate)}
              </span>
            </div>
            <div style={{ color: p.textMuted, fontSize: '1rem' }}>{item.publisher}</div>
            {item.summary && (
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: p.textMuted,
                  lineHeight: 1.6,
                  margin: '8px 0 0 0',
                }}
              >
                {item.summary}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
