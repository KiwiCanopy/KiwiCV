import { RenderLinkWrapper } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/RenderLinkWrapper';
import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import { sidebarHeaderStyle } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const SideCertificatesSection = ({
  data,
  p,
  label,
  fontScale,
  formatCVDate,
}: SwissGridSharedProps<ResumeData['certificates']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && <h3 style={sidebarHeaderStyle(p)}>{label}</h3>}
      {data.map((cert: ResumeData['certificates'][number], i: number) => (
        <div
          key={cert._vId || i}
          style={{ marginBottom: '16px', marginTop: i === 0 && label ? '16px' : '0' }}
        >
          <div
            style={{ fontSize: '0.75em', color: p.textMuted, fontWeight: 700, marginBottom: '4px' }}
          >
            {formatCVDate(cert.date)}
          </div>
          <div
            style={{
              fontSize: '0.8125em',
              fontWeight: 900,
              textTransform: 'uppercase',
              wordBreak: 'break-word',
            }}
          >
            <RenderLinkWrapper url={cert.url} p={p} fontScale={fontScale}>
              {cert.name}
            </RenderLinkWrapper>
          </div>
          <div
            style={{
              fontSize: '0.875em',
              color: p.primary,
              fontWeight: 700,
              wordBreak: 'break-word',
            }}
          >
            {cert.issuer}
          </div>
        </div>
      ))}
    </div>
  );
};
