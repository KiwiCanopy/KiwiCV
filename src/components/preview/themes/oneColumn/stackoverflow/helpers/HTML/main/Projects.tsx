import {
  SOEntry,
  SOSection,
} from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/CommonHTML';
import type { StackoverflowSharedProps } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainProjectsSection = ({
  data: items,
  p,
  labels,
  label,
  formatCVDateRange,
}: StackoverflowSharedProps<ResumeData['projects']>) => {
  if (!items || items.length === 0 || !p || !labels) return null;
  return (
    <SOSection title={label || labels.projects} p={p}>
      {items.map((proj, i) => (
        <SOEntry
          key={i}
          title={proj.name}
          org={[[proj.entity, proj.type].filter(Boolean).join(' — '), proj.location]
            .filter(Boolean)
            .join(' · ')}
          date={formatCVDateRange(proj.startDate, proj.endDate)}
          url={proj.url}
          p={p}
        >
          {proj.description && (
            <p style={{ margin: '4px 0 8px', fontSize: '0.929em', color: p.text }}>
              {proj.description}
            </p>
          )}
          {proj.highlights && proj.highlights.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.929em', color: p.text }}>
              {proj.highlights.map((h, j) => (
                <li key={j} style={{ marginBottom: '3px' }}>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </SOEntry>
      ))}
    </SOSection>
  );
};
