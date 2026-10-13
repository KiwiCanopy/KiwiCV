import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import { DiscreteLevelBar } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const SideSkillsSection = ({
  data: skills,
  p,
  cvLocale,
}: LunarSharedProps<ResumeData['skills']>) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2em' }}>
    {skills.map((skill, i) => {
      const { value } = getLevelInfo(skill.level, 'skill');
      const levelLabel = getSkillLevelLabel(skill.level, cvLocale?.code);

      return (
        <div key={i}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '0.4em',
            }}
          >
            <span style={{ fontSize: '0.92em', fontWeight: 600, flex: 1, marginRight: '0.8em' }}>
              {skill.name}
            </span>
            {levelLabel && (
              <span
                style={{
                  fontSize: '0.9em',
                  // Same as `side/Languages.tsx` — `p.textLight` is declared by
                  // none of lunar's seven palettes and rendered `undefined`
                  // `sidebarHeading` is the theme's own muted sidebar
                  // colour, matching the level bar directly below.
                  color: p?.sidebarHeading || 'rgba(255,255,255,0.7)',
                  fontStyle: 'italic',
                  flexShrink: 0,
                }}
              >
                {levelLabel}
              </span>
            )}
          </div>
          {value > 0 && (
            <div style={{ marginBottom: '0.6em' }}>
              <DiscreteLevelBar
                value={value}
                max={4}
                color={p?.sidebarHeading || 'rgba(255,255,255,0.7)'}
              />
            </div>
          )}
        </div>
      );
    })}
  </div>
);
