import { SectionHeader } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Briefcase, ExternalLink } from 'lucide-react';

export const SideWorkSection = ({
  cvLocale,

  data: sideWorkItems,
  p,
  labels,
  formatCVDateRange,
}: FoggySharedProps<ResumeData['work']>) => {
  if (!sideWorkItems || sideWorkItems.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: p.bgCard,
        border: `1px solid ${p.border}`,
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: '20px',
      }}
    >
      <SectionHeader icon={<Briefcase size={14} />} title={labels.work} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sideWorkItems.map((job, i) => (
          <div
            key={i}
            style={{
              backgroundColor: p.bg,
              border: `1px solid ${p.border}`,
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px',
            }}
          >
            <div
              style={{
                fontSize: '0.714em',
                color: p.primary,
                backgroundColor: p.primaryVeryLight,
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 600,
                display: 'inline-block',
                marginBottom: '6px',
              }}
            >
              {formatCVDateRange(job.startDate, job.endDate)}
            </div>
            {job.url ? (
              <a
                href={job.url.startsWith('http') ? job.url : `https://${job.url}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'flex-start',
                  gap: '4px',
                }}
              >
                <div
                  style={{ fontSize: '0.857em', fontWeight: 700, color: p.text, lineHeight: 1.3 }}
                >
                  {cvLocale?.boldHeaderWork === 'company' ? job.name : job.position}
                </div>
                <ExternalLink
                  size={11}
                  style={{ color: p.primary, flexShrink: 0, marginTop: '2px' }}
                />
              </a>
            ) : (
              <div style={{ fontSize: '0.857em', fontWeight: 700, color: p.text, lineHeight: 1.3 }}>
                {cvLocale?.boldHeaderWork === 'company' ? job.name : job.position}
              </div>
            )}
            <div style={{ fontSize: '0.786em', color: p.textMuted }}>
              {cvLocale?.boldHeaderWork === 'company' ? job.position : job.name}
              {(cvLocale?.boldHeaderWork === 'company' ? job.position : job.name) && job.location
                ? ' · '
                : ''}
              {job.location}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
