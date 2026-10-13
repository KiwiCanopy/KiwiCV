import { RenderLinkWrapper } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/RenderLinkWrapper';
import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import { sidebarHeaderStyle } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const SideEducationSection = ({
  cvLocale,

  data,
  p,
  label,
  fontScale,
  formatCVDateRange,
}: SwissGridSharedProps<ResumeData['education']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && <h3 style={sidebarHeaderStyle(p)}>{label}</h3>}
      {data.map((edu: ResumeData['education'][number], i: number) => (
        <div
          key={edu._vId || i}
          style={{ marginBottom: '16px', marginTop: i === 0 && label ? '16px' : '0' }}
        >
          <div
            style={{ fontSize: '0.75em', color: p.textMuted, fontWeight: 700, marginBottom: '4px' }}
          >
            {formatCVDateRange(edu.startDate, edu.endDate)}
          </div>
          <div
            style={{
              fontSize: '0.8125em',
              fontWeight: 900,
              textTransform: 'uppercase',
              wordBreak: 'break-word',
            }}
          >
            <RenderLinkWrapper url={edu.url} p={p} fontScale={fontScale}>
              {`${cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType} — ${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area}`}
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
            {[
              cvLocale?.boldHeaderEducation === 'company'
                ? `${edu.studyType}${edu.area ? ` — ${edu.area}` : ''}`
                : edu.institution,
              edu.location,
            ]
              .filter(Boolean)
              .join(' · ')}
          </div>
          {edu.score && (
            <div style={{ fontSize: '0.75em', color: p.textMuted, fontWeight: 700 }}>
              ø {edu.score}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
