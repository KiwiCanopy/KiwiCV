import { SidebarItem } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const SideProjectsSection = ({
  data: projects,
  formatCVDateRange,
  p,
}: LunarSharedProps<ResumeData['projects']>) => (
  <>
    {projects.map((proj, i) => (
      <SidebarItem key={i} p={p}>
        {formatCVDateRange(proj.startDate, proj.endDate) && (
          <div style={{ opacity: 0.7, fontSize: '0.86em', marginBottom: '0.1em' }}>
            {formatCVDateRange(proj.startDate, proj.endDate)}
          </div>
        )}
        {proj.url ? (
          <a
            href={proj.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3em',
            }}
          >
            {proj.name} <ExternalLink size="0.9em" style={{ opacity: 0.5 }} />
          </a>
        ) : (
          <div style={{ fontWeight: 600 }}>{proj.name}</div>
        )}
        {/* ⚠️ `entity` and `type` are both main-column-only, so the
            sidebar subtitle is the location alone. `MAIN_COLUMN_ONLY_FIELDS` prints
            the badge that promises it and `mainColumnOnlyPromise.test.ts` asserts it
            in both outputs. This line once joined `entity` on, and so did the
            serializer — the two renderers agreed, so `previewExportParity.test.ts`
            stayed green over it. */}
        {proj.location && (
          <div style={{ opacity: 0.7, fontSize: '0.86em', marginTop: '0.1em' }}>
            {proj.location}
          </div>
        )}
        {/*
         * ⚠️ **No `description` here, deliberately.** lunar's sidebar is a
         * compact list: `side/Work`, `side/Volunteer`, `side/Awards`,
         * `side/Education`, `side/Publications` and `side/References` all render
         * date/title/subtitle and stop, and their serializers agree — lunar drops
         * `work.summary` in the sidebar on *both* sides, with no mismatch to show
         * for it. This component used to be the single exception, rendering a
         * paragraph the sidebar serializer never emitted, so a user who moved
         * projects to the sidebar watched their description appear on screen and
         * exported a PDF without it (`previewExportParity.test.ts`).
         *
         * Resolved toward the sidebar's own design rather than by teaching the
         * serializer a paragraph: twelve places (six sections × two renderers)
         * say the sidebar carries no prose, and one said it did. The description
         * is still rendered in full by `main/Projects.tsx`, which is where the
         * main-column serializer emits it too.
         */}
      </SidebarItem>
    ))}
  </>
);
