import { RenderLinkWrapper } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/RenderLinkWrapper';
import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import {
  sectionLabelStyle,
  sectionNumStyle,
} from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const MainWorkSection = ({
  cvLocale,

  data,
  p,
  label,
  num,
  fontScale,
  formatCVDateRange,
}: SwissGridSharedProps<ResumeData['work']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={sectionLabelStyle(p)}>
          <span style={sectionNumStyle(p)}>{num}</span>
          <span>{label}</span>
        </div>
      )}
      {data.map((job: ResumeData['work'][number], i: number) => (
        <div
          key={job._vId || i}
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
            {formatCVDateRange(job.startDate, job.endDate).toLocaleUpperCase(cvLocale.bcp47)}
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
              <RenderLinkWrapper url={job.url} p={p} fontScale={fontScale}>
                {(cvLocale?.boldHeaderWork === 'company'
                  ? job.name
                  : job.position
                ).toLocaleUpperCase(cvLocale.bcp47)}
              </RenderLinkWrapper>
            </div>
            <div
              style={{
                fontWeight: 700,
                color: p.primary,
                marginBottom: '12px',
                fontSize: '1em',
              }}
            >
              {[cvLocale?.boldHeaderWork === 'company' ? job.position : job.name, job.location]
                .filter(Boolean)
                .join(' · ')}
            </div>
            {job.summary && (
              <p
                style={{
                  marginBottom: '12px',
                  fontSize: '0.9375em',
                  color: p.textMuted,
                  lineHeight: 1.6,
                }}
              >
                {job.summary}
              </p>
            )}
            {job.highlights && job.highlights.length > 0 && (
              <ul
                style={{
                  listStyleType: 'disc',
                  paddingLeft: '18px',
                  margin: 0,
                  color: p.textMuted,
                  fontSize: '0.875em',
                }}
              >
                {job.highlights.map((h: string, j: number) => (
                  <li
                    key={j}
                    style={{ marginBottom: j === job.highlights!.length - 1 ? '0' : '8px' }}
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
