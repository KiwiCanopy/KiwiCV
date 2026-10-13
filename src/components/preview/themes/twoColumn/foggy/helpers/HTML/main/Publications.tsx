import { SectionHeader } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { BookOpen, ExternalLink } from 'lucide-react';

export const MainPublicationsSection = ({
  data: visiblePublications,
  p,
  labels,
  formatCVDate,
}: FoggySharedProps<ResumeData['publications']>) => {
  if (!visiblePublications || visiblePublications.length === 0) return null;

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
      <SectionHeader icon={<BookOpen size={16} />} title={labels.publications} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {visiblePublications.map((pub, i) => (
          <div key={i} style={{ borderLeft: `2px solid ${p.border}`, paddingLeft: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {pub.url ? (
                <a
                  href={pub.url.startsWith('http') ? pub.url : `https://${pub.url}`}
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
                  <span style={{ fontSize: '1em', fontWeight: 700, color: p.text }}>
                    {pub.name}
                  </span>
                  <ExternalLink size={14} style={{ color: p.primary }} />
                </a>
              ) : (
                <span style={{ fontSize: '1em', fontWeight: 700, color: p.text }}>{pub.name}</span>
              )}
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
                {formatCVDate(pub.releaseDate)}
              </span>
            </div>
            <div style={{ fontSize: '0.929em', color: p.primary, fontWeight: 500 }}>
              {pub.publisher}
            </div>
            {pub.summary && (
              <p
                style={{
                  fontSize: '0.857em',
                  color: p.textMuted,
                  margin: '6px 0 0 0',
                  lineHeight: 1.5,
                }}
              >
                {pub.summary}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
