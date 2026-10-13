import { getLanguageLabel, getLevelInfo } from '@/components/preview/themes/shared';
import {
  DiscreteLevelBar,
  MistySection,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainLanguagesSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: MistySharedProps<ResumeData['languages']>) => {
  if (!items || items.length === 0) return null;
  return (
    <MistySection title={labels?.languages || ''} p={p}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px 16px',
          paddingLeft: '4px',
        }}
      >
        {items.map((lang, i) => {
          const { value, max } = getLevelInfo(lang.level, 'language');
          const displayLabel = getLanguageLabel(lang.level, lang.certificate, cvLocale.code);

          return (
            <div
              key={i}
              style={{
                flex: '1 1 calc(50% - 8px)',
                minWidth: '220px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.857em',
                    fontWeight: 500,
                    color: p?.text,
                    flex: 1,
                    marginRight: '8px',
                  }}
                >
                  {lang.language}
                </span>
                {displayLabel && (
                  <span
                    style={{
                      fontSize: '0.714em',
                      color: p?.textLight,
                      fontStyle: 'italic',
                      flexShrink: 0,
                    }}
                  >
                    {displayLabel}
                  </span>
                )}
              </div>
              {value > 0 && <DiscreteLevelBar value={value} max={max} p={p} />}
            </div>
          );
        })}
      </div>
    </MistySection>
  );
};
