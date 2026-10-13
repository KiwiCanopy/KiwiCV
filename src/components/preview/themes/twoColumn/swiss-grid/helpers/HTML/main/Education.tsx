import { RenderLinkWrapper } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/RenderLinkWrapper';
import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import {
  sectionLabelStyle,
  sectionNumStyle,
} from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const MainEducationSection = ({
  cvLocale,

  data,
  p,
  label,
  num,
  fontScale,
  formatCVDateRange,
}: SwissGridSharedProps<ResumeData['education']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={sectionLabelStyle(p)}>
          <span style={sectionNumStyle(p)}>{num}</span>
          <span>{label}</span>
        </div>
      )}
      {data.map((edu: ResumeData['education'][number], i: number) => (
        <div
          key={edu._vId || i}
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
              paddingTop: '2px',
            }}
          >
            {formatCVDateRange(edu.startDate, edu.endDate).toLocaleUpperCase(cvLocale.bcp47)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1em' }}>
              <RenderLinkWrapper url={edu.url} p={p} fontScale={fontScale}>
                {(cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType) &&
                (cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area)
                  ? `${(cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType).toLocaleUpperCase(cvLocale.bcp47)} — ${(cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area).toLocaleUpperCase(cvLocale.bcp47)}`
                  : (
                      (cvLocale?.boldHeaderEducation === 'company'
                        ? edu.institution
                        : edu.studyType) ||
                      (cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area) ||
                      ''
                    ).toLocaleUpperCase(cvLocale.bcp47)}
              </RenderLinkWrapper>
            </div>
            <div style={{ color: p.primary, fontWeight: 700 }}>
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
              <div style={{ fontSize: '0.875em', color: p.textMuted, marginTop: '4px' }}>
                Ø {edu.score}
              </div>
            )}
            {edu.courses && edu.courses.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '12px',
                }}
              >
                {edu.courses.map((course, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: '0.75em',
                      padding: '2px 8px',
                      border: `1px solid ${p.border}`,
                      color: p.textMuted,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {course}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
