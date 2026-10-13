import { ElegantSection } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/CommonHTML';
import type { ElegantSharedProps } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainInterestsSection = ({
  data: items,
  p,
  labels,
  cvLocale: _,
}: ElegantSharedProps<ResumeData['interests']>) => {
  if (!items || items.length === 0) return null;

  return (
    <ElegantSection title={labels.interests} p={p}>
      <div className="flex flex-col gap-5">
        {items.map((interest, i) => (
          <div key={i}>
            <div
              className="mb-2"
              style={{
                fontSize: '1.05em',
                fontWeight: 700,
                color: p.text,
                letterSpacing: '0.1px',
              }}
            >
              {interest.name}
            </div>
            {interest.keywords && interest.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {interest.keywords.map((kw, j) => (
                  <span
                    key={j}
                    className="rounded border px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: '#f7fafc',
                      borderColor: '#e2e8f0',
                      color: p.accent,
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </ElegantSection>
  );
};
