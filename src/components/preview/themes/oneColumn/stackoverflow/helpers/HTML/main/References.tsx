import { SOSection } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/CommonHTML';
import type { StackoverflowSharedProps } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainReferencesSection = ({
  data: items,
  p,
  labels,
}: StackoverflowSharedProps<ResumeData['references']>) => {
  if (!items || items.length === 0 || !p || !labels) return null;
  return (
    <SOSection title={labels.references} p={p}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((r, i) => (
          <div
            key={i}
            style={{
              padding: '12px 16px',
              backgroundColor: p.bgLight,
              borderLeft: `3px solid ${p.primary}`,
              borderRadius: '2px',
            }}
          >
            <p style={{ fontStyle: 'italic', fontSize: '0.929em', color: p.text, margin: 0 }}>
              "{r.reference}"
            </p>
            <p style={{ fontWeight: 600, fontSize: '0.857em', color: p.dark, margin: '6px 0 0' }}>
              — {r.name}
            </p>
          </div>
        ))}
      </div>
    </SOSection>
  );
};
