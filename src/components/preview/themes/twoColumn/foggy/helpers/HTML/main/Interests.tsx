import { SectionHeader } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Sparkles } from 'lucide-react';

export const MainInterestsSection = ({
  data: visibleInterests,
  p,
  labels,
}: FoggySharedProps<ResumeData['interests']>) => {
  if (!visibleInterests || visibleInterests.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: p.bgCard,
        border: `1px solid ${p.border}`,
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: '24px',
      }}
    >
      <SectionHeader icon={<Sparkles size={16} />} title={labels.interests} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {visibleInterests.map((interest, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '1em', fontWeight: 700, color: p.text }}>{interest.name}</span>
            {interest.keywords && interest.keywords.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {interest.keywords.map((kw, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: '0.786em',
                      backgroundColor: '#f1f5f9',
                      color: p.textMuted,
                      padding: '4px 12px',
                      borderRadius: '20px',
                      border: `1px solid ${p.border}`,
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
