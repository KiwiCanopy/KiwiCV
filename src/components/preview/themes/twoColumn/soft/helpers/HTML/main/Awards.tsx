import { SectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Award, ExternalLink } from 'lucide-react';

export const MainAwardsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: SoftSharedProps<ResumeData['awards']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <SectionHeader title={labels.awards || 'Awards'} p={p} icon={Award} />

      {items.map((item, i) => (
        <div
          key={i}
          style={{
            paddingLeft: '12px',
            borderLeft: `2px solid ${p.border}`,
            marginLeft: '14px',
            marginBottom: i === items.length - 1 ? 0 : '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px',
              gap: '12px',
            }}
          >
            <div>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <h4 style={{ fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>{item.title}</h4>
                  <ExternalLink size={14} color={p.primary} />
                </a>
              ) : (
                <h4 style={{ fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>{item.title}</h4>
              )}
              {(item.awarder || item.location) && (
                <p
                  style={{
                    color: p.primary,
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    margin: '2px 0 0 0',
                  }}
                >
                  {[item.awarder, item.location].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            {item.date && (
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: p.primary,
                  backgroundColor: `${p.primary}12`,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {formatCVDate(item.date)}
              </span>
            )}
          </div>

          {item.summary && (
            <p
              style={{
                fontSize: '0.9375rem',
                color: p.textLight,
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
  );
};
