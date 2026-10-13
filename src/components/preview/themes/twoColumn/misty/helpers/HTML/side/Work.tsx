import {
  RenderLink,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const SideWorkSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
}: MistySharedProps<ResumeData['work']>) => {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <SectionHeader title={labels?.work || ''} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((job, i) => (
          <div key={i}>
            {job.startDate && (
              <div
                style={{
                  fontSize: '0.714em',
                  color: p?.primary,
                  fontWeight: 700,
                  marginBottom: '2px',
                }}
              >
                {formatCVDateRange(job.startDate, job.endDate)}
              </div>
            )}
            <div style={{ fontSize: '0.857em', fontWeight: 700, color: p?.text }}>
              <RenderLink url={job.url} p={p}>
                {cvLocale?.boldHeaderWork === 'company' ? job.name : job.position}
              </RenderLink>
            </div>
            {((cvLocale?.boldHeaderWork === 'company' ? job.position : job.name) ||
              job.location) && (
              <div style={{ fontSize: '0.786em', color: p?.primary, fontWeight: 500 }}>
                {[cvLocale?.boldHeaderWork === 'company' ? job.position : job.name, job.location]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
