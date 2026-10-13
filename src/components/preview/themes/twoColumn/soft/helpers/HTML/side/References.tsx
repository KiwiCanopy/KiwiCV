import { SideSectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { MessagesSquare } from 'lucide-react';

export const SideReferencesSection = ({
  data: items,
  p,
  labels,
}: SoftSharedProps<ResumeData['references']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '12px' }}>
      <SideSectionHeader title={labels.references || 'References'} p={p} icon={MessagesSquare} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: p.bgSoft || p.bgLight,
              border: `1px solid ${p.border}`,
              width: '100%',
            }}
          >
            <p
              style={{
                fontSize: '0.8125rem',
                color: p.textMain,
                lineHeight: 1.5,
                margin: 0,
                fontStyle: 'italic',
              }}
            >
              "{item.reference}"
            </p>
            <p
              style={{
                fontWeight: 600,
                fontSize: '0.75rem',
                marginTop: '6px',
                margin: 0,
                color: p.textMuted,
                textAlign: 'right',
              }}
            >
              — {item.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
