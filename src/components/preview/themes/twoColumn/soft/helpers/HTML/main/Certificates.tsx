import { SectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink, Sparkles } from 'lucide-react';

export const MainCertificatesSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: SoftSharedProps<ResumeData['certificates']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <SectionHeader title={labels.certificates || 'Certificates'} p={p} icon={Sparkles} />

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
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '4px',
              gap: '12px',
            }}
          >
            <div>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <h4 style={{ fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>{item.name}</h4>
                  <ExternalLink size={14} color={p.primary} />
                </a>
              ) : (
                <h4 style={{ fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>{item.name}</h4>
              )}
              <p
                style={{
                  color: p.primary,
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  margin: '2px 0 0 0',
                }}
              >
                {item.issuer}
              </p>
            </div>
            {item.date && (
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: p.primary,
                  backgroundColor: `${p.primary}12`,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {formatCVDate(item.date)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
