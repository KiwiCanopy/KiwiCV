import {
  GlassPanel,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Users } from 'lucide-react';

export const SideReferencesSection = ({
  data,
  p,
  labels,
}: SkylineSharedProps<ResumeData['references']>) => {
  const items = data;
  if (!items?.length) return null;

  return (
    <GlassPanel p={p}>
      <SectionHeader icon={<Users size={18} />} title={labels.references} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((ref, i) => (
          <div key={i} style={i < items.length - 1 ? { marginBottom: '16px' } : {}}>
            {ref.reference && (
              <div
                style={{
                  fontSize: '0.85em',
                  color: p.textMuted,
                  marginBottom: '4px',
                  fontStyle: 'italic',
                  lineHeight: 1.4,
                }}
              >
                "{ref.reference}"
              </div>
            )}
            <div style={{ fontWeight: 700, color: p.textMain, fontSize: '0.95em' }}>{ref.name}</div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
};
