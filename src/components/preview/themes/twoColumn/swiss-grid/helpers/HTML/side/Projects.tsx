import { RenderLinkWrapper } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/RenderLinkWrapper';
import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import { sidebarHeaderStyle } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const SideProjectsSection = ({
  data,
  p,
  label,
  fontScale,
  formatCVDateRange,
}: SwissGridSharedProps<ResumeData['projects']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && <h3 style={sidebarHeaderStyle(p)}>{label}</h3>}
      {data.map((project: ResumeData['projects'][number], i: number) => (
        <div
          key={project._vId || i}
          style={{ marginBottom: '16px', marginTop: i === 0 && label ? '16px' : '0' }}
        >
          <div
            style={{ fontSize: '0.75em', color: p.textMuted, fontWeight: 700, marginBottom: '4px' }}
          >
            {formatCVDateRange(project.startDate, project.endDate)}
          </div>
          <div
            style={{
              fontSize: '0.8125em',
              fontWeight: 900,
              textTransform: 'uppercase',
              wordBreak: 'break-word',
            }}
          >
            <RenderLinkWrapper url={project.url} p={p} fontScale={fontScale}>
              {project.name}
            </RenderLinkWrapper>
          </div>
          {/* ⚠️ `entity` and `type` are both main-column-only, so the
              sidebar subtitle is the location alone. `MAIN_COLUMN_ONLY_FIELDS` prints
              the badge that promises it and `mainColumnOnlyPromise.test.ts` asserts it
              in both outputs. This line once joined `entity` on, and so did the
              serializer — the two renderers agreed, so `previewExportParity.test.ts`
              stayed green over it. */}
          {project.location && (
            <div
              style={{
                fontSize: '0.875em',
                color: p.primary,
                fontWeight: 700,
                wordBreak: 'break-word',
              }}
            >
              {project.location}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
