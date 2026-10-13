import { SectionHeader } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Heart } from 'lucide-react';

export const MainInterestsSection = ({
  data,
  p,
  labels,
}: SkylineSharedProps<ResumeData['interests']>) => {
  const items = data;
  if (!items?.length) return null;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(255, 255, 255, 1)',
        boxShadow: `-8px 8px 32px 0 ${p.primaryLight}`,
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '24px',
      }}
    >
      <SectionHeader icon={<Heart size={18} />} title={labels.interests} isMain p={p} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid white',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: `-4px 4px 12px ${p.primaryLight}`,
            }}
          >
            <div style={{ fontSize: '1em', fontWeight: 700, color: p.textMain }}>{item.name}</div>
            {item.keywords && item.keywords.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {item.keywords.map((kw, j) => (
                  <span
                    key={j}
                    style={{
                      padding: '2px 8px',
                      background: '#ffffff',
                      border: `1px solid ${p.border}`,
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                      fontSize: '0.75em',
                      fontWeight: 600,
                      color: p.textMain,
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
    </div>
  );
};
