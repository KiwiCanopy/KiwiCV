import {
  PlainEntry,
  SectionHeader,
} from '@/components/preview/themes/oneColumn/plain/helpers/shared/CommonHTML';
import type { PlainSharedProps } from '@/components/preview/themes/oneColumn/plain/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainAwardsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: PlainSharedProps<ResumeData['awards']>) => {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <SectionHeader title={labels.awards || ''} p={p} />
      {items.map((award, i) => (
        <PlainEntry
          key={i}
          left={
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
                }}
              >
                <strong>{award.title}</strong>
                {(award.awarder || award.location) && (
                  <span style={{ marginLeft: '4px' }}>
                    {[award.awarder, award.location].filter(Boolean).join(' · ')}
                  </span>
                )}
                <ExternalLink
                  size={12}
                  style={{ opacity: 0.5, marginLeft: '8px', flexShrink: 0 }}
                />
              </a>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <strong>{award.title}</strong>
                {(award.awarder || award.location) && (
                  <span style={{ marginLeft: '4px' }}>
                    {[award.awarder, award.location].filter(Boolean).join(' · ')}
                  </span>
                )}
              </span>
            )
          }
          right={formatCVDate(award.date)}
        >
          {award.summary && (
            <p style={{ margin: '4px 0 0', color: p.textMuted, fontSize: '0.925em' }}>
              {award.summary}
            </p>
          )}
        </PlainEntry>
      ))}
    </section>
  );
};
