import {
  Entry,
  Section,
} from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const MainCertificatesSection = ({
  data: certificates,
  label,
  formatCVDate,
  p,
}: LunarSharedProps<ResumeData['certificates']>) => (
  <>
    {certificates.map((cert: ResumeData['certificates'][number], i: number) => (
      <Section key={i} title={i === 0 ? label || '' : ''} p={p}>
        <Entry
          title={
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
                  gap: '0.3em',
                }}
              >
                {cert.name} <ExternalLink size="1em" style={{ opacity: 0.5 }} />
              </a>
            ) : (
              cert.name
            )
          }
          subtitle={cert.issuer}
          date={formatCVDate(cert.date)}
          p={p}
        />
      </Section>
    ))}
  </>
);
