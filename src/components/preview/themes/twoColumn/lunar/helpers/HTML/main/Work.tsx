import {
  Entry,
  Section,
} from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainWorkSection = ({
  cvLocale,

  data: work,
  label,
  formatCVDateRange,
  p,
}: LunarSharedProps<ResumeData['work']>) => (
  <>
    {work.map((job: ResumeData['work'][number], i: number) => (
      <Section key={i} title={i === 0 ? label || '' : ''} p={p}>
        <Entry
          title={
            job.url ? (
              <a
                href={job.url}
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
                {cvLocale?.boldHeaderWork === 'company' ? job.name : job.position}{' '}
                <ExternalLink size="1em" style={{ opacity: 0.5 }} />
              </a>
            ) : cvLocale?.boldHeaderWork === 'company' ? (
              job.name
            ) : (
              job.position
            )
          }
          subtitle={cvLocale?.boldHeaderWork === 'company' ? job.position : job.name}
          location={job.location}
          date={formatCVDateRange(job.startDate, job.endDate)}
          p={p}
        >
          {job.summary && (
            <p style={{ margin: '0.3em 0 0', fontSize: '0.93em', color: p?.textMuted || '#555' }}>
              {job.summary}
            </p>
          )}
          {job.highlights && job.highlights.length > 0 && (
            <ul
              style={{
                margin: '0.4em 0 0',
                paddingLeft: '1.3em',
                fontSize: '0.93em',
                color: p?.textMuted || '#555',
                listStyleType: 'disc',
              }}
            >
              {job.highlights.map((h: string, j: number) => (
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
