import { SectionHeader } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import {
  awardRow,
  subtitleLine,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/timelineRows';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Award, ExternalLink } from 'lucide-react';

export const MainAwardsSection = ({
  data,
  p,
  labels,
  formatCVDate,
}: SkylineSharedProps<ResumeData['awards']>) => {
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
      <SectionHeader icon={<Award size={18} />} title={labels.awards} isMain p={p} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {items.map((award, i) => {
          const row = awardRow(award, formatCVDate);
          const line = subtitleLine(row);
          return (
            <div
              key={i}
              style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1.5px solid rgba(255, 255, 255, 1)',
                borderRadius: '12px',
                boxShadow: `-4px 4px 12px ${p.primaryLight}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {row.url ? (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <div style={{ fontSize: '1.05em', fontWeight: 700, color: p.textMain }}>
                        {row.title}
                      </div>
                      <ExternalLink size={14} style={{ color: p.primary }} />
                    </a>
                  ) : (
                    <div style={{ fontSize: '1.05em', fontWeight: 700, color: p.textMain }}>
                      {row.title}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.85em',
                    fontWeight: 600,
                    color: p.primary,
                    background: p.primaryVeryLight,
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {row.date}
                </span>
              </div>
              {line && (
                <div
                  style={{
                    fontSize: '0.95em',
                    fontWeight: 600,
                    color: p.primary,
                    marginTop: '4px',
                  }}
                >
                  {line}
                </div>
              )}
              {row.summary && (
                <p
                  style={{
                    fontSize: '0.95em',
                    color: p.textMuted,
                    marginTop: '12px',
                    lineHeight: 1.6,
                  }}
                >
                  {row.summary}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
