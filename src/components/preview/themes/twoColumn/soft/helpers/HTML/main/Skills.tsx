import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import { SectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Brain } from 'lucide-react';

export const MainSkillsSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: SoftSharedProps<ResumeData['skills']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <SectionHeader title={labels.skills || 'Skills'} p={p} icon={Brain} />

      {items.map((item, i) => {
        const { value } = getLevelInfo(item.level, 'skill');
        const levelLabel = getSkillLevelLabel(item.level, cvLocale?.code);

        return (
          <div
            key={i}
            style={{
              paddingLeft: '12px',
              borderLeft: `2px solid ${p.border}`,
              marginLeft: '14px',
              marginBottom: i === items.length - 1 ? 0 : '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '8px',
              }}
            >
              <h4 style={{ fontWeight: 700, fontSize: '1.125rem', margin: 0, color: p.textMain }}>
                {item.name}
              </h4>
              {levelLabel && (
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: p.textLight,
                    fontWeight: 600,
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
                  height: '6px',
                  width: '100%',
                  marginBottom: '12px',
                }}
              >
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    style={{
                      flex: 1,
                      height: '100%',
                      backgroundColor: step <= value ? p.primary : `${p.primary}1a`,
                      borderRadius: '3px',
                    }}
                  />
                ))}
              </div>
            )}

            {item.keywords && item.keywords.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {item.keywords.map((keyword, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: '0.85em',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      border: `1px solid ${p.border}`,
                      padding: '4px 12px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      color: p.textMuted,
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
