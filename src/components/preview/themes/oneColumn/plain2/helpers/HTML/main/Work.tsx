import {
  Entry,
  SectionHeader,
} from '@/components/preview/themes/oneColumn/plain2/helpers/shared/CommonHTML';
import type { Plain2SharedProps } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainWorkSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
  label,
}: Plain2SharedProps<ResumeData['work']>) => {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <SectionHeader title={label || labels.work} p={p} />
      {items.map((job: ResumeData['work'][number], i: number) => (
        <Entry
          key={i}
          title={cvLocale?.boldHeaderWork === 'company' ? job.name : job.position}
          subtitle={[cvLocale?.boldHeaderWork === 'company' ? job.position : job.name, job.location]
            .filter(Boolean)
            .join(' · ')}
          date={formatCVDateRange(job.startDate, job.endDate)}
          url={job.url}
          p={p}
        >
          {job.summary && (
            <p style={{ margin: '4px 0 8px', fontSize: '0.929em', color: p.textMain }}>
              {job.summary}
            </p>
          )}
          {job.highlights.length > 0 && (
            <ul
              style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '0.929em',
                color: p.textMain,
                listStyleType: 'disc',
                listStylePosition: 'outside',
              }}
            >
              {job.highlights.map((h: string, j: number) => (
                <li key={j} style={{ marginBottom: '3px' }}>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </Entry>
      ))}
    </section>
  );
};
