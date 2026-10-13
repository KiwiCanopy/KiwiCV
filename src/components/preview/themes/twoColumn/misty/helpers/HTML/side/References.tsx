import { SectionHeader } from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const SideReferencesSection = ({
  data: items,
  p,
  labels,
}: MistySharedProps<ResumeData['references']>) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <SectionHeader title={labels?.references || ''} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((ref, i) => (
          <div key={i}>
            {ref.reference && (
              <div
                style={{
                  fontSize: '0.786em',
                  color: p?.textMuted,
                  fontStyle: 'italic',
                  marginBottom: '4px',
                }}
              >
                &quot;{ref.reference}&quot;
              </div>
            )}
            <div style={{ fontSize: '0.8em', fontWeight: 700, color: p?.text }}>{ref.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
