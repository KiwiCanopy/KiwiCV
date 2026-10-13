import { SectionHeader } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink, Heart, LayoutList } from 'lucide-react';

export const SideVolunteerSection = ({
  isCustomSection,
  data: visibleVolunteer,
  p,
  labels,
  formatCVDateRange,
}: FoggySharedProps<ResumeData['volunteer']>) => {
  if (!visibleVolunteer || visibleVolunteer.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: p.bgCard,
        border: `1px solid ${p.border}`,
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: '20px',
      }}
    >
      <SectionHeader
        icon={isCustomSection ? <LayoutList size={14} /> : <Heart size={14} />}
        title={labels.volunteer}
        p={p}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {visibleVolunteer.map((vol, i) => (
          <div
            key={i}
            style={{
              backgroundColor: p.bg,
              border: `1px solid ${p.border}`,
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px',
            }}
          >
            <div
              style={{
                fontSize: '0.714em',
                color: p.primary,
                backgroundColor: p.primaryVeryLight,
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 600,
                display: 'inline-block',
                marginBottom: '6px',
              }}
            >
              {formatCVDateRange(vol.startDate, vol.endDate)}
            </div>
            {vol.url ? (
              <a
                href={vol.url.startsWith('http') ? vol.url : `https://${vol.url}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'flex-start',
                  gap: '4px',
                }}
              >
                <div
                  style={{ fontSize: '0.857em', fontWeight: 700, color: p.text, lineHeight: 1.3 }}
                >
                  {vol.position}
                </div>
                <ExternalLink
                  size={11}
                  style={{ color: p.primary, flexShrink: 0, marginTop: '2px' }}
                />
              </a>
            ) : (
              <div style={{ fontSize: '0.857em', fontWeight: 700, color: p.text, lineHeight: 1.3 }}>
                {vol.position}
              </div>
            )}
            <div style={{ fontSize: '0.786em', color: p.textMuted }}>
              {vol.organization}
              {vol.organization && vol.location ? ' · ' : ''}
              {vol.location}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
