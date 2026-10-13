import { getLanguageLabel, getLevelInfo } from '@/components/preview/themes/shared';
import { SectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Languages } from 'lucide-react';

export const MainLanguagesSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: SoftSharedProps<ResumeData['languages']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;
  return (
    <div style={{ marginBottom: '32px' }}>
      {' '}
      {/* Added bottom margin here */}
      <SectionHeader title={labels.languages || ''} p={p} icon={Languages} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item, i) => {
          const { value } = getLevelInfo(item.level, 'language');
          const displayLabel = getLanguageLabel(item.level, item.certificate, cvLocale.code);
          return (
            <div key={i}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px', // Slightly increased to give the badge breathing room above the level bar
                  gap: '12px',
                }}
              >
                <span style={{ fontWeight: 600, flex: 1, color: p.textMain }}>{item.language}</span>
                {displayLabel && (
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      color: p.primary,
                      backgroundColor: `${p.primary}12`,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {displayLabel}
                  </span>
                )}
              </div>
              {value > 0 && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      style={{
                        height: '6px',
                        flex: 1,
                        backgroundColor: level <= value ? p.primary : `${p.primary}1a`,
                        borderRadius: '3px',
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
