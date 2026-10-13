import { getLanguageLabel } from '@/components/preview/themes/shared';
import {
  GlassPanel,
  LevelBar,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import type { SkylineSharedProps } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Languages } from 'lucide-react';

export const SideLanguagesSection = ({
  data,
  p,
  labels,
  cvLocale,
}: SkylineSharedProps<ResumeData['languages']>) => {
  const items = data;
  if (!items?.length) return null;

  return (
    <GlassPanel p={p}>
      <SectionHeader icon={<Languages size={18} />} title={labels.languages} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((lang, i) => {
          const displayLabel = getLanguageLabel(lang.level, lang.certificate, cvLocale?.code);
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
                  {lang.language}
                </div>
                {displayLabel && (
                  <div style={{ fontSize: '0.85em', color: p.textMuted, flexShrink: 0 }}>
                    {displayLabel}
                  </div>
                )}
              </div>
              {lang.level !== undefined && lang.level > 0 && (
                <LevelBar value={lang.level} max={5} color={p.primary} />
              )}
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
};
