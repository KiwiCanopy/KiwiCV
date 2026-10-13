import { SidebarItem } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const SideWorkSection = ({
  cvLocale,

  data: work,
  formatCVDateRange,
  p,
}: LunarSharedProps<ResumeData['work']>) => (
  <>
    {work.map((job, i) => (
      <SidebarItem key={i} p={p}>
        {formatCVDateRange(job.startDate, job.endDate) && (
          <div style={{ opacity: 0.7, fontSize: '0.86em', marginBottom: '0.1em' }}>
            {formatCVDateRange(job.startDate, job.endDate)}
          </div>
        )}
        {job.url ? (
          <a
            href={job.url}
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
            {cvLocale?.boldHeaderWork === 'company' ? job.name : job.position}{' '}
            <ExternalLink size="0.9em" style={{ opacity: 0.5 }} />
          </a>
        ) : (
          <div style={{ fontWeight: 600 }}>
            {cvLocale?.boldHeaderWork === 'company' ? job.name : job.position}
          </div>
        )}
        {((cvLocale?.boldHeaderWork === 'company' ? job.position : job.name) || job.location) && (
          <div style={{ opacity: 0.7, fontSize: '0.9em', marginTop: '0.1em' }}>
            {[cvLocale?.boldHeaderWork === 'company' ? job.position : job.name, job.location]
              .filter(Boolean)
              .join(' · ')}
          </div>
        )}
      </SidebarItem>
    ))}
  </>
);
