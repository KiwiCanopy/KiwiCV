import { getLanguageLabel, getLevelInfo } from '@/components/preview/themes/shared';
import { DiscreteLevelBar as LevelBar } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const SideLanguagesSection = ({
  data: languages,
  cvLocale,
  p,
}: LunarSharedProps<ResumeData['languages']>) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4em' }}>
    {languages.map((item, i) => {
      const { value, max } = getLevelInfo(item.level, 'language');
      const displayLabel = getLanguageLabel(item.level, item.certificate, cvLocale?.code);

      return (
        <div
          key={i}
          style={{
            borderBottom: `1px solid ${p?.sidebarBorder || 'rgba(255,255,255,0.05)'}`,
            paddingBottom: '0.8em',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '0.4em',
            }}
          >
            <span style={{ fontSize: '0.93em', fontWeight: 600, flex: 1, marginRight: '0.8em' }}>
              {item.language}
            </span>
            {displayLabel && (
              <span
                style={{
                  fontSize: '0.9em',
                  // ⚠️ Was `p.textLight`, which lunar declares in **none** of its
                  // seven palettes — so this rendered `color: undefined`, React
                  // dropped the property, and the level label inherited the
                  // full-strength sidebar text colour instead of a muted one
                  // `textLight` is the wrong field to add: every theme
                  // that declares it uses a **dark tone meant for a light
                  // background** — mostly mid-greys, but skyline's are red
                  // (`#b91c1c`) and green (`#047857`), so "mid-grey" would be a
                  // false universal. Lunar's sidebar is dark. `sidebarHeading` is lunar's own
                  // de-emphasised sidebar colour and is what the level bar in this
                  // very row already uses.
                  color: p?.sidebarHeading || 'rgba(255,255,255,0.7)',
                  fontStyle: 'italic',
                  flexShrink: 0,
                }}
              >
                {displayLabel}
              </span>
            )}
          </div>
          {value > 0 && (
            <LevelBar
              value={value}
              max={max}
              color={p?.sidebarHeading || 'rgba(255,255,255,0.7)'}
            />
          )}
        </div>
      );
    })}
  </div>
);
