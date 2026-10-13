import { SideSectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink, FolderOpen } from 'lucide-react';

export const SideProjectsSection = ({
  data: items,
  p,
  label,
  labels,
  formatCVDateRange,
}: SoftSharedProps<ResumeData['projects']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '12px' }}>
      {/*
       * ⚠️ `label` first. `SoftHTML.tsx` maps **both** `projects` and
       * `privateProjects` to this one component and passes each section's
       * resolved label down; ignoring it printed "Projects" over both, while
       * the serializer labelled the second "Private Projects" from the same
       * `sectionId`. soft's nine other side sections are single-purpose, so
       * their hardcoded `labels.x` is right by accident rather than by rule —
       * `main/Projects.tsx` is the one that already had it right.
       */}
      <SideSectionHeader title={label || labels.projects || 'Projects'} p={p} icon={FolderOpen} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((item, i) => {
          /**
           * ⚠️ Guarded on the **formatted range**, not on `item.startDate`.
           * `side/Work.tsx` and its siblings guard on `startDate` alone, so an
           * entry carrying only an `endDate` renders nothing on screen while
           * `serializeProjects` still emits a range for it — which is the
           * `endDate` half of the four rows this closes. `lunar`'s
           * `side/Projects.tsx` guards this way for the same reason.
           */
          const dateStr = formatCVDateRange(item.startDate, item.endDate);
          return (
            <div key={i} style={{ width: '100%' }}>
              {dateStr && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: p.primary,
                    fontWeight: 600,
                    margin: '0 0 2px 0',
                  }}
                >
                  {dateStr}
                </p>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2px',
                }}
              >
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <h5
                      style={{
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        margin: 0,
                        color: p.textMain,
                      }}
                    >
                      {item.name}
                    </h5>
                    <ExternalLink size={12} color={p.primary} />
                  </a>
                ) : (
                  <h5
                    style={{ fontWeight: 700, fontSize: '0.8125rem', margin: 0, color: p.textMain }}
                  >
                    {item.name}
                  </h5>
                )}
              </div>
              {/* ⚠️ `entity` and `type` are both main-column-only, so the
                  sidebar subtitle is the location alone. `MAIN_COLUMN_ONLY_FIELDS`
                  prints the badge that promises it and `mainColumnOnlyPromise.test.ts`
                  asserts it in both outputs. This line once joined `entity` on,
                  and so did the serializer — the two renderers agreed, so
                  `previewExportParity.test.ts` stayed green over it. */}
              {item.location && (
                <p style={{ color: p.textLight, fontSize: '0.75rem', margin: '1px 0' }}>
                  {item.location}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
