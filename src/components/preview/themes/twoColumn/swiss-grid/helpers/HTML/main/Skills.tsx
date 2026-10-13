import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import type { SwissGridSharedProps } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import {
  sectionLabelStyle,
  sectionNumStyle,
} from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/utils';
import type { ResumeData } from '@/types/resume';

export const MainSkillsSection = ({
  data,
  p,
  label,
  num,
  cvLocale,
}: SwissGridSharedProps<ResumeData['skills']>) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={sectionLabelStyle(p)}>
          <span style={sectionNumStyle(p)}>{num}</span>
          <span>{label}</span>
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '24px',
        }}
      >
        {data.map((skill: ResumeData['skills'][number], i: number) => {
          const { value } = getLevelInfo(skill.level, 'skill');
          const levelLabel = getSkillLevelLabel(skill.level, cvLocale?.code);

          return (
            <div key={skill._vId || i} style={{ marginBottom: '16px' }}>
              <div
                style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}
              >
                <span
                  style={{
                    fontSize: '0.8125em',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    flex: 1,
                    paddingRight: '8px',
                  }}
                >
                  {skill.name}
                </span>
                {levelLabel && (
                  <span
                    style={{
                      fontSize: '0.8125em',
                      color: p.primary,
                      fontWeight: 700,
                      flexShrink: 0,
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
                    marginTop: '8px',
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
              {skill.keywords && skill.keywords.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginTop: '8px',
                  }}
                >
                  {skill.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.75em',
                        backgroundColor: p.border,
                        color: p.textMain,
                        padding: '2px 8px',
                        borderRadius: '2px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
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
