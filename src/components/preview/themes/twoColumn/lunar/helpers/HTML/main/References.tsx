import { Section } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainReferencesSection = ({
  data: references,
  label,
  p,
}: LunarSharedProps<ResumeData['references']>) => (
  <>
    {references.map((ref: ResumeData['references'][number], i: number) => (
      <Section key={i} title={i === 0 ? label || '' : ''} p={p}>
        <div
          style={{
            marginBottom: '1em',
            padding: '0.8em',
            backgroundColor: 'rgba(0,0,0,0.03)',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontStyle: 'italic', fontSize: '0.93em', opacity: 0.8 }}>
            "{ref.reference}"
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: '0.86em',
              marginTop: '0.4em',
              textAlign: 'right',
            }}
          >
            — {ref.name}
          </div>
        </div>
      </Section>
    ))}
  </>
);
