import { SectionHeader } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Award, ExternalLink } from 'lucide-react';

export const SideCertificatesSection = ({
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
        padding: '20px',
      }}
    >
      <SectionHeader icon={<Award size={14} />} title={labels.certificates} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {visibleCertificates.map((cert, i) => (
          <div
            key={i}
            style={{
              backgroundColor: p.bg,
              border: `1px solid ${p.border}`,
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: i === visibleCertificates.length - 1 ? '0' : '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px',
            }}
          >
            {cert.date && (
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
                {formatCVDate(cert.date)}
              </div>
            )}
            {cert.url ? (
              <a
                href={cert.url.startsWith('http') ? cert.url : `https://${cert.url}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: '4px',
                }}
              >
                <div style={{ fontSize: '0.857em', fontWeight: 700, color: p.text }}>
                  {cert.name}
                </div>
                <ExternalLink
                  size={11}
                  style={{ color: p.primary, flexShrink: 0, alignSelf: 'center' }}
                />
              </a>
            ) : (
              <div style={{ fontSize: '0.857em', fontWeight: 700, color: p.text }}>{cert.name}</div>
            )}
            <div style={{ fontSize: '0.786em', color: p.textMuted }}>{cert.issuer}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
