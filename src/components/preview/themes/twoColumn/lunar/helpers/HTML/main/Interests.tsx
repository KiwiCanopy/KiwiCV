import { Section } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainInterestsSection = ({
  data: interests,
  label,
  p,
}: LunarSharedProps<ResumeData['interests']>) => {
  if (!interests || interests.length === 0) return null;

  return (
    <>
      {interests.map((interest: ResumeData['interests'][number], i: number) => (
        <Section key={i} title={i === 0 ? label || '' : ''} p={p}>
          <div style={{ fontWeight: 600, marginBottom: '0.4em' }}>{interest.name}</div>
          {interest.keywords && interest.keywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5em', marginBottom: '0.8em' }}>
              {interest.keywords.map((kw, j) => (
                <span
                  key={j}
                  style={{
                    fontSize: '0.86em',
                    padding: '0.2em 0.8em',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    color: p?.textMuted || '#444',
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </Section>
      ))}
    </>
  );
};
