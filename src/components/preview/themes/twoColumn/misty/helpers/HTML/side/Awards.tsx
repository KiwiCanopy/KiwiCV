import {
  RenderLink,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const SideAwardsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: MistySharedProps<ResumeData['awards']>) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <SectionHeader title={labels?.awards || ''} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((award, i) => (
          <div key={i}>
            {award.date && (
              <div
                style={{
                  fontSize: '0.714em',
                  color: p?.primary,
                  fontWeight: 700,
                  marginBottom: '2px',
                }}
              >
                {formatCVDate(award.date)}
              </div>
            )}
            <div style={{ fontSize: '0.857em', fontWeight: 700, color: p?.text }}>
              <RenderLink url={(award as { url?: string }).url} p={p}>
                {award.title}
              </RenderLink>
            </div>
            {(award.awarder || award.location) && (
              <div style={{ fontSize: '0.714em', color: p?.textMuted, marginTop: '2px' }}>
                {[award.awarder, award.location].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
