import { RenderLinkWrapper } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/RenderLinkWrapper';
import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import {
  sectionLabelStyle,
  sectionNumStyle,
} from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const MainVolunteerSection = ({
  cvLocale,
  data,
  p,
  label,
  num,
  fontScale,
  formatCVDateRange,
}: SwissGridSharedProps<ResumeData['volunteer']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={sectionLabelStyle(p)}>
          <span style={sectionNumStyle(p)}>{num}</span>
          <span>{label}</span>
        </div>
      )}
      {data.map((vol: ResumeData['volunteer'][number], i: number) => (
        <div
          key={vol._vId || i}
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr',
            gap: '24px',
            marginBottom: i === data.length - 1 ? '0' : '48px',
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
            {formatCVDateRange(vol.startDate, vol.endDate).toLocaleUpperCase(cvLocale.bcp47)}
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
              <RenderLinkWrapper url={vol.url} p={p} fontScale={fontScale}>
                {vol.position.toLocaleUpperCase(cvLocale.bcp47)}
              </RenderLinkWrapper>
            </div>
            {(vol.organization || vol.location) && (
              <div
                style={{
                  fontWeight: 700,
                  color: p.primary,
                  marginBottom: '12px',
                  fontSize: '1em',
                }}
              >
                {[vol.organization, vol.location].filter(Boolean).join(' · ')}
              </div>
            )}
            {vol.summary && (
              <p
                style={{
                  marginBottom: '12px',
                  fontSize: '0.9375em',
                  color: p.textMuted,
                  lineHeight: 1.6,
                }}
              >
                {vol.summary}
              </p>
            )}
            {vol.highlights && vol.highlights.length > 0 && (
              <ul
                style={{
                  listStyleType: 'disc',
                  paddingLeft: '18px',
                  margin: 0,
                  color: p.textMuted,
                  fontSize: '0.875em',
                }}
              >
                {vol.highlights.map((h: string, j: number) => (
                  <li
                    key={j}
                    style={{ marginBottom: j === vol.highlights!.length - 1 ? '0' : '8px' }}
                  >
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
