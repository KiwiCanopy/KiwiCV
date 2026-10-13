import { getLanguageLabel } from '@/components/preview/themes/shared';
import {
  LevelBar,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Languages } from 'lucide-react';

export const MainLanguagesSection = ({
  data: items,
  p,
  labels: labels,
  cvLocale,
}: SkylineSharedProps<ResumeData['languages']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(255, 255, 255, 1)',
        boxShadow: `0 8px 32px 0 ${p.primaryLight}`,
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
      }}
    >
      <SectionHeader icon={<Languages size={20} />} title={labels.languages || ''} p={p} isMain />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item, i) => {
          const displayLabel = getLanguageLabel(item.level, item.certificate, cvLocale?.code);
          return (
            <div key={i}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    flex: 1,
                    marginRight: '8px',
                    minWidth: 0,
                    wordBreak: 'break-word',
                  }}
                >
                  {item.language}
                </span>
                {displayLabel && (
                  <span
                    style={{ fontSize: '0.85em', opacity: 0.7, flexShrink: 0, textAlign: 'right' }}
                  >
                    {displayLabel}
                  </span>
                )}
              </div>
              <LevelBar value={item.level || 0} max={5} color={p.primary} type="discrete" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
