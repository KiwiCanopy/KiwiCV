import { SectionHeader } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/CommonHTML';
import type { Plain2SharedProps } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainInterestsSection = ({
  data: items,
  p,
  labels,
  label,
}: Plain2SharedProps<ResumeData['interests']>) => {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <SectionHeader title={label || labels.interests} p={p} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {items.map((interest: ResumeData['interests'][number], i: number) => (
          <div key={i} style={{ fontSize: '0.929em' }}>
            <span style={{ fontWeight: 600 }}>{interest.name}</span>
            {interest.keywords.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px',
                  marginTop: '4px',
                }}
              >
                {interest.keywords.map((kw, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: '0.75rem',
                      padding: '1px 6px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '2px',
                      border: '1px solid #eee',
                      color: p.textMuted,
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
