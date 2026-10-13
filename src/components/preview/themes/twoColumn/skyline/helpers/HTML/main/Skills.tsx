import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import { SectionHeader } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Zap } from 'lucide-react';

export const MainSkillsSection = ({
  data,
  p,
  labels,
  cvLocale,
}: SkylineSharedProps<ResumeData['skills']>) => {
  const items = data;
  if (!items?.length) return null;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(255, 255, 255, 1)',
        boxShadow: `-8px 8px 32px 0 ${p.primaryLight}`,
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '16px',
      }}
    >
      <SectionHeader icon={<Zap size={18} />} title={labels.skills} isMain p={p} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
        }}
      >
        {items.map((skill, i) => {
          const { value } = getLevelInfo(skill.level, 'skill');
          const levelLabel = getSkillLevelLabel(skill.level, cvLocale?.code);
          return (
            <div
              key={i}
              style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1.5px solid rgba(255, 255, 255, 1)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: `-4px 4px 12px ${p.primaryLight}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    fontSize: '1em',
                    fontWeight: 700,
                    color: p.textMain,
                    flex: 1,
                    marginRight: '8px',
                    minWidth: 0,
                    wordBreak: 'break-word',
                  }}
                >
                  {skill.name}
                </span>
                {levelLabel && (
                  <span
                    style={{ fontSize: '0.85em', opacity: 0.7, flexShrink: 0, textAlign: 'right' }}
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
                    marginTop: '6px',
                  }}
                >
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        height: '100%',
                        backgroundColor: step <= value ? p.primary : '#e2e8f0',
                        borderRadius: '2px',
                      }}
                    />
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {skill.keywords.map((kw, j) => (
                  <span
                    key={j}
                    style={{
                      padding: '4px 12px',
                      background: '#ffffff',
                      border: `1px solid ${p.border}`,
                      borderRadius: '10px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                      fontSize: '0.8em',
                      fontWeight: 600,
                      color: p.textMain,
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
