import {
  Badge,
  MistySection,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainInterestsSection = ({
  data: items,
  p,
  labels,
}: MistySharedProps<ResumeData['interests']>) => {
  if (!items || items.length === 0) return null;
  return (
    <MistySection title={labels?.interests || ''} p={p}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '4px' }}>
        {items.map((interest, i) => (
          <div
            key={i}
            style={{
              padding: '10px 14px',
              border: `1px solid ${p?.border}`,
              backgroundColor: p?.bgPage,
              borderRadius: '8px',
              fontSize: '0.85em',
            }}
          >
            <div style={{ fontWeight: 700, color: p.primary, marginBottom: '6px' }}>
              {interest.name}
            </div>
            {interest.keywords && interest.keywords.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {interest.keywords.map((kw, j) => (
                  <Badge key={j} p={p}>
                    {kw}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </MistySection>
  );
};
