import { RenderLinkWrapper } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/RenderLinkWrapper';
import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import {
  sectionLabelStyle,
  sectionNumStyle,
} from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const MainAwardsSection = ({
  cvLocale,
  data,
  p,
  label,
  num,
  fontScale,
  formatCVDate,
}: SwissGridSharedProps<ResumeData['awards']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={sectionLabelStyle(p)}>
          <span style={sectionNumStyle(p)}>{num}</span>
          <span>{label}</span>
        </div>
      )}
      {data.map((award: ResumeData['awards'][number], i: number) => (
        <div
          key={award._vId || i}
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr',
            gap: '24px',
            marginBottom: i === data.length - 1 ? '0' : '32px',
          }}
        >
          <div
            style={{
              fontSize: '0.8125em',
              fontWeight: 700,
              color: p.textMuted,
              paddingTop: '4px',
            }}
          >
            {formatCVDate(award.date).toLocaleUpperCase(cvLocale.bcp47)}
          </div>
          <div>
            <div
              style={{
                fontSize: '1.25em',
                fontWeight: 900,
                marginBottom: '4px',
                letterSpacing: '-0.02em',
              }}
            >
              <RenderLinkWrapper url={award.url} p={p} fontScale={fontScale}>
                {award.title.toLocaleUpperCase(cvLocale.bcp47)}
              </RenderLinkWrapper>
            </div>
            <div style={{ fontWeight: 700, color: p.primary }}>
              {[award.awarder, award.location].filter(Boolean).join(' · ')}
            </div>
            {award.summary && (
              <p
                style={{
                  marginTop: '8px',
                  fontSize: '0.9375em',
                  color: p.textMuted,
                  lineHeight: 1.6,
                }}
              >
                {award.summary}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
