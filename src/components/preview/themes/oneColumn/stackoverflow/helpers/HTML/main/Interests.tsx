import { SOSection } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/CommonHTML';
import type { StackoverflowSharedProps } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainInterestsSection = ({
  data: items,
  p,
  labels,
}: StackoverflowSharedProps<ResumeData['interests']>) => {
  if (!items || items.length === 0 || !p || !labels) return null;
  return (
    <SOSection title={labels.interests} p={p}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {items.map((int, i) => (
          <div
            key={i}
            style={{
              padding: '6px 12px',
              backgroundColor: p.bgLight,
              color: p.dark,
              borderRadius: '3px',
              fontSize: '0.857em',
              border: `1px solid ${p.border}`,
            }}
          >
            <span style={{ fontWeight: 600 }}>{int.name}</span>
            {int.keywords.length > 0 && (
              <span style={{ color: p.textMuted }}> · {int.keywords.join(', ')}</span>
            )}
          </div>
        ))}
      </div>
    </SOSection>
  );
};
