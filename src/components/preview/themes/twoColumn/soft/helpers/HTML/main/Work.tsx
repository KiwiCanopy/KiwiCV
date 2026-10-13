import { SectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { BriefcaseBusiness, ExternalLink } from 'lucide-react';

export const MainWorkSection = ({
  cvLocale,
  data: items,
  p,
  labels,
  formatCVDateRange,
}: SoftSharedProps<ResumeData['work']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <SectionHeader title={labels.work || 'Work Experience'} p={p} icon={BriefcaseBusiness} />

      {items.map((item, i) => (
        <div
          key={i}
          style={{
            paddingLeft: '12px',
            borderLeft: `2px solid ${p.border}`,
            marginLeft: '14px',
            marginBottom: i === items.length - 1 ? 0 : '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px',
              gap: '12px', // Added gap to prevent overlap
            }}
          >
            <div>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <h4 style={{ fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>
                    {cvLocale?.boldHeaderWork === 'company' ? item.name : item.position}
                  </h4>
                  <ExternalLink size={14} color={p.primary} />
                </a>
              ) : (
                <h4 style={{ fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>
                  {cvLocale?.boldHeaderWork === 'company' ? item.name : item.position}
                </h4>
              )}
              <p
                style={{
                  color: p.primary,
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  margin: '2px 0 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {[cvLocale?.boldHeaderWork === 'company' ? item.position : item.name, item.location]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            {/* Updated badge style here */}
            <span
              style={{
                fontSize: '0.8125rem',
                color: p.primary,
                backgroundColor: `${p.primary}12`,
                padding: '4px 10px',
                borderRadius: '8px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {formatCVDateRange(item.startDate, item.endDate)}
            </span>
          </div>

          {item.summary && (
            <p
              style={{
                fontSize: '0.9375rem',
                color: p.textLight,
                lineHeight: 1.6,
                marginBottom: '12px',
                marginTop: '8px',
              }}
            >
              {item.summary}
            </p>
          )}

          {item.highlights && item.highlights.length > 0 && (
            <ul style={{ paddingLeft: '1.25rem', margin: 0, listStyleType: 'none' }}>
              {item.highlights.map((h, j) => (
                <li
                  key={j}
                  style={{
                    position: 'relative',
                    fontSize: '0.9375rem',
                    color: p.textLight,
                    marginBottom: '8px',
                    lineHeight: 1.6,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: '-1.25rem',
                      top: '0.625rem',
                      width: '6px',
                      height: '6px',
                      borderRadius: '3px',
                      backgroundColor: `${p.primary}4d`,
                    }}
                  ></span>
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
