import { getLanguageLabel, getLevelInfo } from '@/components/preview/themes/shared';
import {
  LevelBar,
  Section,
} from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainLanguagesSection = ({
  data: languages,
  label,
  cvLocale,
  p,
}: LunarSharedProps<ResumeData['languages']>) => (
  <>
    {languages.map((lang: ResumeData['languages'][number], i: number) => {
      const { value, max } = getLevelInfo(lang.level, 'language');
      const displayLabel = getLanguageLabel(lang.level, lang.certificate, cvLocale?.code || 'en');

      return (
        <Section key={i} title={i === 0 ? label || '' : ''} p={p}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.4em',
            }}
          >
            <span style={{ fontWeight: 600, flex: 1, marginRight: '0.8em' }}>{lang.language}</span>
            {displayLabel && (
              <span
                style={{ fontSize: '0.93em', opacity: 0.7, fontStyle: 'italic', flexShrink: 0 }}
              >
                {displayLabel}
              </span>
            )}
          </div>
          {value > 0 && <LevelBar value={value} max={max} color={p?.primary} />}
        </Section>
      );
    })}
  </>
);
