import { SectionHeader } from '@/components/preview/themes/oneColumn/plain/helpers/shared/CommonHTML';
import type { PlainSharedProps } from '@/components/preview/themes/oneColumn/plain/helpers/shared/types';
import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';

export const MainSkillsSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: PlainSharedProps<ResumeData['skills']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <section>
      <SectionHeader title={labels.skills || ''} p={p} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
          fontSize: '13px',
        }}
      >
        {items.map((sk, i) => {
          const { value } = getLevelInfo(sk.level, 'skill');
          const levelLabel = getSkillLevelLabel(sk.level, cvLocale?.code);

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '4px',
                }}
              >
                <div style={{ fontWeight: 600 }}>{sk.name}</div>
                {levelLabel && (
                  <div
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
                  </div>
                )}
              </div>
              {value > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '3px',
                    height: '4px',
                    width: '100%',
                    marginBottom: '4px',
                  }}
                >
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      style={{
                        height: '100%',
                        flex: 1,
                        backgroundColor: step <= value ? p.primary : '#eee',
                        borderRadius: '1px',
                      }}
                    />
                  ))}
                </div>
              )}
              {sk.keywords && sk.keywords.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    fontSize: '0.85em',
                    color: p.textMuted || '#666',
                  }}
                >
                  {sk.keywords.map((kw, j) => (
                    <span
                      key={j}
                      style={{
                        fontSize: '0.75rem',
                        padding: '1px 6px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '2px',
                        border: '1px solid #eee',
                        color: p.textMuted,
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
