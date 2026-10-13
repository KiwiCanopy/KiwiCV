import { SectionHeader } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/CommonHTML';
import type { TimelessSharedProps } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/types';
import { getLanguageLabel, getLevelInfo } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';

export const MainLanguagesSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: TimelessSharedProps<ResumeData['languages']>) => {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <SectionHeader label={labels.languages || 'Languages'} p={p} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '24px',
        }}
      >
        {items.map((item, i) => {
          const { value } = getLevelInfo(item.level, 'language');
          const displayLabel = getLanguageLabel(item.level, item.certificate, cvLocale.code);

          return (
            <div key={i}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontWeight: 600, color: p.text, fontSize: '0.95rem' }}>
                  {item.language}
                </span>
                <span style={{ fontSize: '0.8rem', color: p.textMuted, fontStyle: 'italic' }}>
                  {displayLabel}
                </span>
              </div>
              {value > 0 && (
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[1, 2, 3, 4, 5].map((dot) => (
                    <div
                      key={dot}
                      style={{
                        height: '4px',
                        flex: 1,
                        backgroundColor: dot <= value ? p.primary : p.border,
                        borderRadius: '1px',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
