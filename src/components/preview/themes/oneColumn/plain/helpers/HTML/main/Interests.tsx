import { SectionHeader } from '@/components/preview/themes/oneColumn/plain/helpers/shared/CommonHTML';
import type { PlainSharedProps } from '@/components/preview/themes/oneColumn/plain/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainInterestsSection = ({
  data: items,
  p,
  labels,
}: PlainSharedProps<ResumeData['interests']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <section>
      <SectionHeader title={labels.interests || ''} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
        {items.map((int, i) => (
          <div key={i}>
            <strong>{int.name}</strong>
            {int.keywords && int.keywords.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {int.keywords.map((kw, j) => (
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
