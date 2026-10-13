import { SectionHeader } from '@/components/preview/themes/oneColumn/plain/helpers/shared/CommonHTML';
import type { PlainSharedProps } from '@/components/preview/themes/oneColumn/plain/helpers/shared/types';
import { getLanguageLabel, getLevelInfo } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';

export const MainLanguagesSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: PlainSharedProps<ResumeData['languages']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <section>
      <SectionHeader title={labels.languages || ''} p={p} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
          fontSize: '13px',
        }}
      >
        {items.map((lang, i) => {
          const { value } = getLevelInfo(lang.level, 'language');
          const displayLabel = getLanguageLabel(lang.level, lang.certificate, cvLocale.code);

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '4px',
                }}
              >
                <div style={{ fontWeight: 600 }}>{lang.language}</div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    padding: '1px 6px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '2px',
                    border: '1px solid #eee',
                    color: p.textMuted,
                  }}
                >
                  {displayLabel}
                </div>
              </div>
              {value > 0 && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((dot) => (
                    <div
                      key={dot}
                      style={{
                        height: '6px',
                        width: '20px',
                        backgroundColor: dot <= value ? p.primary : '#eee',
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
