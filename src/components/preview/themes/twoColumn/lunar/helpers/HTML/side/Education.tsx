import { SidebarItem } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink } from 'lucide-react';

export const SideEducationSection = ({
  cvLocale,

  data: education,
  formatCVDateRange,
  p,
}: LunarSharedProps<ResumeData['education']>) => (
  <>
    {education.map((edu, i) => (
      <SidebarItem key={i} p={p}>
        {formatCVDateRange(edu.startDate, edu.endDate) && (
          <div style={{ opacity: 0.7, fontSize: '0.86em', marginBottom: '0.1em' }}>
            {formatCVDateRange(edu.startDate, edu.endDate)}
          </div>
        )}
        {edu.url ? (
          <a
            href={edu.url}
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
            {cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType}
            {(cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area)
              ? ` — ${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area}`
              : ''}{' '}
            <ExternalLink size="0.9em" style={{ opacity: 0.5 }} />
          </a>
        ) : (
          <div style={{ fontWeight: 600 }}>
            {cvLocale?.boldHeaderEducation === 'company' ? edu.institution : edu.studyType}
            {(cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area)
              ? ` — ${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area}`
              : ''}
          </div>
        )}
        {((cvLocale?.boldHeaderEducation === 'company'
          ? `${edu.studyType}${edu.area ? ` — ${edu.area}` : ''}`
          : edu.institution) ||
          edu.location) && (
          <div style={{ opacity: 0.7, fontSize: '0.9em', marginTop: '0.1em' }}>
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
        {edu.score && <div style={{ fontSize: '0.86em', opacity: 0.8 }}>ø {edu.score}</div>}
      </SidebarItem>
    ))}
  </>
);
