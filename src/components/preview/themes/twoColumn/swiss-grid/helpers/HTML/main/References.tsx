import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import {
  sectionLabelStyle,
  sectionNumStyle,
} from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const MainReferencesSection = ({
  data,
  p,
  label,
  num,
}: SwissGridSharedProps<ResumeData['references']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={sectionLabelStyle(p)}>
          <span style={sectionNumStyle(p)}>{num}</span>
          <span>{label}</span>
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '32px',
        }}
      >
        {data.map((ref: ResumeData['references'][number], i: number) => (
          <div key={ref._vId || i} style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '1em',
                color: p.textMuted,
                fontStyle: 'italic',
                lineHeight: 1.6,
                marginBottom: '12px',
                borderLeft: `4px solid ${p.primary}`,
                paddingLeft: '16px',
              }}
            >
              "{ref.reference}"
            </div>
            <div style={{ fontSize: '0.75em', fontWeight: 900, textTransform: 'uppercase' }}>
              — {ref.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
