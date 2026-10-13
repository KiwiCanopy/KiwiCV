import { SectionHeader } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/CommonHTML';
import { FONT_SANS } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/constants';
import type { JavaScriptSharedProps } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/types';
import { getSectionItemHash } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';
import { Quote } from 'lucide-react';

export const MainReferencesSection = ({
  data: items,
  p,
  labels,
}: JavaScriptSharedProps<ResumeData['references']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <section style={{ marginBottom: '32px', fontFamily: FONT_SANS }}>
      <SectionHeader title={labels.references || 'References'} p={p} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}
      >
        {items.map((ref) => (
          <div
            key={getSectionItemHash('references', ref)}
            style={{
              padding: '20px',
              backgroundColor: p.slate50,
              borderLeft: `3px solid ${p.primary}`,
              borderRadius: '0 8px 8px 0',
              position: 'relative',
            }}
          >
            <Quote
              size={16}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                color: p.slate200,
              }}
            />
            {ref.reference && (
              <blockquote
                style={{
                  margin: '0 0 12px 0',
                  fontSize: '0.875em',
                  color: p.slate600,
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                }}
              >
                "{ref.reference}"
              </blockquote>
            )}
            <div style={{ fontSize: '0.875em', fontWeight: 700, color: p.slate900 }}>
              {ref.name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
