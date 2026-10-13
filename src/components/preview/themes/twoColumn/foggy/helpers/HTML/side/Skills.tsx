import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import {
  DiscreteLevelBar,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Zap } from 'lucide-react';

export const SideSkillsSection = ({
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
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <SectionHeader icon={<Zap size={14} />} title={labels.skills} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {visibleSkills.map((skill, i) => {
          const { value } = getLevelInfo(skill.level, 'skill');
          const levelLabel = getSkillLevelLabel(skill.level, cvLocale?.code);

          return (
            <div key={i}>
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
                  {skill.name}
                </span>
                {levelLabel && (
                  <span
                    style={{
                      fontSize: '0.786em',
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
