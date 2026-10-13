import { SectionHeader } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/CommonHTML';
import type { TimelessSharedProps } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainWorkSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
}: TimelessSharedProps<ResumeData['work']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <SectionHeader label={labels.work || 'Work Experience'} p={p} />
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: i === items.length - 1 ? 0 : '32px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '6px',
            }}
          >
            <h3 style={{ fontSize: '1.25em', fontWeight: 600 }}>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {cvLocale?.boldHeaderWork === 'company' ? item.name : item.position}
                  <ExternalLink size={14} style={{ opacity: 0.5 }} />
                </a>
              ) : cvLocale?.boldHeaderWork === 'company' ? (
                item.name
              ) : (
                item.position
              )}
            </h3>
            <span style={{ fontSize: '0.9em', color: p.textLight }}>
              {formatCVDateRange(item.startDate, item.endDate)}
            </span>
          </div>
          <div style={{ fontWeight: 600, color: p.textMuted, marginBottom: '12px' }}>
            {[cvLocale?.boldHeaderWork === 'company' ? item.position : item.name, item.location]
              .filter(Boolean)
              .join(' · ')}
          </div>
          {item.summary && (
            <p
              style={{ fontSize: '1em', lineHeight: 1.6, color: p.textMuted, marginBottom: '8px' }}
            >
              {item.summary}
            </p>
          )}
          {item.highlights && (
            <ul style={{ paddingLeft: '1.5em', margin: 0 }}>
              {item.highlights.map((h: string, j: number) => (
                <li key={j} style={{ color: p.textMuted, marginBottom: '4px' }}>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};
