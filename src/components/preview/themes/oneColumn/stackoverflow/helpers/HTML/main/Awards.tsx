import {
  SOEntry,
  SOSection,
} from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/CommonHTML';
import type { StackoverflowSharedProps } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainAwardsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: StackoverflowSharedProps<ResumeData['awards']>) => {
  if (!items || items.length === 0 || !p || !labels) return null;
  return (
    <SOSection title={labels.awards} p={p}>
      {items.map((a, i) => (
        <SOEntry
          key={i}
          title={a.title}
          org={[a.awarder, a.location].filter(Boolean).join(' · ')}
          date={formatCVDate(a.date)}
          url={a.url}
          p={p}
        >
          {a.summary && (
            <p style={{ margin: '4px 0 8px', fontSize: '0.929em', color: p.text }}>{a.summary}</p>
          )}
        </SOEntry>
      ))}
    </SOSection>
  );
};
