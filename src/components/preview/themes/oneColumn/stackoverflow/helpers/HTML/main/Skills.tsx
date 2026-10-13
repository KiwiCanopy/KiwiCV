import {
  LevelBar,
  SOSection,
} from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/CommonHTML';
import type { StackoverflowSharedProps } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/types';
import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';

export const MainSkillsSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: StackoverflowSharedProps<ResumeData['skills']>) => {
  if (!items || items.length === 0 || !p || !labels) return null;
  return (
    <SOSection title={labels.skills} p={p}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
        }}
      >
        {items.map((skill, i) => {
          const { value } = getLevelInfo(skill.level, 'skill');
          const levelLabel = getSkillLevelLabel(skill.level, cvLocale?.code);
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '2px',
                }}
              >
                <strong style={{ flex: 1, marginRight: '8px', fontSize: '0.929em', color: p.dark }}>
                  {skill.name}
                </strong>
                {levelLabel && (
                  <span style={{ color: p.textMuted, fontSize: '0.8125em', flexShrink: 0 }}>
                    {levelLabel}
                  </span>
                )}
              </div>
              {value > 0 && <LevelBar level={value} max={4} p={p} />}
              {skill.keywords.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    marginTop: '2px',
                    marginBottom: '8px',
                  }}
                >
                  {skill.keywords.map((kw, j) => (
                    <span
                      key={j}
                      style={{
                        padding: '1px 5px',
                        backgroundColor: p.bgLight,
                        fontSize: '0.75em',
                        borderRadius: '1px',
                        color: p.textMuted,
                        border: `1px solid ${p.border}`,
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
    </SOSection>
  );
};
