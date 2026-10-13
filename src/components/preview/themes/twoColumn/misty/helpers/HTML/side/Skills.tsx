import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import {
  DiscreteLevelBar,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const SideSkillsSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: MistySharedProps<ResumeData['skills']>) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <SectionHeader title={labels?.skills || ''} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((skill, i) => {
          const { value } = getLevelInfo(skill.level, 'skill');
          const levelLabel = getSkillLevelLabel(skill.level, cvLocale?.code);
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
                <div
                  style={{
                    fontSize: '0.786em',
                    fontWeight: 700,
                    color: p?.text,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {skill.name}
                </div>
                {levelLabel && (
                  <div style={{ fontSize: '0.714em', color: p?.textLight, fontStyle: 'italic' }}>
                    {levelLabel}
                  </div>
                )}
              </div>

              {value > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <DiscreteLevelBar value={value} max={4} p={p} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
