import {
  Entry,
  Section,
} from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainProjectsSection = ({
  data: projects,
  label,
  formatCVDateRange,
  p,
}: LunarSharedProps<ResumeData['projects']>) => (
  <>
    {projects.map((proj: ResumeData['projects'][number], i: number) => (
      <Section key={i} title={i === 0 ? label || '' : ''} p={p}>
        <Entry
          title={
            proj.url ? (
              <a
                href={proj.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3em',
                }}
              >
                {proj.name} <ExternalLink size="1em" style={{ opacity: 0.5 }} />
              </a>
            ) : (
              proj.name
            )
          }
          // ⚠️ `type` belongs in the main column's org line, which is what
          // the editor promises next to the field and what the main serializer
          // has always emitted here. This rendered `entity` alone, so the PDF
          // carried a project type the preview never showed. Joined with `' · '`
          // rather than the em dash the other ten renderers use, because that is
          // what lunar's own main serializer emits (`typst/experience.ts`) —
          // matching it makes the two outputs look alike, not merely agree.
          subtitle={[proj.entity, proj.type].filter(Boolean).join(' · ')}
          location={proj.location}
          date={formatCVDateRange(proj.startDate, proj.endDate)}
          p={p}
        >
          {proj.description && (
            <p style={{ margin: '0.3em 0 0', fontSize: '0.93em', color: p?.textMuted || '#555' }}>
              {proj.description}
            </p>
          )}
          {proj.highlights && proj.highlights.length > 0 && (
            <ul
              style={{
                margin: '0.4em 0 0',
                paddingLeft: '1.3em',
                fontSize: '0.93em',
                color: p?.textMuted || '#555',
                listStyleType: 'disc',
              }}
            >
              {proj.highlights.map((h: string, j: number) => (
                <li key={j} style={{ marginBottom: '0.15em' }}>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </Entry>
      </Section>
    ))}
  </>
);
