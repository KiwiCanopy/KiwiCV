import {
  PlainEntry,
  SectionHeader,
} from '@/components/preview/themes/oneColumn/plain/helpers/shared/CommonHTML';
import type { PlainSharedProps } from '@/components/preview/themes/oneColumn/plain/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainReferencesSection = ({
  data: items,
  p,
  labels,
}: PlainSharedProps<ResumeData['references']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <section>
      <SectionHeader title={labels.references || ''} p={p} />
      {items.map((ref, i) => (
        <PlainEntry
          key={i}
          left={
            ref.reference && (
              <span style={{ color: p.textMuted, fontStyle: 'italic' }}>
                &ldquo;{ref.reference}&rdquo;
              </span>
            )
          }
        >
          <strong>{ref.name}</strong>
        </PlainEntry>
      ))}
    </section>
  );
};
