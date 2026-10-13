import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import {
  DiscreteLevelBar,
  MistySection,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainSkillsSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: MistySharedProps<ResumeData['skills']>) => {
  if (!items || items.length === 0) return null;
  return (
    <MistySection title={labels?.skills || ''} p={p}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          paddingLeft: '4px',
        }}
      >
        {items.map((skill, i) => {
          const { value } = getLevelInfo(skill.level, 'skill');
          const levelLabel = getSkillLevelLabel(skill.level, cvLocale?.code);
          return (
            <div
              key={i}
              style={{
                flex: '1 1 calc(50% - 8px)',
                minWidth: '240px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.786em',
                    fontWeight: 700,
                    color: p?.text,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    flex: 1,
                    marginRight: '8px',
                  }}
                >
                  {skill.name}
                </span>
                {levelLabel && (
                  <span
                    style={{
                      fontSize: '0.714em',
                      color: p?.textLight,
                      fontStyle: 'italic',
                      flexShrink: 0,
                    }}
                  >
                    {levelLabel}
                  </span>
                )}
              </div>
              {value > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <DiscreteLevelBar value={value} max={4} p={p} />
                </div>
              )}
              {skill.keywords && skill.keywords.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {skill.keywords.map((kw, j) => (
                    <span
                      key={j}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: p?.primaryVeryLight,
                        border: `1px solid ${p?.border}`,
                        color: p?.textMuted,
                        borderRadius: '4px',
                        fontSize: '0.786em',
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </MistySection>
  );
};
