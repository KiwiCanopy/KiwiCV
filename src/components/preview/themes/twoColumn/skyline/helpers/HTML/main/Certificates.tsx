import { SectionHeader } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import {
  certificateRow,
  subtitleLine,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/timelineRows';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Award, ExternalLink } from 'lucide-react';

export const MainCertificatesSection = ({
  data,
  p,
  labels,
  formatCVDate,
}: SkylineSharedProps<ResumeData['certificates']>) => {
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
      <SectionHeader icon={<Award size={18} />} title={labels.certificates} isMain p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {items.map((cert, i) => {
          const row = certificateRow(cert, formatCVDate);
          const line = subtitleLine(row);
          return (
            <div key={i}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                  {row.url ? (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'flex-start',
                        gap: '4px',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <div style={{ fontSize: '1em', fontWeight: 700, color: p.textMain }}>
                        {row.title}
                      </div>
                      <ExternalLink
                        size={14}
                        style={{ color: p.primary, flexShrink: 0, marginTop: '2px' }}
                      />
                    </a>
                  ) : (
                    <div style={{ fontSize: '1em', fontWeight: 700, color: p.textMain }}>
                      {row.title}
                    </div>
                  )}
                </div>
                {row.date && (
                  <span
                    style={{
                      fontSize: '0.85em',
                      fontWeight: 600,
                      color: p.primary,
                      background: p.primaryVeryLight,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      flexShrink: 0,
                    }}
                  >
                    {row.date}
                  </span>
                )}
              </div>
              {line && (
                <div
                  style={{
                    fontSize: '0.85em',
                    fontWeight: 500,
                    color: p.primary,
                    marginTop: '2px',
                  }}
                >
                  {line}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
