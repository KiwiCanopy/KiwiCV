import { getLanguageLabel, getLevelInfo } from '@/components/preview/themes/shared';
import { SideSectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Languages } from 'lucide-react';

export const SideLanguagesSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: SoftSharedProps<ResumeData['languages']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      <SideSectionHeader title={labels.languages || 'Languages'} p={p} icon={Languages} />

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
                  alignItems: 'baseline',
                  marginBottom: '4px',
                }}
              >
                <h5
                  style={{ fontWeight: 700, fontSize: '0.8125rem', margin: 0, color: p.textMain }}
                >
                  {item.language}
                </h5>
                <span style={{ fontSize: '0.75rem', color: p.textLight }}>{displayLabel}</span>
              </div>
              <div
                style={{
                  height: '4px',
                  width: '100%',
                  backgroundColor: `${p.primary}1a`,
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(value / 5) * 100}%`,
                    backgroundColor: p.primary,
                    borderRadius: '2px',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
