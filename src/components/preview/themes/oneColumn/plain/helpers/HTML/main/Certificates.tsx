import {
  PlainEntry,
  SectionHeader,
} from '@/components/preview/themes/oneColumn/plain/helpers/shared/CommonHTML';
import type { PlainSharedProps } from '@/components/preview/themes/oneColumn/plain/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainCertificatesSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: PlainSharedProps<ResumeData['certificates']>) => {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <SectionHeader title={labels.certificates || ''} p={p} />
      {items.map((cert, i) => (
        <PlainEntry
          key={i}
          left={
            cert.url ? (
              <a
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <strong>{cert.name}</strong>
                {cert.issuer && <span style={{ marginLeft: '4px' }}>{cert.issuer}</span>}
                <ExternalLink
                  size={12}
                  style={{ opacity: 0.5, marginLeft: '8px', flexShrink: 0 }}
                />
              </a>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <strong>{cert.name}</strong>
                {cert.issuer && <span style={{ marginLeft: '4px' }}>{cert.issuer}</span>}
              </span>
            )
          }
          right={formatCVDate(cert.date)}
        />
      ))}
    </section>
  );
};
