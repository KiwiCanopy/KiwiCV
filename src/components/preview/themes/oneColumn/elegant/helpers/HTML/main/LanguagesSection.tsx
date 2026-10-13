import {
  DiscreteLevelBar,
  ElegantSection,
} from '@/components/preview/themes/oneColumn/elegant/helpers/shared/CommonHTML';
import type { ElegantSharedProps } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/types';
import { getLanguageLabel, getLevelInfo } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';

export const MainLanguagesSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: ElegantSharedProps<ResumeData['languages']>) => {
  if (!items || items.length === 0) return null;

  return (
    <ElegantSection title={labels.languages} p={p}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '16px 4%',
        }}
      >
        {items.map((lang, i) => {
          const { value, max } = getLevelInfo(lang.level, 'language');
          const displayLabel = getLanguageLabel(lang.level, lang.certificate, cvLocale.code);

          return (
            <div key={i} style={{ width: '48%', marginBottom: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '1px',
                }}
              >
                <span style={{ fontWeight: 700, color: '#2d3748', flex: 1, marginRight: '8px' }}>
                  {lang.language || ''}
                </span>
                {displayLabel && (
                  <span style={{ fontSize: '0.857em', color: '#718096', fontStyle: 'italic' }}>
                    {displayLabel}
                  </span>
                )}
              </div>
              {value > 0 && <DiscreteLevelBar value={value} max={max} p={p} />}
            </div>
          );
        })}
      </div>
    </ElegantSection>
  );
};
