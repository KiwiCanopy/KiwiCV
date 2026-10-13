import {
  Entry,
  Section,
} from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainVolunteerSection = ({
  data: volunteer,
  label,
  formatCVDateRange,
  p,
}: LunarSharedProps<ResumeData['volunteer']>) => (
  <>
    {volunteer.map((vol: ResumeData['volunteer'][number], i: number) => (
      <Section key={i} title={i === 0 ? label || '' : ''} p={p}>
        <Entry
          title={
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
                  gap: '0.3em',
                }}
              >
                {vol.position} <ExternalLink size="1em" style={{ opacity: 0.5 }} />
              </a>
            ) : (
              vol.position
            )
          }
          subtitle={vol.organization}
          location={vol.location}
          date={formatCVDateRange(vol.startDate, vol.endDate)}
          p={p}
        >
          {vol.summary && (
            <p style={{ margin: '0.3em 0 0', fontSize: '0.93em', color: p?.textMuted || '#555' }}>
              {vol.summary}
            </p>
          )}
          {vol.highlights && vol.highlights.length > 0 && (
            <ul
              style={{
                margin: '0.4em 0 0',
                paddingLeft: '1.3em',
                fontSize: '0.93em',
                color: p?.textMuted || '#555',
                listStyleType: 'disc',
              }}
            >
              {vol.highlights.map((h: string, j: number) => (
                <li key={j} style={{ marginBottom: '0.15em' }}>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </Entry>
      </Section>
    ))}
  </>
);
