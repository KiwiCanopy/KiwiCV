import {
  RenderLink,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const SideVolunteerSection = ({
  data: items,
  p,
  labels,
  formatCVDateRange,
}: MistySharedProps<ResumeData['volunteer']>) => {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <SectionHeader title={labels?.volunteer || ''} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((vol, i) => (
          <div key={i}>
            {(vol.startDate || vol.endDate) && (
              <div
                style={{
                  fontSize: '0.714em',
                  color: p?.primary,
                  fontWeight: 700,
                  marginBottom: '2px',
                }}
              >
                {formatCVDateRange(vol.startDate, vol.endDate)}
              </div>
            )}
            <div style={{ fontSize: '0.857em', fontWeight: 700, color: p?.text }}>
              <RenderLink url={vol.url} p={p}>
                {vol.position}
              </RenderLink>
            </div>
            {(vol.organization || vol.location) && (
              <div style={{ fontSize: '0.786em', color: p?.primary, fontWeight: 500 }}>
                {[vol.organization, vol.location].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
