import {
  GlassPanel,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Heart } from 'lucide-react';

export const SideInterestsSection = ({
  data,
  p,
  labels,
}: SkylineSharedProps<ResumeData['interests']>) => {
  const items = data;
  if (!items?.length) return null;

  return (
    <GlassPanel p={p}>
      <SectionHeader icon={<Heart size={18} />} title={labels.interests} p={p} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              background: p.primaryVeryLight,
              color: p.textMain,
              fontSize: '0.9em',
              fontWeight: 600,
              border: `1px solid ${p.primaryLight}`,
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
    </GlassPanel>
  );
};
