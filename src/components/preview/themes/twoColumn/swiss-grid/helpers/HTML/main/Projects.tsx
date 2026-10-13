import { RenderLinkWrapper } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/RenderLinkWrapper';
import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import {
  sectionLabelStyle,
  sectionNumStyle,
} from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const MainProjectsSection = ({
  cvLocale,
  data,
  p,
  label,
  num,
  fontScale,
  formatCVDateRange,
}: SwissGridSharedProps<ResumeData['projects']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={sectionLabelStyle(p)}>
          <span style={sectionNumStyle(p)}>{num}</span>
          <span>{label}</span>
        </div>
      )}
      {data.map((project: ResumeData['projects'][number], i: number) => (
        <div
          key={project._vId || i}
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
            {formatCVDateRange(project.startDate, project.endDate).toLocaleUpperCase(
              cvLocale.bcp47,
            )}
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
              <RenderLinkWrapper url={project.url} p={p} fontScale={fontScale}>
                {project.name.toLocaleUpperCase(cvLocale.bcp47)}
              </RenderLinkWrapper>
            </div>
            <div
              style={{
                fontWeight: 700,
                color: p.primary,
                marginBottom: '12px',
                fontSize: '0.875em',
              }}
            >
              {[[project.entity, project.type].filter(Boolean).join(' — '), project.location]
                .filter(Boolean)
                .join(' · ')}
            </div>
            {project.description && (
              <p
                style={{
                  marginBottom: '12px',
                  fontSize: '0.9375em',
                  color: p.textMuted,
                  lineHeight: 1.6,
                }}
              >
                {project.description}
              </p>
            )}
            {project.highlights && project.highlights.length > 0 && (
              <ul
                style={{
                  listStyleType: 'disc',
                  paddingLeft: '18px',
                  margin: 0,
                  color: p.textMuted,
                  fontSize: '0.875em',
                }}
              >
                {project.highlights.map((h: string, j: number) => (
                  <li
                    key={j}
                    style={{ marginBottom: j === project.highlights!.length - 1 ? '0' : '8px' }}
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
