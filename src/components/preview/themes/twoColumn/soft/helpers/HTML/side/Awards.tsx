import { SideSectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Award, ExternalLink } from 'lucide-react';

export const SideAwardsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: SoftSharedProps<ResumeData['awards']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '12px' }}>
      <SideSectionHeader title={labels.awards || 'Awards'} p={p} icon={Award} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ width: '100%' }}>
            {item.date && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: p.primary,
                  fontWeight: 600,
                  margin: '0 0 2px 0',
                }}
              >
                {formatCVDate(item.date)}
              </p>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '2px',
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <h5 style={{ fontWeight: 700, fontSize: '0.8125rem', margin: 0 }}>
                    {item.title}
                  </h5>
                  <ExternalLink size={12} color={p.primary} />
                </a>
              ) : (
                <h5
                  style={{
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    margin: '0 0 2px 0',
                    color: p.textMain,
                  }}
                >
                  {item.title}
                </h5>
              )}
            </div>
            {(item.awarder || item.location) && (
              <p style={{ color: p.textLight, fontSize: '0.75rem', margin: 0 }}>
                {[item.awarder, item.location].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
