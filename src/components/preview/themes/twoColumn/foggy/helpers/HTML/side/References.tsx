import { SectionHeader } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Users } from 'lucide-react';

export const SideReferencesSection = ({
  data: visibleReferences,
  p,
  labels,
}: FoggySharedProps<ResumeData['references']>) => {
  if (!visibleReferences || visibleReferences.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: p.bgCard,
        border: `1px solid ${p.border}`,
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: '20px',
      }}
    >
      <SectionHeader icon={<Users size={14} />} title={labels.references} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {visibleReferences.map((ref, i) => (
          <div
            key={i}
            style={{
              padding: '12px',
              backgroundColor: p.bg,
              borderRadius: '8px',
              border: `1px dashed ${p.border}`,
              marginLeft: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {ref.reference && (
              <p
                style={{
                  fontSize: '0.857em',
                  color: p.text,
                  fontStyle: 'italic',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                &ldquo;{ref.reference.substring(0, 100)}...&rdquo;
              </p>
            )}
            <div
              style={{
                fontSize: '0.786em',
                fontWeight: 700,
                color: p.primary,
                alignSelf: 'flex-end',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ width: '10px', height: '1px', backgroundColor: p.border }} />
              {ref.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
