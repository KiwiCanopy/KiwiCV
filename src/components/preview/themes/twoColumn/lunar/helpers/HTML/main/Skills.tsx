import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import {
  DiscreteLevelBar,
  Section,
} from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainSkillsSection = ({
  data: skills,
  label,
  p,
  cvLocale,
}: LunarSharedProps<ResumeData['skills']>) => (
  <>
    {skills.map((skill: ResumeData['skills'][number], i: number) => {
      const { value } = getLevelInfo(skill.level, 'skill');
      const levelLabel = getSkillLevelLabel(skill.level, cvLocale?.code);

      return (
        <Section key={i} title={i === 0 ? label || '' : ''} p={p}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.4em',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '1.05em', flex: 1, marginRight: '0.8em' }}>
              {skill.name}
            </span>
            {levelLabel && (
              <span
                style={{ fontSize: '0.93em', opacity: 0.7, fontStyle: 'italic', flexShrink: 0 }}
              >
                {levelLabel}
              </span>
            )}
          </div>
          {value > 0 && (
            <div style={{ marginBottom: '0.6em' }}>
              <DiscreteLevelBar value={value} max={4} color={p?.primary} />
            </div>
          )}
          {skill.keywords && skill.keywords.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5em',
                marginBottom: '0.8em',
                marginTop: '0.4em',
              }}
            >
              {skill.keywords.map((kw: string, j: number) => (
                <span
                  key={j}
                  style={{
                    fontSize: '0.86em',
                    padding: '0.2em 0.8em',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    color: p?.textMuted || '#444',
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </Section>
      );
    })}
  </>
);
