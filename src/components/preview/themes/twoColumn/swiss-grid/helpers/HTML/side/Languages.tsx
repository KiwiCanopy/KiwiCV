import { getLanguageLabel } from '@/components/preview/themes/shared';
import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import { sidebarHeaderStyle } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const SideLanguagesSection = ({
  data,
  p,
  label,
  cvLocale,
}: SwissGridSharedProps<ResumeData['languages']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && <h3 style={sidebarHeaderStyle(p)}>{label}</h3>}
      {data.map((lang: ResumeData['languages'][number], i: number) => {
        const level = lang.level ?? 0;
        const secondary = getLanguageLabel(lang.level, lang.certificate, cvLocale.code);

        return (
          <div
            key={lang._vId || i}
            style={{ marginBottom: '16px', marginTop: i === 0 && label ? '16px' : '0' }}
          >
            <div
              style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '4px' }}
            >
              <span
                style={{
                  fontSize: '0.8125em',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  flex: 1,
                  paddingRight: '4px',
                  wordBreak: 'break-word',
                }}
              >
                {lang.language}
              </span>
              <span
                style={{
                  fontSize: '0.75em',
                  color: p.primary,
                  fontWeight: 700,
                  flexShrink: 0,
                  textAlign: 'right',
                  maxWidth: '60%',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                }}
              >
                {secondary}
              </span>
            </div>
            {level > 0 && (
              <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    style={{
                      height: '3px',
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
  );
};
