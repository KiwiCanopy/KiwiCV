import { SectionHeader } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink, Folder } from 'lucide-react';

export const SideProjectsSection = ({
  data: visibleProjects,
  p,
  labels,
  label,
  icon,
  formatCVDateRange,
}: FoggySharedProps<ResumeData['projects']>) => {
  if (!visibleProjects || visibleProjects.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: p.bgCard,
        border: `1px solid ${p.border}`,
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: '20px',
      }}
    >
      <SectionHeader icon={icon || <Folder size={14} />} title={label || labels.projects} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {visibleProjects.map((proj, i) => (
          <div
            key={i}
            style={{
              backgroundColor: p.bg,
              border: `1px solid ${p.border}`,
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px',
            }}
          >
            <div
              style={{
                fontSize: '0.714em',
                color: p.primary,
                backgroundColor: p.primaryVeryLight,
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 600,
                display: 'inline-block',
                marginBottom: '6px',
              }}
            >
              {formatCVDateRange(proj.startDate, proj.endDate)}
            </div>
            {proj.url ? (
              <a
                href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'flex-start',
                  gap: '4px',
                }}
              >
                <div
                  style={{ fontSize: '0.857em', fontWeight: 700, color: p.text, lineHeight: 1.3 }}
                >
                  {proj.name}
                </div>
                <ExternalLink
                  size={11}
                  style={{ color: p.primary, flexShrink: 0, marginTop: '2px' }}
                />
              </a>
            ) : (
              <div style={{ fontSize: '0.857em', fontWeight: 700, color: p.text, lineHeight: 1.3 }}>
                {proj.name}
              </div>
            )}
            {/* ⚠️ `entity` and `type` are both main-column-only, so the
                sidebar subtitle is the location alone. `MAIN_COLUMN_ONLY_FIELDS`
                prints the badge that promises it and `mainColumnOnlyPromise.test.ts`
                asserts it in both outputs. This line once joined `entity` on,
                and so did the serializer — the two renderers agreed, so
                `previewExportParity.test.ts` stayed green over it. */}
            {proj.location && (
              <div style={{ fontSize: '0.786em', color: p.textMuted }}>{proj.location}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
