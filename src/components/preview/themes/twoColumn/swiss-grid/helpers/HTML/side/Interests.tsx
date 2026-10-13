import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import { sidebarHeaderStyle } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const SideInterestsSection = ({
  data,
  p,
  label,
}: SwissGridSharedProps<ResumeData['interests']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && <h3 style={sidebarHeaderStyle(p)}>{label}</h3>}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginTop: label ? '16px' : '0',
        }}
      >
        {data.map((interest: ResumeData['interests'][number], i: number) => (
          <span
            key={interest._vId || i}
            style={{
              fontSize: '0.75em',
              backgroundColor: p.border,
              color: p.textMain,
              padding: '2px 8px',
              borderRadius: '2px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {interest.name}
          </span>
        ))}
      </div>
    </div>
  );
};
