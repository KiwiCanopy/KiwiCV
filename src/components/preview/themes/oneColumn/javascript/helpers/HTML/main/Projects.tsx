import { SectionHeader } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/CommonHTML';
import {
  FONT_MONO,
  FONT_SANS,
} from '@/components/preview/themes/oneColumn/javascript/helpers/shared/constants';
import type { JavaScriptSharedProps } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/types';
import { getSectionItemHash } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';
import { ExternalLink, FolderOpen } from 'lucide-react';

export const MainProjectsSection = ({
  data: items,
  p,
  labels,
  label,
  formatCVDateRange,
}: JavaScriptSharedProps<ResumeData['projects']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <section style={{ marginBottom: '32px', fontFamily: FONT_SANS }}>
      <SectionHeader title={label || labels.projects || 'Projects'} p={p} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {items.map((proj) => {
          const TitleArea = (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '8px',
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
                <FolderOpen size={16} color={p.slate300} style={{ flexShrink: 0 }} />
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
                    <span
                      style={{ color: isOngoingEndDate(proj.endDate) ? p.primary : p.slate900 }}
                    >
                      {proj.name}
                    </span>
                  </div>
                  {(proj.entity || proj.location) && (
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '0.8125em',
                        color: p.entity,
                        marginTop: '2px',
                        wordBreak: 'break-word',
                      }}
                    >
                      {[proj.entity, proj.location].filter(Boolean).join(' · ')}
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
                  {formatCVDateRange(proj.startDate, proj.endDate)}
                </span>
                {proj.url && (
                  <ExternalLink size={14} style={{ color: p.slate300, flexShrink: 0 }} />
                )}
              </div>
            </div>
          );

          return (
            <div
              key={getSectionItemHash('projects', proj)}
              style={{
                padding: '16px',
                border: `1px solid ${p.slate200}`,
                borderRadius: '8px',
                backgroundColor: p.paper,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {proj.url ? (
                <a
                  href={proj.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  {TitleArea}
                </a>
              ) : (
                TitleArea
              )}
              {proj.type && (
                <div
                  style={{
                    fontSize: '0.75em',
                    fontFamily: FONT_MONO,
                    color: p.slate400,
                    marginBottom: '4px',
                  }}
                >
                  {`// ${proj.type}`}
                </div>
              )}
              {proj.description && (
                <div
                  style={{
                    fontSize: '0.8125em',
                    color: p.slate500,
                    marginBottom: proj.highlights?.length ? '8px' : '0',
                    lineHeight: 1.5,
                  }}
                >
                  {proj.description}
                </div>
              )}
              {proj.highlights && proj.highlights.length > 0 && (
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
                  {proj.highlights.map((h, j) => (
                    <li key={j} style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: p.slate300, flexShrink: 0 }}>{'->'}</span>
                      <span style={{ flex: 1 }}>{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
