import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import { sidebarHeaderStyle } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const SideReferencesSection = ({
  data,
  p,
  label,
}: SwissGridSharedProps<ResumeData['references']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && <h3 style={sidebarHeaderStyle(p)}>{label}</h3>}
      {data.map((ref: ResumeData['references'][number], i: number) => (
        <div
          key={ref._vId || i}
          style={{ marginBottom: '16px', marginTop: i === 0 && label ? '16px' : '0' }}
        >
          <div
            style={{
              fontSize: '0.75em',
              color: p.textMuted,
              fontStyle: 'italic',
              marginBottom: '4px',
            }}
          >
            "{ref.reference}"
          </div>
          <div style={{ fontSize: '0.7em', fontWeight: 900, textTransform: 'uppercase' }}>
            — {ref.name}
          </div>
        </div>
      ))}
    </div>
  );
};
