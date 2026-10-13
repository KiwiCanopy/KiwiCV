import {
  DiscreteLevelBar,
  ElegantSection,
} from '@/components/preview/themes/oneColumn/elegant/helpers/shared/CommonHTML';
import type { ElegantSharedProps } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/types';
import { getLevelInfo, getSkillLevelLabel } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';

export const MainSkillsSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: ElegantSharedProps<ResumeData['skills']>) => {
  if (!items || items.length === 0) return null;

  return (
    <ElegantSection title={labels.skills} p={p}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '24px 4%',
        }}
      >
        {items.map((skill, i) => {
          const { value } = getLevelInfo(skill.level, 'skill');
          const levelLabel = getSkillLevelLabel(skill.level, cvLocale?.code);
          return (
            <div key={i} style={{ width: '48%', marginBottom: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: '#2d3748',
                    fontSize: '14px',
                    flex: 1,
                    marginRight: '8px',
                  }}
                >
                  {skill.name || ''}
                </span>
                {levelLabel && (
                  <span style={{ fontSize: '0.857em', color: '#718096', fontStyle: 'italic' }}>
                    {levelLabel}
                  </span>
                )}
              </div>
              {value > 0 && <DiscreteLevelBar value={value} max={4} p={p} />}
              {skill.keywords && skill.keywords.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginTop: '8px',
                  }}
                >
                  {skill.keywords.map((kw, j) => (
                    <span
                      key={j}
                      style={{
                        padding: '1px 6px',
                        backgroundColor: '#f7fafc',
                        color: '#4a5568',
                        borderRadius: '4px',
                        fontSize: '11px',
                        border: '1px solid #e2e8f0',
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
    </ElegantSection>
  );
};
