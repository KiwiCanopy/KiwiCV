import { RenderLinkWrapper } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/RenderLinkWrapper';
import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import { sidebarHeaderStyle } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const SidePublicationsSection = ({
  data,
  p,
  label,
  fontScale,
  formatCVDate,
}: SwissGridSharedProps<ResumeData['publications']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && <h3 style={sidebarHeaderStyle(p)}>{label}</h3>}
      {data.map((pub: ResumeData['publications'][number], i: number) => (
        <div
          key={pub._vId || i}
          style={{ marginBottom: '16px', marginTop: i === 0 && label ? '16px' : '0' }}
        >
          {pub.releaseDate && (
            <div
              style={{
                fontSize: '0.75em',
                color: p.textMuted,
                fontWeight: 700,
                marginBottom: '4px',
              }}
            >
              {formatCVDate(pub.releaseDate)}
            </div>
          )}
          <div style={{ fontSize: '0.8125em', fontWeight: 900, textTransform: 'uppercase' }}>
            <RenderLinkWrapper url={pub.url} p={p} fontScale={fontScale}>
              {pub.name}
            </RenderLinkWrapper>
          </div>
          <div style={{ fontSize: '0.875em', color: p.primary, fontWeight: 700 }}>
            {pub.publisher}
          </div>
        </div>
      ))}
    </div>
  );
};
