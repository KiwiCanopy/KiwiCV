import {
  SOEntry,
  SOSection,
} from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/CommonHTML';
import type { StackoverflowSharedProps } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainWorkSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
}: StackoverflowSharedProps<ResumeData['work']>) => {
  if (!items || items.length === 0 || !p || !labels) return null;
  return (
    <SOSection title={labels.work} p={p}>
      {items.map((job, i) => (
        <SOEntry
          key={i}
          title={cvLocale?.boldHeaderWork === 'company' ? job.name : job.position}
          org={[cvLocale?.boldHeaderWork === 'company' ? job.position : job.name, job.location]
            .filter(Boolean)
            .join(' · ')}
          date={formatCVDateRange(job.startDate, job.endDate)}
          url={job.url}
          p={p}
        >
          {job.summary && (
            <p style={{ margin: '4px 0 8px', fontSize: '0.929em', color: p.text }}>{job.summary}</p>
          )}
          {job.highlights.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.929em', color: p.text }}>
              {job.highlights.map((h, j) => (
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
