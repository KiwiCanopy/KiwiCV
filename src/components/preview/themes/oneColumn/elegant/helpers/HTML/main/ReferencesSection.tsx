import { ElegantSection } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/CommonHTML';
import type { ElegantSharedProps } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainReferencesSection = ({
  data: items,
  p,
  labels,
  cvLocale: _,
}: ElegantSharedProps<ResumeData['references']>) => {
  if (!items || items.length === 0) return null;

  return (
    <ElegantSection title={labels.references} p={p}>
      {items.map((ref, i) => (
        <blockquote
          key={i}
          style={{
            margin: '0 0 16px',
            padding: '12px 20px',
            borderLeft: `3px solid ${p.accent}`,
            backgroundColor: '#f7fafc',
          }}
        >
          <p style={{ fontStyle: 'italic', fontSize: '0.929em', color: '#4a5568', margin: 0 }}>
            "{ref.reference}"
          </p>
          <footer style={{ fontWeight: 600, fontSize: '0.857em', marginTop: '8px' }}>
            — {ref.name}
          </footer>
        </blockquote>
      ))}
    </ElegantSection>
  );
};
