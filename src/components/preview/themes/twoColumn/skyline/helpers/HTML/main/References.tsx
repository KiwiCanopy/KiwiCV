import { SectionHeader } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Users } from 'lucide-react';

export const MainReferencesSection = ({
  data,
  p,
  labels,
}: SkylineSharedProps<ResumeData['references']>) => {
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
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '16px',
      }}
    >
      <SectionHeader icon={<Users size={18} />} title={labels.references} isMain p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {items.map((ref, i) => (
          <div
            key={i}
            style={{
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.4)',
              border: '1px solid white',
              borderRadius: '12px',
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: '1em',
                fontStyle: 'italic',
                color: p.textMuted,
                marginBottom: '12px',
                lineHeight: 1.6,
                position: 'relative',
              }}
            >
              "{ref.reference}"
            </div>
            <div style={{ fontSize: '1.05em', fontWeight: 700, color: p.textMain }}>{ref.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
