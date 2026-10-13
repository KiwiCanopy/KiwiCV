import { getLanguageLabel, getLevelInfo } from '@/components/preview/themes/shared';
import {
  DiscreteLevelBar as LevelBar,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Languages } from 'lucide-react';

export const SideLanguagesSection = ({
  data: visibleLanguages,
  p,
  labels,
  cvLocale,
}: FoggySharedProps<ResumeData['languages']>) => {
  if (!visibleLanguages || visibleLanguages.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: p.bgCard,
        border: `1px solid ${p.border}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <SectionHeader icon={<Languages size={14} />} title={labels.languages} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {visibleLanguages.map((lang, i) => {
          const { value } = getLevelInfo(lang.level, 'language');
          const displayLabel = getLanguageLabel(lang.level, lang.certificate, cvLocale?.code);

          return (
            <div key={i} style={{ borderBottom: `1px solid ${p.border}`, paddingBottom: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.929em',
                    fontWeight: 700,
                    color: p.text,
                    flex: 1,
                    marginRight: '8px',
                  }}
                >
                  {lang.language}
                </span>
                {displayLabel && (
                  <span
                    style={{
                      fontSize: '0.786em',
                      color: p.primary,
                      fontWeight: 500,
                      fontStyle: 'italic',
                      flexShrink: 0,
                    }}
                  >
                    {displayLabel}
                  </span>
                )}
              </div>
              {value > 0 && <LevelBar value={value} max={5} p={p} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
