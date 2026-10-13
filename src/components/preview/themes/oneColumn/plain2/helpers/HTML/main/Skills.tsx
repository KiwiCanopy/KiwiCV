import { SectionHeader } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/CommonHTML';
import type { Plain2SharedProps } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/types';
import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';

export const MainSkillsSection = ({
  data: items,
  p,
  labels,
  label,
  cvLocale,
}: Plain2SharedProps<ResumeData['skills']>) => {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <SectionHeader title={label || labels.skills} p={p} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px 24px',
        }}
      >
        {items.map((skill: ResumeData['skills'][number], i: number) => {
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
                  fontSize: '0.929em',
                }}
              >
                <span style={{ fontWeight: 600 }}>{skill.name}</span>
                {levelLabel && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '1px 6px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '2px',
                      border: '1px solid #eee',
                      color: p.textMuted,
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
                    height: '4px',
                    marginBottom: '6px',
                  }}
                >
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      style={{
                        height: '100%',
                        flex: 1,
                        backgroundColor: step <= value ? '#374151' : p.bgLight,
                        borderRadius: '2px',
                      }}
                    />
                  ))}
                </div>
              )}
              {skill.keywords && skill.keywords.length > 0 && (
                <div style={{ fontSize: '0.857em', color: p.textMuted }}>
                  {skill.keywords.join(' · ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
