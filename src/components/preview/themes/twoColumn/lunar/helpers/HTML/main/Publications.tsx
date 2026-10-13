import {
  Entry,
  Section,
} from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainPublicationsSection = ({
  data: publications,
  label,
  formatCVDate,
  p,
}: LunarSharedProps<ResumeData['publications']>) => (
  <>
    {publications.map((pub: ResumeData['publications'][number], i: number) => (
      <Section key={i} title={i === 0 ? label || '' : ''} p={p}>
        <Entry
          title={
            pub.url ? (
              <a
                href={pub.url}
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
                {pub.name} <ExternalLink size="1em" style={{ opacity: 0.5 }} />
              </a>
            ) : (
              pub.name
            )
          }
          subtitle={pub.publisher}
          date={formatCVDate(pub.releaseDate)}
          p={p}
        >
          {pub.summary && (
            <p style={{ margin: '0.3em 0 0', fontSize: '0.93em', color: p?.textMuted || '#555' }}>
              {pub.summary}
            </p>
          )}
        </Entry>
      </Section>
    ))}
  </>
);
