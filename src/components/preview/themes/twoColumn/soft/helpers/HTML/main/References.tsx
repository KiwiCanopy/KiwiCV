import { SectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { MessagesSquare } from 'lucide-react';

export const MainReferencesSection = ({
  data: items,
  p,
  labels,
}: SoftSharedProps<ResumeData['references']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <SectionHeader title={labels.references || 'References'} p={p} icon={MessagesSquare} />

      {items.map((item, i) => (
        <div
          key={i}
          style={{
            paddingLeft: '12px',
            borderLeft: `2px solid ${p.border}`,
            marginLeft: '14px',
            marginBottom: i === items.length - 1 ? 0 : '24px',
          }}
        >
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: p.bgSoft || p.bgLight,
              border: `1px solid ${p.border}`,
              fontStyle: 'italic',
              width: '100%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
          >
            <p
              style={{
                fontSize: '0.8125rem',
                color: p.textMuted,
                lineHeight: 1.5,
                margin: '0 0 8px 0',
              }}
            >
              "{item.reference}"
            </p>
            <p
              style={{
                fontWeight: 700,
                fontSize: '0.875rem',
                fontStyle: 'normal',
                margin: 0,
                color: p.textMain,
              }}
            >
              {item.name}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
