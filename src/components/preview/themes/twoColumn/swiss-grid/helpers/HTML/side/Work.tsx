import { RenderLinkWrapper } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/RenderLinkWrapper';
import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import { sidebarHeaderStyle } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const SideWorkSection = ({
  cvLocale,

  data,
  p,
  label,
  fontScale,
  formatCVDateRange,
}: SwissGridSharedProps<ResumeData['work']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && <h3 style={sidebarHeaderStyle(p)}>{label}</h3>}
      {data.map((job: ResumeData['work'][number], i: number) => (
        <div
          key={job._vId || i}
          style={{ marginBottom: '16px', marginTop: i === 0 && label ? '16px' : '0' }}
        >
          <div
            style={{ fontSize: '0.75em', color: p.textMuted, fontWeight: 700, marginBottom: '4px' }}
          >
            {formatCVDateRange(job.startDate, job.endDate)}
          </div>
          <div
            style={{
              fontSize: '0.8125em',
              fontWeight: 900,
              textTransform: 'uppercase',
              wordBreak: 'break-word',
            }}
          >
            <RenderLinkWrapper url={job.url} p={p} fontScale={fontScale}>
              {cvLocale?.boldHeaderWork === 'company' ? job.name : job.position}
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
            {[cvLocale?.boldHeaderWork === 'company' ? job.position : job.name, job.location]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>
      ))}
    </div>
  );
};
