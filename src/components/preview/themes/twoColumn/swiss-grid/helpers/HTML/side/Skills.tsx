import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import { sidebarHeaderStyle } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const SideSkillsSection = ({
  data,
  p,
  label,
  cvLocale,
}: SwissGridSharedProps<ResumeData['skills']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && <h3 style={sidebarHeaderStyle(p)}>{label}</h3>}
      {data.map((skill: ResumeData['skills'][number], i: number) => {
        const { value } = getLevelInfo(skill.level, 'skill');
        const levelLabel = getSkillLevelLabel(skill.level, cvLocale?.code);

        return (
          <div
            key={skill._vId || i}
            style={{ marginBottom: '16px', marginTop: i === 0 && label ? '16px' : '0' }}
          >
            <div
              style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '4px' }}
            >
              <span
                style={{
                  fontSize: '0.8125em',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  flex: 1,
                  paddingRight: '4px',
                  wordBreak: 'break-word',
                }}
              >
                {skill.name}
              </span>
              {levelLabel && (
                <span
                  style={{
                    fontSize: '0.75em',
                    color: p.primary,
                    fontWeight: 700,
                    flexShrink: 0,
                    textAlign: 'right',
                    maxWidth: '60%',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                  }}
                >
                  {levelLabel}
                </span>
              )}
            </div>
            {value > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '3px',
                  width: '100%',
                  height: '4px',
                  marginTop: '4px',
                }}
              >
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    style={{
                      flex: 1,
                      height: '100%',
                      backgroundColor: step <= value ? p.primary : '#f3f4f6',
                      borderRadius: '1px',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
