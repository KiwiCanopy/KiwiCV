import {
  GlassPanel,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import {
  educationTimelineRow,
  subtitleLine,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/timelineRows';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink, GraduationCap } from 'lucide-react';

export const SideEducationSection = ({
  cvLocale,

  data,
  p,
  labels,
  formatCVDateRange,
}: SkylineSharedProps<ResumeData['education']>) => {
  const items = data;
  if (!items?.length) return null;

  return (
    <GlassPanel p={p}>
      <SectionHeader icon={<GraduationCap size={18} />} title={labels.education} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((edu, i) => {
          const row = educationTimelineRow(edu, cvLocale, formatCVDateRange);
          const line = subtitleLine(row);
          return (
            <div key={i} style={i < items.length - 1 ? { marginBottom: '16px' } : {}}>
              {row.date && (
                <div
                  style={{
                    fontSize: '0.7em',
                    fontWeight: 600,
                    color: p.primary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '2px',
                  }}
                >
                  {row.date}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                {row.url ? (
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'flex-start',
                      gap: '4px',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: p.textMain, fontSize: '0.95em' }}>
                      {row.title}
                    </div>
                    <ExternalLink
                      size={12}
                      style={{ color: p.primary, flexShrink: 0, marginTop: '2px' }}
                    />
                  </a>
                ) : (
                  <div style={{ fontWeight: 700, color: p.textMain, fontSize: '0.95em' }}>
                    {row.title}
                  </div>
                )}
              </div>
              {line && (
                <div style={{ fontSize: '0.85em', color: p.textMuted, marginTop: '5px' }}>
                  {line}
                </div>
              )}
              {row.score && (
                <div
                  style={{ fontSize: '0.8em', color: p.textMuted, marginTop: '2px', opacity: 0.8 }}
                >
                  ø {row.score}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
};
