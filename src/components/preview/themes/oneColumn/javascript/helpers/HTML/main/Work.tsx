import { SectionHeader } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/CommonHTML';
import {
  FONT_MONO,
  FONT_SANS,
} from '@/components/preview/themes/oneColumn/javascript/helpers/shared/constants';
import type { JavaScriptSharedProps } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/types';
import { getSectionItemHash } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';
import { ExternalLink } from 'lucide-react';

export const MainWorkSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
}: JavaScriptSharedProps<ResumeData['work']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <section style={{ marginBottom: '32px', fontFamily: FONT_SANS }}>
      <SectionHeader title={labels.work || 'Work Experience'} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((job) => (
          <div
            key={getSectionItemHash('work', job)}
            style={{
              paddingLeft: '24px',
              paddingBottom: job === items[items.length - 1] ? '0' : '24px',
              borderLeft: job === items[items.length - 1] ? 'none' : `1px solid ${p.slate200}`,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '-5.5px',
                top: '6px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isOngoingEndDate(job.endDate) ? p.primary : p.slate300,
                border: `3px solid ${p.paper}`,
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '8px',
                gap: '12px',
              }}
            >
              <h3
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '1em',
                  fontWeight: 700,
                  margin: 0,
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {job.url ? (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ color: isOngoingEndDate(job.endDate) ? p.primary : p.slate900 }}>
                      {(cvLocale?.boldHeaderWork === 'company' ? job.name : job.position) || 'role'}
                    </span>
                    <span style={{ color: p.slate300 }}>.</span>
                    <span style={{ color: p.entity }}>
                      {(cvLocale?.boldHeaderWork === 'company' ? job.position : job.name) ||
                        'Company'}
                    </span>
                    <span style={{ color: p.slate300 }}>()</span>
                    {job.location && (
                      <span style={{ color: p.slate400, fontSize: '0.9em' }}>
                        {' · '}
                        {job.location}
                      </span>
                    )}
                    <ExternalLink
                      size={12}
                      style={{ color: p.entity, opacity: 0.6, flexShrink: 0 }}
                    />
                  </a>
                ) : (
                  <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ color: isOngoingEndDate(job.endDate) ? p.primary : p.slate900 }}>
                      {(cvLocale?.boldHeaderWork === 'company' ? job.name : job.position) || 'role'}
                    </span>
                    <span style={{ color: p.slate300 }}>.</span>
                    <span style={{ color: p.entity }}>
                      {(cvLocale?.boldHeaderWork === 'company' ? job.position : job.name) ||
                        'Company'}
                    </span>
                    <span style={{ color: p.slate300 }}>()</span>
                    {job.location && (
                      <span style={{ color: p.slate400, fontSize: '0.9em' }}>
                        {' · '}
                        {job.location}
                      </span>
                    )}
                  </span>
                )}
              </h3>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '0.75em',
                  color: p.slate500,
                  backgroundColor: p.paper,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${p.slate200}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {formatCVDateRange(job.startDate, job.endDate)}
              </span>
            </div>
            <div
              style={{
                backgroundColor: p.slate50,
                padding: '16px',
                borderRadius: '8px',
                border: `1px solid ${p.slate100}`,
              }}
            >
              {job.summary && (
                <p
                  style={{
                    fontSize: '0.875em',
                    color: p.slate600,
                    lineHeight: 1.6,
                    margin: '0 0 12px 0',
                  }}
                >
                  {job.summary}
                </p>
              )}
              {job.highlights && job.highlights.length > 0 && (
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontFamily: FONT_MONO,
                  }}
                >
                  {job.highlights.map((h, j) => (
                    <li key={j} style={{ fontSize: '0.8125em', color: p.slate600 }}>
                      <span style={{ color: p.slate300, marginRight: '8px' }}>{'->'}</span>
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
