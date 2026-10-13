import { SectionHeader } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/CommonHTML';
import {
  FONT_MONO,
  FONT_SANS,
} from '@/components/preview/themes/oneColumn/javascript/helpers/shared/constants';
import type { JavaScriptSharedProps } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/types';
import { getSectionItemHash } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';

export const MainInterestsSection = ({
  data: items,
  p,
  labels,
}: JavaScriptSharedProps<ResumeData['interests']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <section style={{ marginBottom: '32px', fontFamily: FONT_SANS }}>
      <SectionHeader title={labels.interests || 'Interests'} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((interest) => (
          <div key={getSectionItemHash('interests', interest)}>
            <h3
              style={{
                fontFamily: FONT_MONO,
                fontSize: '0.875em',
                fontWeight: 700,
                color: p.slate900,
                marginBottom: '8px',
              }}
            >
              {interest.name}
            </h3>
            {interest.keywords && interest.keywords.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {interest.keywords.map((kw, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: '0.75em',
                      color: p.slate600,
                      backgroundColor: p.paper,
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: `1px solid ${p.slate200}`,
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
