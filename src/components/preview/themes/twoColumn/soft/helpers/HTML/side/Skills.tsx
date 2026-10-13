import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import { SideSectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Brain } from 'lucide-react';

export const SideSkillsSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: SoftSharedProps<ResumeData['skills']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '12px' }}>
      <SideSectionHeader title={labels.skills || 'Skills'} p={p} icon={Brain} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item, i) => {
          const { value } = getLevelInfo(item.level, 'skill');
          const levelLabel = getSkillLevelLabel(item.level, cvLocale?.code);

          return (
            <div key={i}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '4px',
                }}
              >
                <h5
                  style={{ fontWeight: 700, fontSize: '0.8125rem', margin: 0, color: p.textMain }}
                >
                  {item.name}
                </h5>
                {levelLabel && (
                  <span style={{ fontSize: '0.75rem', color: p.textLight }}>{levelLabel}</span>
                )}
              </div>
              {value > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '3px',
                    height: '4px',
                    width: '100%',
                  }}
                >
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        height: '100%',
                        backgroundColor: step <= value ? p.primary : `${p.primary}1a`,
                        borderRadius: '2px',
                      }}
                    />
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
