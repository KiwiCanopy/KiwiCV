import {
  PlainEntry,
  SectionHeader,
} from '@/components/preview/themes/oneColumn/plain/helpers/shared/CommonHTML';
import type { PlainSharedProps } from '@/components/preview/themes/oneColumn/plain/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainVolunteerSection = ({
  data: items,
  p,
  labels,
  formatCVDateRange,
}: PlainSharedProps<ResumeData['volunteer']>) => {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <SectionHeader title={labels.volunteer || ''} p={p} />
      {items.map((vol, i) => (
        <PlainEntry
          key={i}
          left={
            vol.url ? (
              <a
                href={vol.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <strong>{vol.position}</strong>
                <span style={{ marginLeft: '4px' }}>
                  {[vol.organization, vol.location].filter(Boolean).join(' · ')}
                </span>
                <ExternalLink
                  size={12}
                  style={{ opacity: 0.5, marginLeft: '8px', flexShrink: 0 }}
                />
              </a>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <strong>{vol.position}</strong>
                <span style={{ marginLeft: '4px' }}>
                  {[vol.organization, vol.location].filter(Boolean).join(' · ')}
                </span>
              </span>
            )
          }
          right={formatCVDateRange(vol.startDate, vol.endDate)}
        >
          {vol.summary && <p style={{ margin: '4px 0 6px', color: p.textMuted }}>{vol.summary}</p>}
          {vol.highlights && vol.highlights.length > 0 && (
            <ul style={{ margin: '0', paddingLeft: '18px', listStyleType: 'disc' }}>
              {vol.highlights.map((h, j) => (
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
