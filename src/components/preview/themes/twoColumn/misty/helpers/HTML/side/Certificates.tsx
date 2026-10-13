import {
  RenderLink,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const SideCertificatesSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: MistySharedProps<ResumeData['certificates']>) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <SectionHeader title={labels?.certificates || ''} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((cert, i) => (
          <div key={i}>
            {cert.date && (
              <div
                style={{
                  fontSize: '0.714em',
                  color: p?.primary,
                  fontWeight: 700,
                  marginBottom: '2px',
                }}
              >
                {formatCVDate(cert.date)}
              </div>
            )}
            <div style={{ fontSize: '0.857em', fontWeight: 700, color: p?.text }}>
              <RenderLink url={cert.url} p={p}>
                {cert.name}
              </RenderLink>
            </div>
            {cert.issuer && (
              <div style={{ fontSize: '0.714em', color: p?.textMuted, marginTop: '2px' }}>
                {cert.issuer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
