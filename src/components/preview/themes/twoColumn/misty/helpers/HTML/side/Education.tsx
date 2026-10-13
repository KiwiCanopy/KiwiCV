import {
  RenderLink,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const SideEducationSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
}: MistySharedProps<ResumeData['education']>) => {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <SectionHeader title={labels?.education || ''} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {items.map((edu, i) => (
          <div key={i}>
            <div
              style={{
                fontSize: '0.714em',
                fontWeight: 700,
                color: p?.primary,
                marginBottom: '2px',
              }}
            >
              {formatCVDateRange(edu.startDate, edu.endDate)}
            </div>
            <div style={{ fontSize: '0.857em', fontWeight: 700, color: p?.text, lineHeight: 1.3 }}>
              <RenderLink url={edu.url} p={p}>
                {cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType}
                {(cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area)
                  ? ` ${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area}`
                  : ''}
              </RenderLink>
            </div>
            {((cvLocale?.boldHeaderEducation === 'company'
              ? `${edu.studyType}${edu.area ? ` — ${edu.area}` : ''}`
              : edu.institution) ||
              edu.location) && (
              <div style={{ fontSize: '0.786em', color: p?.textMuted }}>
                {[
                  cvLocale?.boldHeaderEducation === 'company'
                    ? `${edu.studyType}${edu.area ? ` — ${edu.area}` : ''}`
                    : edu.institution,
                  edu.location,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            )}
            {edu.score && (
              <div style={{ fontSize: '0.714em', color: p?.textMuted, marginTop: '2px' }}>
                ø {edu.score}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
