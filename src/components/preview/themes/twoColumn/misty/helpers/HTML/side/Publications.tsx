import {
  RenderLink,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const SidePublicationsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: MistySharedProps<ResumeData['publications']>) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <SectionHeader title={labels?.publications || ''} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((pub, i) => (
          <div key={i}>
            {pub.releaseDate && (
              <div
                style={{
                  fontSize: '0.714em',
                  color: p?.primary,
                  fontWeight: 700,
                  marginBottom: '2px',
                }}
              >
                {formatCVDate(pub.releaseDate)}
              </div>
            )}
            <div style={{ fontSize: '0.857em', fontWeight: 700, color: p?.text }}>
              <RenderLink url={pub.url} p={p}>
                {pub.name}
              </RenderLink>
            </div>
            {pub.publisher && (
              <div style={{ fontSize: '0.714em', color: p?.textMuted, marginTop: '2px' }}>
                {pub.publisher}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
