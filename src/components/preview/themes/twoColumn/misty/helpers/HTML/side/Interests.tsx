import { SectionHeader } from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const SideInterestsSection = ({
  data: items,
  p,
  labels,
}: MistySharedProps<ResumeData['interests']>) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <SectionHeader title={labels?.interests || ''} p={p} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {items.map((interest, i) => (
          <span
            key={i}
            style={{
              padding: '3px 10px',
              border: `1px solid ${p?.border}`,
              backgroundColor: p?.bgPage,
              color: p?.textMuted,
              borderRadius: '999px',
              fontSize: '0.786em',
            }}
          >
            {interest.name}
          </span>
        ))}
      </div>
    </div>
  );
};
