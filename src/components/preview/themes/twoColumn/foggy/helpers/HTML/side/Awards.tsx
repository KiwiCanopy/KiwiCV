import { SectionHeader } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Award, ExternalLink } from 'lucide-react';

export const SideAwardsSection = ({
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
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <SectionHeader icon={<Award size={14} />} title={labels.awards} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {visibleAwards.map((award, i) => (
          <div
            key={i}
            style={{
              backgroundColor: p.bg,
              border: `1px solid ${p.border}`,
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: i === visibleAwards.length - 1 ? '0' : '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {award.date && (
                <div
                  style={{
                    fontSize: '0.714em',
                    color: p.primary,
                    backgroundColor: p.primaryVeryLight,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    display: 'inline-block',
                    marginBottom: '6px',
                    width: 'fit-content',
                  }}
                >
                  {formatCVDate(award.date)}
                </div>
              )}
              <span style={{ fontSize: '0.929em', fontWeight: 700, color: p.text }}>
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
                      gap: '4px',
                    }}
                  >
                    {award.title}
                    <ExternalLink size={11} color={p.primary} />
                  </a>
                ) : (
                  award.title
                )}
              </span>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '0.8em', color: p.primary, fontWeight: 600 }}>
                  {award.awarder}
                  {award.awarder && award.location ? ' · ' : ''}
                  {award.location}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
