import { RenderLinkWrapper } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/RenderLinkWrapper';
import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import { sidebarHeaderStyle } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const SideAwardsSection = ({
  data,
  p,
  label,
  fontScale,
  formatCVDate,
}: SwissGridSharedProps<ResumeData['awards']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && <h3 style={sidebarHeaderStyle(p)}>{label}</h3>}
      {data.map((award: ResumeData['awards'][number], i: number) => (
        <div
          key={award._vId || i}
          style={{ marginBottom: '16px', marginTop: i === 0 && label ? '16px' : '0' }}
        >
          {award.date && (
            <div
              style={{
                fontSize: '0.75em',
                color: p.textMuted,
                fontWeight: 700,
                marginBottom: '4px',
              }}
            >
              {formatCVDate(award.date)}
            </div>
          )}
          <div style={{ fontSize: '0.8125em', fontWeight: 900, textTransform: 'uppercase' }}>
            <RenderLinkWrapper url={award.url} p={p} fontScale={fontScale}>
              {award.title}
            </RenderLinkWrapper>
          </div>
          <div style={{ fontSize: '0.875em', color: p.textMuted }}>
            {[award.awarder, award.location].filter(Boolean).join(' · ')}
          </div>
        </div>
      ))}
    </div>
  );
};
