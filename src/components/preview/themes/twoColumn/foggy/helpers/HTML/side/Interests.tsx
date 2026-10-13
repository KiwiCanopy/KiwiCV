import { SectionHeader } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Sparkles } from 'lucide-react';

export const SideInterestsSection = ({
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
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <SectionHeader icon={<Sparkles size={14} />} title={labels.interests} p={p} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '6px',
        }}
      >
        {visibleInterests.map((interest, i) => (
          <div
            key={i}
            style={{
              fontSize: '0.786em',
              backgroundColor: p.bg,
              color: p.text,
              padding: '4px 10px',
              borderRadius: '6px',
              border: `1px solid ${p.border}`,
              fontWeight: 600,
            }}
          >
            {interest.name}
          </div>
        ))}
      </div>
    </div>
  );
};
