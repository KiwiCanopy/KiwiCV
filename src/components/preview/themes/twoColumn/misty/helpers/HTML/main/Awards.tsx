import {
  Badge,
  MistySection,
  RenderLink,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainAwardsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: MistySharedProps<ResumeData['awards']>) => {
  if (!items || items.length === 0) return null;

  return (
    <MistySection title={labels?.awards || ''} p={p}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingLeft: '4px' }}>
        {items.map((award, i) => (
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
                <RenderLink url={(award as { url?: string }).url} p={p}>
                  {award.title}
                </RenderLink>
              </div>
              {award.date && <Badge p={p}>{formatCVDate(award.date)}</Badge>}
            </div>
            {(award.awarder || award.location) && (
              <div style={{ fontSize: '0.786em', color: p?.textMuted }}>
                {[award.awarder, award.location].filter(Boolean).join(' · ')}
              </div>
            )}
            {award.summary && (
              <p
                style={{
                  fontSize: '0.786em',
                  color: p?.textLight,
                  margin: '2px 0 0 0',
                  lineHeight: 1.5,
                  fontStyle: 'italic',
                }}
              >
                {award.summary}
              </p>
            )}
          </div>
        ))}
      </div>
    </MistySection>
  );
};
