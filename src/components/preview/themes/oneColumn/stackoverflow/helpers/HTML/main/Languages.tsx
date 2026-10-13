import {
  LevelBar,
  SOSection,
} from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/CommonHTML';
import type { StackoverflowSharedProps } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/types';
import { getLanguageLabel, getLevelInfo } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';

export const MainLanguagesSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: StackoverflowSharedProps<ResumeData['languages']>) => {
  if (!items || items.length === 0 || !p || !labels) return null;
  return (
    <SOSection title={labels.languages} p={p}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {items.map((l, i) => {
          const { value, max } = getLevelInfo(l.level, 'language');
          const displayLabel = getLanguageLabel(l.level, l.certificate, cvLocale.code);

          return (
            <div key={i}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '2px',
                }}
              >
                <strong style={{ flex: 1, marginRight: '8px', fontSize: '0.929em' }}>
                  {l.language}
                </strong>
                {displayLabel && (
                  <span style={{ color: p.textMuted, fontSize: '0.8125em', flexShrink: 0 }}>
                    {displayLabel}
                  </span>
                )}
              </div>
              {value > 0 && <LevelBar level={value} max={max} p={p} type="discrete" />}
            </div>
          );
        })}
      </div>
    </SOSection>
  );
};
