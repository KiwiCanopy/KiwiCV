import { SectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Sparkles } from 'lucide-react';

export const MainInterestsSection = ({
  data: items,
  p,
  labels,
}: SoftSharedProps<ResumeData['interests']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <SectionHeader title={labels.interests || 'Interests'} p={p} icon={Sparkles} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '14px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: 600, color: p.textMain }}>{item.name}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {item.keywords?.map((kw, j) => (
                <span
                  key={j}
                  style={{
                    fontSize: '0.85em',
                    fontWeight: 600,
                    color: p.textMuted,
                    background: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '10px',
                    border: `1px solid ${p.border}`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
