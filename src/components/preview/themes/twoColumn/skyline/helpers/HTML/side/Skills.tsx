import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import {
  GlassPanel,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Zap } from 'lucide-react';

export const SideSkillsSection = ({
  data,
  p,
  labels,
  cvLocale,
}: SkylineSharedProps<ResumeData['skills']>) => {
  const items = data;
  if (!items?.length) return null;

  return (
    <GlassPanel p={p}>
      <SectionHeader icon={<Zap size={18} />} title={labels.skills} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((skill, i) => {
          const { value } = getLevelInfo(skill.level, 'skill');
          const levelLabel = getSkillLevelLabel(skill.level, cvLocale?.code);

          return (
            <div key={i}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ fontWeight: 700, color: p.textMain, fontSize: '0.95em', flex: 1 }}>
                  {skill.name}
                </div>
                {levelLabel && (
                  <div style={{ fontSize: '0.85em', color: p.textMuted, flexShrink: 0 }}>
                    {levelLabel}
                  </div>
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
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
};
