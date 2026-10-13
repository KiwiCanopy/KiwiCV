import {
  PlainEntry,
  SectionHeader,
} from '@/components/preview/themes/oneColumn/plain/helpers/shared/CommonHTML';
import type { PlainSharedProps } from '@/components/preview/themes/oneColumn/plain/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainProjectsSection = ({
  data: items,
  p,
  labels,
  label,
  formatCVDateRange,
}: PlainSharedProps<ResumeData['projects']>) => {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <SectionHeader title={label || labels.projects || ''} p={p} />
      {items.map((project, i) => (
        <PlainEntry
          key={i}
          left={
            project.url ? (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <strong>{project.name}</strong>
                {project.entity && <span style={{ marginLeft: '4px' }}>{project.entity}</span>}
                {project.location && (
                  <span style={{ marginLeft: '4px', opacity: 0.65 }}>
                    {' · '}
                    {project.location}
                  </span>
                )}
                <ExternalLink
                  size={12}
                  style={{ opacity: 0.5, marginLeft: '8px', flexShrink: 0 }}
                />
              </a>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <strong>{project.name}</strong>
                {project.entity && <span style={{ marginLeft: '4px' }}>{project.entity}</span>}
                {project.location && (
                  <span style={{ marginLeft: '4px', opacity: 0.65 }}>
                    {' · '}
                    {project.location}
                  </span>
                )}
              </span>
            )
          }
          right={formatCVDateRange(project.startDate, project.endDate)}
        >
          {project.description && (
            <p style={{ margin: '4px 0 6px', color: p.textMuted }}>{project.description}</p>
          )}
          {project.highlights && project.highlights.length > 0 && (
            <ul style={{ margin: '0', paddingLeft: '18px', listStyleType: 'disc' }}>
              {project.highlights.map((h, j) => (
                <li key={j} style={{ marginBottom: '2px' }}>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </PlainEntry>
      ))}
    </section>
  );
};
