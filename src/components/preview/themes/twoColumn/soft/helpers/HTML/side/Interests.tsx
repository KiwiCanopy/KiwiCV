import { SideSectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Sparkles } from 'lucide-react';

export const SideInterestsSection = ({
  data: items,
  p,
  labels,
}: SoftSharedProps<ResumeData['interests']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '12px' }}>
      <SideSectionHeader title={labels.interests || 'Interests'} p={p} icon={Sparkles} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '2px 8px',
              backgroundColor: p.bgSoft || p.bgLight,
              border: `1px solid ${p.border}`,
              borderRadius: '8px',
              fontSize: '0.6875rem',
              color: p.textMuted,
              fontWeight: 600,
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
};
