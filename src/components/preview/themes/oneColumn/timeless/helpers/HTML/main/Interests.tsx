import { SectionHeader } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/CommonHTML';
import type { TimelessSharedProps } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainInterestsSection = ({
  data: items,
  p,
  labels,
}: TimelessSharedProps<ResumeData['interests']>) => {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <SectionHeader label={labels.interests || 'Interests'} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item, i) => (
          <div key={i}>
            <div style={{ fontWeight: 600, color: p.text, fontSize: '1.05rem' }}>{item.name}</div>
            {item.keywords && item.keywords.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '4px',
                }}
              >
                {item.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.875rem',
                      color: p.textMuted,
                      backgroundColor: p.bgLight,
                      padding: '2px 8px',
                      borderRadius: '4px',
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
