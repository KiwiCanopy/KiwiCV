import {
  SOEntry,
  SOSection,
} from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/CommonHTML';
import type { StackoverflowSharedProps } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainVolunteerSection = ({
  data: items,
  p,
  labels,
  formatCVDateRange,
}: StackoverflowSharedProps<ResumeData['volunteer']>) => {
  if (!items || items.length === 0 || !p || !labels) return null;
  return (
    <SOSection title={labels.volunteer} p={p}>
      {items.map((v, i) => (
        <SOEntry
          key={i}
          title={v.position}
          org={[v.organization, v.location].filter(Boolean).join(' · ')}
          date={formatCVDateRange(v.startDate, v.endDate)}
          url={v.url}
          p={p}
        >
          {v.summary && (
            <p style={{ margin: '4px 0 8px', fontSize: '0.929em', color: p.text }}>{v.summary}</p>
          )}
          {v.highlights && v.highlights.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.929em', color: p.text }}>
              {v.highlights.map((h, j) => (
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
