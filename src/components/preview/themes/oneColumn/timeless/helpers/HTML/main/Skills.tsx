import { SectionHeader } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/CommonHTML';
import type { TimelessSharedProps } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/types';
import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';

export const MainSkillsSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: TimelessSharedProps<ResumeData['skills']>) => {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <SectionHeader label={labels.skills || 'Skills'} p={p} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px 24px',
        }}
      >
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
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontWeight: 600, color: p.text, fontSize: '1.05rem' }}>
                  {skill.name}
                </span>
                {levelLabel && (
                  <span style={{ fontSize: '0.9rem', color: p.textMuted, fontStyle: 'italic' }}>
                    {levelLabel}
                  </span>
                )}
              </div>
              {value > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '3px',
                    height: '4px',
                    marginBottom: '8px',
                  }}
                >
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      style={{
                        height: '100%',
                        flex: 1,
                        backgroundColor: step <= value ? p.text : p.bgLight,
                        borderRadius: '2px',
                      }}
                    />
                  ))}
                </div>
              )}
              {skill.keywords && skill.keywords.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skill.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.875rem',
                        padding: '4px 10px',
                        backgroundColor: p.bgLight,
                        borderRadius: '4px',
                        color: p.textMuted,
                        fontWeight: 500,
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
    </section>
  );
};
