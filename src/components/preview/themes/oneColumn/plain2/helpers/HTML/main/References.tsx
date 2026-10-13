import { SectionHeader } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/CommonHTML';
import type { Plain2SharedProps } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainReferencesSection = ({
  data: items,
  p,
  labels,
  label,
}: Plain2SharedProps<ResumeData['references']>) => {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <SectionHeader title={label || labels.references} p={p} />
      {items.map((ref: ResumeData['references'][number], i: number) => (
        <div
          key={i}
          style={{
            marginBottom: '12px',
            padding: '12px 16px',
            backgroundColor: p.bgLight,
            borderRadius: '6px',
            borderLeft: `3px solid ${p.primary}`,
          }}
        >
          <p style={{ fontStyle: 'italic', fontSize: '0.929em', color: p.textMain, margin: 0 }}>
            "{ref.reference}"
          </p>
          <p style={{ fontWeight: 600, fontSize: '0.929em', margin: '6px 0 0' }}>— {ref.name}</p>
        </div>
      ))}
    </section>
  );
};
