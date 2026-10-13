import { SectionHeader } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/CommonHTML';
import type { Plain2SharedProps } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/types';
import { getLanguageLabel, getLevelInfo } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';

export const MainLanguagesSection = ({
  data: items,
  p,
  labels,
  label,
  cvLocale,
}: Plain2SharedProps<ResumeData['languages']>) => {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <SectionHeader title={label || labels.languages} p={p} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px 32px',
        }}
      >
        {items.map((lang: ResumeData['languages'][number], i: number) => {
          const { value } = getLevelInfo(lang.level, 'language');
          const displayLabel = getLanguageLabel(lang.level, lang.certificate, cvLocale.code);

          return (
            <div key={i} style={{ fontSize: '0.929em' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontWeight: 600 }}>{lang.language}</span>
                {displayLabel && (
                  <span
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
                  </span>
                )}
              </div>
              {value > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                  {[1, 2, 3, 4, 5].map((dot) => (
                    <div
                      key={dot}
                      style={{
                        width: '15px',
                        height: '5px',
                        borderRadius: '1px',
                        backgroundColor: dot <= value ? '#374151' : p.border,
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
