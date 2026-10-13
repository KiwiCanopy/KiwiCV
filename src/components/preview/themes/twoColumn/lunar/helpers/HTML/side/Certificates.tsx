import { SidebarItem } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const SideCertificatesSection = ({
  data: certificates,
  formatCVDate,
  p,
}: LunarSharedProps<ResumeData['certificates']>) => (
  <>
    {certificates.map((cert, i) => (
      <SidebarItem key={i} p={p}>
        {cert.date && (
          <div style={{ opacity: 0.7, fontSize: '0.86em', marginBottom: '0.1em' }}>
            {formatCVDate(cert.date)}
          </div>
        )}
        {cert.url ? (
          <a
            href={cert.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3em',
            }}
          >
            {cert.name} <ExternalLink size="0.9em" style={{ opacity: 0.5 }} />
          </a>
        ) : (
          <div style={{ fontWeight: 600 }}>{cert.name}</div>
        )}
        <div style={{ opacity: 0.7, fontSize: '0.86em', marginTop: '0.1em' }}>{cert.issuer}</div>
      </SidebarItem>
    ))}
  </>
);
