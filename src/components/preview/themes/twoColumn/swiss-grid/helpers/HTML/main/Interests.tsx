import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import {
  sectionLabelStyle,
  sectionNumStyle,
} from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const MainInterestsSection = ({
  cvLocale,
  data,
  p,
  label,
  num,
}: SwissGridSharedProps<ResumeData['interests']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={sectionLabelStyle(p)}>
          <span style={sectionNumStyle(p)}>{num}</span>
          <span>{label}</span>
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {data.map((interest: ResumeData['interests'][number], i: number) => (
          <div key={interest._vId || i} style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1em', marginBottom: '4px' }}>
              {interest.name.toLocaleUpperCase(cvLocale.bcp47)}
            </div>
            {interest.keywords && interest.keywords.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {interest.keywords.map((kw: string, j: number) => (
                  <span
                    key={j}
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
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
