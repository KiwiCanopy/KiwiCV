import {
  BulletList,
  ElegantEntry,
  ElegantSection,
} from '@/components/preview/themes/oneColumn/elegant/helpers/shared/CommonHTML';
import type { ElegantSharedProps } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainWorkSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
}: ElegantSharedProps<ResumeData['work']>) => {
  if (!items || items.length === 0) return null;

  return (
    <ElegantSection title={labels.work} p={p}>
      {items.map((job, i) => (
        <ElegantEntry
          key={i}
          p={p}
          title={cvLocale?.boldHeaderWork === 'company' ? job.name : job.position}
          org={cvLocale?.boldHeaderWork === 'company' ? job.position : job.name}
          location={job.location}
          date={formatCVDateRange(job.startDate, job.endDate)}
          url={job.url}
        >
          {job.summary && (
            <p style={{ margin: '6px 0', fontSize: '0.929em', color: '#4a5568' }}>{job.summary}</p>
          )}
          <BulletList items={job.highlights} p={p} />
        </ElegantEntry>
      ))}
    </ElegantSection>
  );
};
