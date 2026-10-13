import { SidebarItem } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const SideAwardsSection = ({
  data: awards,
  formatCVDate,
  p,
}: LunarSharedProps<ResumeData['awards']>) => (
  <>
    {awards.map((award, i) => (
      <SidebarItem key={i} p={p}>
        {award.date && (
          <div style={{ opacity: 0.7, fontSize: '0.86em', marginBottom: '0.1em' }}>
            {formatCVDate(award.date)}
          </div>
        )}
        {award.url ? (
          <a
            href={award.url}
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
            {award.title} <ExternalLink size="0.9em" style={{ opacity: 0.5 }} />
          </a>
        ) : (
          <div style={{ fontWeight: 600 }}>{award.title}</div>
        )}
        {(award.awarder || award.location) && (
          <div style={{ opacity: 0.7, fontSize: '0.86em', marginTop: '0.1em' }}>
            {[award.awarder, award.location].filter(Boolean).join(' · ')}
          </div>
        )}
      </SidebarItem>
    ))}
  </>
);
