import { MistySection } from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainReferencesSection = ({
  data: items,
  p,
  labels,
}: MistySharedProps<ResumeData['references']>) => {
  if (!items || items.length === 0) return null;
  return (
    <MistySection title={labels?.references || ''} p={p}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingLeft: '4px' }}>
        {items.map((ref, i) => (
          <div key={i}>
            {ref.reference && (
              <div
                style={{
                  fontSize: '0.85em',
                  color: p?.textMuted,
                  fontStyle: 'italic',
                  marginBottom: '4px',
                }}
              >
                &ldquo;{ref.reference}&rdquo;
              </div>
            )}
            <div style={{ fontSize: '0.76em', fontWeight: 700, color: p?.text }}>{ref.name}</div>
            <div style={{ fontSize: '0.786em', color: p?.primary, fontWeight: 500 }}>
              {(ref as { title?: string }).title}
            </div>
            {(ref as { email?: string }).email && (
              <div style={{ fontSize: '0.714em', color: p?.textLight, marginTop: '2px' }}>
                {(ref as { email?: string }).email}
              </div>
            )}
          </div>
        ))}
      </div>
    </MistySection>
  );
};
