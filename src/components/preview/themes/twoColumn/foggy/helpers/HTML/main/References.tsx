import { SectionHeader } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { Users } from 'lucide-react';

export const MainReferencesSection = ({
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
        padding: '24px',
      }}
    >
      <SectionHeader icon={<Users size={16} />} title={labels.references} p={p} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
        }}
      >
        {visibleReferences.map((ref, i) => (
          <div
            key={i}
            style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: `1px dashed ${p.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {ref.reference && (
              <p
                style={{
                  fontSize: '0.929em',
                  color: p.text,
                  fontStyle: 'italic',
                  margin: 0,
                  lineHeight: 1.6,
                  position: 'relative',
                }}
              >
                &ldquo;{ref.reference}&rdquo;
              </p>
            )}
            <div
              style={{
                fontSize: '0.82em',
                fontWeight: 700,
                color: p.primary,
                alignSelf: 'flex-end',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ width: '12px', height: '1px', backgroundColor: p.border }} />
              {ref.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
