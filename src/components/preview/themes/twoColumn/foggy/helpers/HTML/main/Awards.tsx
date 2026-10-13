import { SectionHeader } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Award, ExternalLink } from 'lucide-react';

export const MainAwardsSection = ({
  data: visibleAwards,
  p,
  labels,
  formatCVDate,
}: FoggySharedProps<ResumeData['awards']>) => {
  if (!visibleAwards || visibleAwards.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: p.bgCard,
        border: `1px solid ${p.border}`,
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: '24px',
      }}
    >
      <SectionHeader icon={<Award size={16} />} title={labels.awards} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {visibleAwards.map((award, i) => (
          <div key={i} style={{ borderLeft: `2px solid ${p.border}`, paddingLeft: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: '1em', fontWeight: 700, color: p.text }}>
                  {award.url ? (
                    <a
                      href={award.url.startsWith('http') ? award.url : `https://${award.url}`}
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
                      {award.title}
                      <ExternalLink size={14} color={p.primary} />
                    </a>
                  ) : (
                    award.title
                  )}
                </span>
                {award.date && (
                  <span
                    style={{
                      padding: '3px 8px',
                      backgroundColor: p.primaryVeryLight,
                      borderRadius: '4px',
                      fontSize: '0.786em',
                      fontWeight: 600,
                      color: p.primary,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {formatCVDate(award.date)}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.86em', color: p.primary, fontWeight: 600 }}>
                {award.awarder}
                {award.awarder && award.location ? ' · ' : ''}
                {award.location}
              </span>
            </div>
            {award.summary && (
              <p
                style={{
                  fontSize: '0.857em',
                  color: p.textMuted,
                  margin: '6px 0 0 0',
                  lineHeight: 1.5,
                }}
              >
                {award.summary}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
