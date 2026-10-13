import { SectionHeader } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/CommonHTML';
import {
  FONT_MONO,
  FONT_SANS,
} from '@/components/preview/themes/oneColumn/javascript/helpers/shared/constants';
import type { JavaScriptSharedProps } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/types';
import { getSectionItemHash } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';
import { ExternalLink, Trophy } from 'lucide-react';

export const MainAwardsSection = (props: JavaScriptSharedProps<ResumeData['awards']>) => {
  const { data: items, p, labels, formatCVDate } = props;
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <section style={{ marginBottom: '32px', fontFamily: FONT_SANS }}>
      <SectionHeader title={labels.awards || 'Awards'} p={p} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {items.map((award) => (
          <div
            key={getSectionItemHash('awards', award)}
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
                fontSize: '0.875em',
                fontWeight: 700,
                color: p.slate900,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <Trophy size={16} color={p.slate300} style={{ flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                    {award.url ? (
                      <a
                        href={award.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: p.slate900,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          minWidth: 0,
                        }}
                      >
                        <span style={{ wordBreak: 'break-word' }}>{award.title}</span>
                        <ExternalLink
                          size={12}
                          style={{ opacity: 0.6, color: p.slate400, flexShrink: 0 }}
                        />
                      </a>
                    ) : (
                      <span style={{ color: p.slate900, wordBreak: 'break-word' }}>
                        {award.title}
                      </span>
                    )}
                  </div>
                  {(award.awarder || award.location) && (
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '0.8125em',
                        color: p.entity,
                        marginTop: '2px',
                        wordBreak: 'break-word',
                      }}
                    >
                      {[award.awarder, award.location].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </div>
              {award.date && (
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '0.75rem',
                    color: p.slate500,
                    backgroundColor: p.slate100,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    fontWeight: 400,
                  }}
                >
                  {formatCVDate(award.date)}
                </span>
              )}
            </div>
            {award.summary && (
              <div
                style={{
                  fontSize: '0.75em',
                  color: p.slate600,
                  lineHeight: 1.5,
                  display: 'flex',
                  gap: '8px',
                }}
              >
                <span style={{ color: p.slate300, fontFamily: FONT_MONO, flexShrink: 0 }}>
                  {'->'}
                </span>
                <span>{award.summary}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
