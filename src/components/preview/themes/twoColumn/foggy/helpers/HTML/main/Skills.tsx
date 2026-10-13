import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import {
  DiscreteLevelBar,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Zap } from 'lucide-react';

export const MainSkillsSection = ({
  data: visibleSkills,
  p,
  labels,
  cvLocale,
}: FoggySharedProps<ResumeData['skills']>) => {
  if (!visibleSkills || visibleSkills.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: p.bgCard,
        border: `1px solid ${p.border}`,
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: '24px',
      }}
    >
      <SectionHeader icon={<Zap size={16} />} title={labels.skills} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {visibleSkills.map((skill, i) => {
          const { value } = getLevelInfo(skill.level, 'skill');
          const levelLabel = getSkillLevelLabel(skill.level, cvLocale?.code);

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '1em',
                    fontWeight: 700,
                    color: p.text,
                    flex: 1,
                    marginRight: '8px',
                  }}
                >
                  {skill.name}
                </span>
                {levelLabel && (
                  <span
                    style={{
                      fontSize: '0.857em',
                      color: p.primary,
                      fontWeight: 500,
                      fontStyle: 'italic',
                      flexShrink: 0,
                    }}
                  >
                    {levelLabel}
                  </span>
                )}
              </div>
              {value > 0 && <DiscreteLevelBar value={value} max={4} p={p} />}
              {skill.keywords && skill.keywords.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {skill.keywords.map((kw, j) => (
                    <span
                      key={j}
                      style={{
                        fontSize: '0.786em',
                        backgroundColor: p.primaryVeryLight,
                        color: p.textMuted,
                        padding: '4px 10px',
                        borderRadius: '6px',
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
    </div>
  );
};
