import { SectionHeader } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/CommonHTML';
import {
  FONT_MONO,
  FONT_SANS,
} from '@/components/preview/themes/oneColumn/javascript/helpers/shared/constants';
import type { JavaScriptSharedProps } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/types';
import {
  getFluencyLevel,
  getLanguageLabel,
  getSectionItemHash,
} from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';

export const MainLanguagesSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: JavaScriptSharedProps<ResumeData['languages']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;
  const points = [1, 2, 3, 4, 5];

  return (
    <section style={{ marginBottom: '32px', fontFamily: FONT_SANS }}>
      <SectionHeader title={labels.languages || 'Languages'} p={p} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          rowGap: '20px',
          columnGap: '12px',
        }}
      >
        {items.map((lang) => {
          const level = getFluencyLevel(lang.certificate, lang.level);
          const displayLabel = getLanguageLabel(lang.level, lang.certificate, cvLocale.code);
          return (
            <div
              key={getSectionItemHash('languages', lang)}
              style={{
                padding: '12px 16px',
                border: `1px solid ${p.slate200}`,
                borderRadius: '8px',
                backgroundColor: p.paper,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <div style={{ fontSize: '0.875em', fontWeight: 600, color: p.slate900 }}>
                  {lang.language}
                </div>
                {displayLabel && (
                  <div
                    style={{
                      fontSize: '0.65em',
                      fontFamily: FONT_MONO,
                      color: p.slate500,
                      backgroundColor: p.paper,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: `1px solid ${p.slate200}`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {displayLabel}
                  </div>
                )}
              </div>

              {/* Compliance: Discrete 5-point Bar */}
              {level > 0 && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  {points.map((pt) => {
                    const isActive = level >= pt;
                    return (
                      <div
                        key={pt}
                        style={{
                          height: '4px',
                          flex: 1,
                          backgroundColor: isActive ? p.primary : p.slate200,
                          borderRadius: '2px',
                          opacity: isActive ? 1 : 0.3,
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
