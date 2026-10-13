import {
  Badge,
  MistySection,
  RenderLink,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainCertificatesSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: MistySharedProps<ResumeData['certificates']>) => {
  if (!items || items.length === 0) return null;

  return (
    <MistySection title={labels?.certificates || ''} p={p}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingLeft: '4px' }}>
        {items.map((cert, i) => (
          <div key={i}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '0.857em', fontWeight: 700, color: p?.text }}>
                <RenderLink url={cert.url} p={p}>
                  {cert.name}
                </RenderLink>
              </div>
              {cert.date && <Badge p={p}>{formatCVDate(cert.date)}</Badge>}
            </div>
            <div style={{ fontSize: '0.786em', color: p?.textMuted }}>{cert.issuer}</div>
          </div>
        ))}
      </div>
    </MistySection>
  );
};
