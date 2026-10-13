import {
  RenderLink,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const SideProjectsSection = ({
  data: items,
  p,
  labels,
  label,
  formatCVDateRange,
}: MistySharedProps<ResumeData['projects']>) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <SectionHeader title={label || labels?.projects || ''} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((proj, i) => (
          <div key={i}>
            {(proj.startDate || proj.endDate) && (
              <div
                style={{
                  fontSize: '0.714em',
                  color: p?.primary,
                  fontWeight: 700,
                  marginBottom: '2px',
                }}
              >
                {formatCVDateRange(proj.startDate, proj.endDate)}
              </div>
            )}
            <div style={{ fontSize: '0.857em', fontWeight: 700, color: p?.text }}>
              <RenderLink url={proj.url} p={p}>
                {proj.name}
              </RenderLink>
            </div>
            {/* ⚠️ `entity` and `type` are both main-column-only, so the
                sidebar subtitle is the location alone. `MAIN_COLUMN_ONLY_FIELDS`
                prints the badge that promises it and `mainColumnOnlyPromise.test.ts`
                asserts it in both outputs. This line once joined `entity` on,
                and so did the serializer — the two renderers agreed, so
                `previewExportParity.test.ts` stayed green over it. */}
            {proj.location && (
              <div style={{ fontSize: '0.786em', color: p?.textMuted }}>{proj.location}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
