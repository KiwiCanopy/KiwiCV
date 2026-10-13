import { SectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink, HeartHandshake, LayoutList } from 'lucide-react';

export const MainVolunteerSection = ({
  isCustomSection,
  data: items,
  p,
  labels,
  formatCVDateRange,
}: SoftSharedProps<ResumeData['volunteer']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <SectionHeader
        title={labels.volunteer || 'Volunteer'}
        p={p}
        icon={isCustomSection ? LayoutList : HeartHandshake}
      />

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
                    {item.position}
                  </h4>
                  <ExternalLink size={14} color={p.primary} />
                </a>
              ) : (
                <h4 style={{ fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>
                  {item.position}
                </h4>
              )}
              {(item.organization || item.location) && (
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
                  {[item.organization, item.location].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <span style={{ fontSize: '0.8125rem', color: p.textLight, fontWeight: 600 }}>
              {formatCVDateRange(item.startDate, item.endDate)}
            </span>
          </div>

          {item.summary && (
            <p
              style={{
                fontSize: '0.9375rem',
                color: p.textLight,
                lineHeight: 1.6,
                margin: '8px 0 0 0',
              }}
            >
              {item.summary}
            </p>
          )}

          {item.highlights && item.highlights.length > 0 && (
            <ul style={{ paddingLeft: '1.25rem', margin: '12px 0 0 0', listStyleType: 'none' }}>
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
