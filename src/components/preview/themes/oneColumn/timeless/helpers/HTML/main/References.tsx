import { SectionHeader } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/CommonHTML';
import type { TimelessSharedProps } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainReferencesSection = ({
  data: items,
  p,
  labels,
}: TimelessSharedProps<ResumeData['references']>) => {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <SectionHeader label={labels.references || 'References'} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '20px',
              border: `1px solid ${p.border}`,
              borderRadius: '4px',
              fontStyle: 'italic',
            }}
          >
            <p
              style={{
                color: p.textMuted,
                fontSize: '1.125rem',
                lineHeight: 1.6,
                marginBottom: '8px',
              }}
            >
              "{item.reference}"
            </p>
            <p
              style={{
                fontWeight: 500,
                fontStyle: 'normal',
                color: p.text,
                fontSize: '0.85rem',
                margin: 0,
              }}
            >
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
