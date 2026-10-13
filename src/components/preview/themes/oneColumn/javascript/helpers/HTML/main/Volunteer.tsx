import { SectionHeader } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/CommonHTML';
import {
  FONT_MONO,
  FONT_SANS,
} from '@/components/preview/themes/oneColumn/javascript/helpers/shared/constants';
import type { JavaScriptSharedProps } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/types';
import { getSectionItemHash } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';
import { ExternalLink, Heart, LayoutList } from 'lucide-react';

export const MainVolunteerSection = ({
  isCustomSection,
  data: items,
  p,
  labels,
  formatCVDateRange,
}: JavaScriptSharedProps<ResumeData['volunteer']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <section style={{ marginBottom: '32px', fontFamily: FONT_SANS }}>
      <SectionHeader title={labels.volunteer || 'Volunteer'} p={p} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {items.map((vol) => (
          <div
            key={getSectionItemHash('volunteer', vol)}
            style={{
              padding: '16px',
              border: `1px solid ${p.slate200}`,
              borderRadius: '8px',
              backgroundColor: p.paper,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {isCustomSection ? (
                  <LayoutList size={16} color={p.slate300} style={{ flexShrink: 0 }} />
                ) : (
                  <Heart size={16} color={p.slate300} style={{ flexShrink: 0 }} />
                )}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.875em',
                      fontWeight: 600,
                      wordBreak: 'break-word',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      minWidth: 0,
                    }}
                  >
                    {vol.url ? (
                      <a
                        href={vol.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          textDecoration: 'none',
                          color: isOngoingEndDate(vol.endDate) ? p.primary : p.slate900,
                          minWidth: 0,
                        }}
                      >
                        <span style={{ wordBreak: 'break-word' }}>{vol.position || 'role'}</span>
                      </a>
                    ) : (
                      <span
                        style={{
                          color: isOngoingEndDate(vol.endDate) ? p.primary : p.slate900,
                          wordBreak: 'break-word',
                        }}
                      >
                        {vol.position || 'role'}
                      </span>
                    )}
                  </div>
                  {(vol.organization || vol.location) && (
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '0.8125em',
                        color: p.entity,
                        marginTop: '2px',
                        wordBreak: 'break-word',
                      }}
                    >
                      {[vol.organization, vol.location].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '0.75em',
                    color: p.slate500,
                    backgroundColor: p.paper,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: `1px solid ${p.slate200}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatCVDateRange(vol.startDate, vol.endDate)}
                </span>
                {vol.url && <ExternalLink size={14} style={{ color: p.slate300, flexShrink: 0 }} />}
              </div>
            </div>

            {vol.summary && (
              <div
                style={{
                  fontSize: '0.8125em',
                  color: p.slate500,
                  marginBottom: vol.highlights?.length ? '4px' : '0',
                  lineHeight: 1.5,
                }}
              >
                {vol.summary}
              </div>
            )}
            {vol.highlights && vol.highlights.length > 0 && (
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontFamily: FONT_MONO,
                  fontSize: '0.75em',
                  color: p.slate500,
                }}
              >
                {vol.highlights.map((h, j) => (
                  <li key={j} style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: p.slate300, flexShrink: 0 }}>{'->'}</span>
                    <span style={{ flex: 1 }}>{h}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
