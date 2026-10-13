import { SidebarItem } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const SideVolunteerSection = ({
  data: volunteer,
  formatCVDateRange,
  p,
}: LunarSharedProps<ResumeData['volunteer']>) => (
  <>
    {volunteer.map((vol, i) => (
      <SidebarItem key={i} p={p}>
        {formatCVDateRange(vol.startDate, vol.endDate) && (
          <div style={{ opacity: 0.7, fontSize: '0.86em', marginBottom: '0.1em' }}>
            {formatCVDateRange(vol.startDate, vol.endDate)}
          </div>
        )}
        {vol.url ? (
          <a
            href={vol.url}
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
            {vol.position} <ExternalLink size="0.9em" style={{ opacity: 0.5 }} />
          </a>
        ) : (
          <div style={{ fontWeight: 600 }}>{vol.position}</div>
        )}
        {(vol.organization || vol.location) && (
          <div style={{ opacity: 0.7, fontSize: '0.86em', marginTop: '0.1em' }}>
            {[vol.organization, vol.location].filter(Boolean).join(' · ')}
          </div>
        )}
      </SidebarItem>
    ))}
  </>
);
