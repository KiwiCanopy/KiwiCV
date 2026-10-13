import { SectionHeader } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Award, ExternalLink } from 'lucide-react';

export const MainCertificatesSection = ({
  data: visibleCertificates,
  p,
  labels,
  formatCVDate,
}: FoggySharedProps<ResumeData['certificates']>) => {
  if (!visibleCertificates || visibleCertificates.length === 0) return null;

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
      <SectionHeader icon={<Award size={16} />} title={labels.certificates} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {visibleCertificates.map((cert, i) => (
          <div key={i} style={{ borderLeft: `2px solid ${p.border}`, paddingLeft: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1em', fontWeight: 700, color: p.text }}>
                {cert.url ? (
                  <a
                    href={cert.url.startsWith('http') ? cert.url : `https://${cert.url}`}
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
                    {cert.name}
                    <ExternalLink size={14} color={p.primary} />
                  </a>
                ) : (
                  cert.name
                )}
              </div>
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
                {formatCVDate(cert.date)}
              </span>
            </div>
            <div style={{ fontSize: '0.929em', color: p.primary, fontWeight: 500 }}>
              {cert.issuer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
