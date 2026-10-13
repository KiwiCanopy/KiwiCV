import {
  Badge,
  MistySection,
  RenderLink,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainPublicationsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: MistySharedProps<ResumeData['publications']>) => {
  if (!items || items.length === 0) return null;

  return (
    <MistySection title={labels?.publications || ''} p={p}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingLeft: '4px' }}>
        {items.map((pub, i) => (
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
                <RenderLink url={pub.url} p={p}>
                  {pub.name}
                </RenderLink>
              </div>
              {pub.releaseDate && <Badge p={p}>{formatCVDate(pub.releaseDate)}</Badge>}
            </div>
            <div style={{ fontSize: '0.786em', color: p?.textMuted }}>{pub.publisher}</div>
            {pub.summary && (
              <p
                style={{
                  fontSize: '0.786em',
                  color: p?.textLight,
                  margin: '2px 0 0 0',
                  lineHeight: 1.5,
                }}
              >
                {pub.summary}
              </p>
            )}
          </div>
        ))}
      </div>
    </MistySection>
  );
};
