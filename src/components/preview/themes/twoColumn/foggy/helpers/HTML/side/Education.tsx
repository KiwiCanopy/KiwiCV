import { SectionHeader } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink, GraduationCap } from 'lucide-react';

export const SideEducationSection = ({
  cvLocale,

  data: visibleEducation,
  p,
  labels,
  formatCVDateRange,
}: FoggySharedProps<ResumeData['education']>) => {
  if (!visibleEducation || visibleEducation.length === 0) return null;

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
      <SectionHeader icon={<GraduationCap size={14} />} title={labels.education} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {visibleEducation.map((edu, i) => (
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
              {formatCVDateRange(edu.startDate, edu.endDate)}
            </div>
            {edu.url ? (
              <a
                href={edu.url.startsWith('http') ? edu.url : `https://${edu.url}`}
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
                  {cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType}
                  {(cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area)
                    ? ` ${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area}`
                    : ''}
                </div>
                <ExternalLink
                  size={11}
                  style={{ color: p.primary, flexShrink: 0, marginTop: '2px' }}
                />
              </a>
            ) : (
              <div style={{ fontSize: '0.857em', fontWeight: 700, color: p.text, lineHeight: 1.3 }}>
                {cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType}
                {(cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area)
                  ? ` ${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area}`
                  : ''}
              </div>
            )}
            <div style={{ fontSize: '0.786em', color: p.textMuted }}>
              {cvLocale?.boldHeaderEducation === 'company'
                ? `${edu.studyType}${edu.area ? ` — ${edu.area}` : ''}`
                : edu.institution}
              {(cvLocale?.boldHeaderEducation === 'company'
                ? `${edu.studyType}${edu.area ? ` — ${edu.area}` : ''}`
                : edu.institution) && edu.location
                ? ' · '
                : ''}
              {edu.location}
            </div>
            {edu.score && (
              <div style={{ fontSize: '0.714em', color: p.textLight, marginTop: '2px' }}>
                ø {edu.score}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
