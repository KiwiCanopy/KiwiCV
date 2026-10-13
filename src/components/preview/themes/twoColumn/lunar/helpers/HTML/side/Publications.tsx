import { SidebarItem } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const SidePublicationsSection = ({
  data: publications,
  formatCVDate,
  p,
}: LunarSharedProps<ResumeData['publications']>) => (
  <>
    {publications.map((pub, i) => (
      <SidebarItem key={i} p={p}>
        {pub.releaseDate && (
          <div style={{ opacity: 0.7, fontSize: '0.86em', marginBottom: '0.1em' }}>
            {formatCVDate(pub.releaseDate)}
          </div>
        )}
        {pub.url ? (
          <a
            href={pub.url}
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
            {pub.name} <ExternalLink size="0.9em" style={{ opacity: 0.5 }} />
          </a>
        ) : (
          <div style={{ fontWeight: 600 }}>{pub.name}</div>
        )}
        <div style={{ opacity: 0.7, fontSize: '0.86em', marginTop: '0.1em' }}>{pub.publisher}</div>
      </SidebarItem>
    ))}
  </>
);
