import { SectionHeader } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/CommonHTML';
import {
  FONT_MONO,
  FONT_SANS,
} from '@/components/preview/themes/oneColumn/javascript/helpers/shared/constants';
import type { JavaScriptSharedProps } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/types';
import {
  getLevelInfo,
  getSectionItemHash,
  getSkillLevelLabel,
} from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';

export const MainSkillsSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: JavaScriptSharedProps<ResumeData['skills']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <section style={{ marginBottom: '32px', fontFamily: FONT_SANS }}>
      <SectionHeader title={labels.skills || 'Skills'} p={p} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          rowGap: '24px',
          columnGap: '12px',
        }}
      >
        {items.map((skill) => {
          const { value } = getLevelInfo(skill.level, 'skill');
          const levelLabel = getSkillLevelLabel(skill.level, cvLocale?.code);
          return (
            <div
              key={getSectionItemHash('skills', skill)}
              style={{
                padding: '12px 16px',
                border: `1px solid ${p.slate200}`,
                borderRadius: '8px',
                backgroundColor: p.slate50,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '0.85em',
                      fontWeight: 'bold',
                      color: p.slate700,
                    }}
                  >
                    {skill.name}
                  </div>
                  {levelLabel && (
                    <div
                      style={{
                        fontSize: '0.65em',
                        fontFamily: FONT_MONO,
                        color: p.slate500,
                        backgroundColor: p.paper,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: `1px solid ${p.slate200}`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {levelLabel}
                    </div>
                  )}
                </div>

                {/* Compliance: 4-segment Discrete Indicator */}
                {skill.level && value > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            style={{
                              height: '4px',
                              flex: 1,
                              backgroundColor: step <= value ? p.primary : p.slate200,
                              borderRadius: '2px',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {skill.keywords && skill.keywords.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    marginTop: 'auto',
                  }}
                >
                  {skill.keywords.map((kw, j) => (
                    <span
                      key={j}
                      style={{
                        fontSize: '0.65em',
                        fontWeight: 600,
                        color: p.slate600,
                        backgroundColor: p.paper,
                        padding: '2px 8px',
                        border: `1px solid ${p.slate200}`,
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <div
                        style={{
                          width: '3px',
                          height: '3px',
                          borderRadius: '50%',
                          backgroundColor: p.primary,
                          opacity: 0.5,
                        }}
                      />
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
