import {
  PlainEntry,
  SectionHeader,
} from '@/components/preview/themes/oneColumn/plain/helpers/shared/CommonHTML';
import type { PlainSharedProps } from '@/components/preview/themes/oneColumn/plain/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainWorkSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
}: PlainSharedProps<ResumeData['work']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <section>
      <SectionHeader title={labels.work || ''} p={p} />
      {items.map((job, i) => (
        <PlainEntry
          key={i}
          left={
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
                }}
              >
                <strong>{cvLocale?.boldHeaderWork === 'company' ? job.name : job.position}</strong>
                <span style={{ marginLeft: '4px' }}>
                  {cvLocale?.boldHeaderWork === 'company' ? job.position : job.name}
                </span>
                {job.location && (
                  <span style={{ marginLeft: '4px', opacity: 0.65 }}>
                    {' · '}
                    {job.location}
                  </span>
                )}
                <ExternalLink
                  size={12}
                  style={{ opacity: 0.5, marginLeft: '8px', flexShrink: 0 }}
                />
              </a>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <strong>{cvLocale?.boldHeaderWork === 'company' ? job.name : job.position}</strong>
                <span style={{ marginLeft: '4px' }}>
                  {cvLocale?.boldHeaderWork === 'company' ? job.position : job.name}
                </span>
                {job.location && (
                  <span style={{ marginLeft: '4px', opacity: 0.65 }}>
                    {' · '}
                    {job.location}
                  </span>
                )}
              </span>
            )
          }
          right={formatCVDateRange(job.startDate, job.endDate)}
        >
          {job.summary && <p style={{ margin: '4px 0 6px', color: p.textMuted }}>{job.summary}</p>}
          {job.highlights && job.highlights.length > 0 && (
            <ul style={{ margin: '0', paddingLeft: '18px', listStyleType: 'disc' }}>
              {job.highlights.map((h, j) => (
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
