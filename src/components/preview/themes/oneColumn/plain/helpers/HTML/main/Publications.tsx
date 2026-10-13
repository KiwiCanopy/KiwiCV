import {
  PlainEntry,
  SectionHeader,
} from '@/components/preview/themes/oneColumn/plain/helpers/shared/CommonHTML';
import type { PlainSharedProps } from '@/components/preview/themes/oneColumn/plain/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainPublicationsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: PlainSharedProps<ResumeData['publications']>) => {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <SectionHeader title={labels.publications || ''} p={p} />
      {items.map((pub, i) => (
        <PlainEntry
          key={i}
          left={
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
                }}
              >
                <strong>{pub.name}</strong>
                {pub.publisher && <span style={{ marginLeft: '4px' }}>{pub.publisher}</span>}
                <ExternalLink
                  size={12}
                  style={{ opacity: 0.5, marginLeft: '8px', flexShrink: 0 }}
                />
              </a>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <strong>{pub.name}</strong>
                {pub.publisher && <span style={{ marginLeft: '4px' }}>{pub.publisher}</span>}
              </span>
            )
          }
          right={formatCVDate(pub.releaseDate)}
        >
          {pub.summary && (
            <p style={{ margin: '4px 0 0', color: p.textMuted, fontSize: '0.925em' }}>
              {pub.summary}
            </p>
          )}
        </PlainEntry>
      ))}
    </section>
  );
};
