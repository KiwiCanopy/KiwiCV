import {
  Entry,
  Section,
} from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainAwardsSection = ({
  data: awards,
  label,
  formatCVDate,
  p,
}: LunarSharedProps<ResumeData['awards']>) => (
  <>
    {awards.map((award: ResumeData['awards'][number], i: number) => (
      <Section key={i} title={i === 0 ? label || '' : ''} p={p}>
        <Entry
          title={
            award.url ? (
              <a
                href={award.url}
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
                {award.title} <ExternalLink size="1em" style={{ opacity: 0.5 }} />
              </a>
            ) : (
              award.title
            )
          }
          subtitle={award.awarder}
          location={award.location}
          date={formatCVDate(award.date)}
          p={p}
        >
          {award.summary && (
            <p style={{ margin: '0.3em 0 0', fontSize: '0.93em', color: p?.textMuted || '#555' }}>
              {award.summary}
            </p>
          )}
        </Entry>
      </Section>
    ))}
  </>
);
