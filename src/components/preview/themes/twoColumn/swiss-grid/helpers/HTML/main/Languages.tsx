import { getLanguageLabel } from '@/components/preview/themes/shared';
import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import {
  sectionLabelStyle,
  sectionNumStyle,
} from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const MainLanguagesSection = ({
  data,
  p,
  label,
  num,
  cvLocale,
}: SwissGridSharedProps<ResumeData['languages']>) => {
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '24px',
        }}
      >
        {data.map((lang: ResumeData['languages'][number], i: number) => {
          const level = lang.level ?? 0;
          const secondary = getLanguageLabel(level, lang.certificate, cvLocale.code);

          return (
            <div key={lang._vId || i} style={{ marginBottom: '16px' }}>
              <div
                style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}
              >
                <span
                  style={{
                    fontSize: '1em',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    flex: 1,
                    paddingRight: '8px',
                  }}
                >
                  {lang.language}
                </span>
                <span
                  style={{ fontSize: '0.8125em', color: p.primary, fontWeight: 700, flexShrink: 0 }}
                >
                  {secondary}
                </span>
              </div>
              {level > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      style={{
                        height: '4px',
                        flex: 1,
                        backgroundColor: step <= level ? p.primary : p.bgLight,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
