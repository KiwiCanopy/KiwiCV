import { SectionHeader } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/CommonHTML';
import {
  FONT_MONO,
  FONT_SANS,
} from '@/components/preview/themes/oneColumn/javascript/helpers/shared/constants';
import type { JavaScriptSharedProps } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/types';
import { getSectionItemHash } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';
import { ExternalLink } from 'lucide-react';

export const MainEducationSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
}: JavaScriptSharedProps<ResumeData['education']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <section style={{ marginBottom: '32px', fontFamily: FONT_SANS }}>
      <SectionHeader title={labels.education || 'Education'} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((edu) => (
          <div
            key={getSectionItemHash('education', edu)}
            style={{
              paddingLeft: '24px',
              paddingBottom: edu === items[items.length - 1] ? '0' : '24px',
              borderLeft: edu === items[items.length - 1] ? 'none' : `1px solid ${p.slate200}`,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '-5.5px',
                top: '6px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isOngoingEndDate(edu.endDate) ? p.primary : p.slate300,
                border: `3px solid ${p.paper}`,
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '8px',
                gap: '12px',
              }}
            >
              <h3
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '1em',
                  fontWeight: 700,
                  margin: 0,
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {edu.url ? (
                  <a
                    href={edu.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ color: isOngoingEndDate(edu.endDate) ? p.primary : p.slate900 }}>
                      {cvLocale?.boldHeaderEducation === 'company'
                        ? edu.institution
                        : edu.studyType}
                      {(cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area) &&
                        ` (${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area})`}
                    </span>
                    <span style={{ color: p.slate300 }}>.</span>
                    <span style={{ color: p.entity }}>
                      {(cvLocale?.boldHeaderEducation === 'company'
                        ? `${edu.studyType}${edu.area ? ` — ${edu.area}` : ''}`
                        : edu.institution) || 'Institution'}
                    </span>
                    <span style={{ color: p.slate300 }}>()</span>
                    {edu.location && (
                      <span style={{ color: p.slate400, fontSize: '0.9em' }}>
                        {' · '}
                        {edu.location}
                      </span>
                    )}
                    <ExternalLink
                      size={12}
                      style={{ color: p.entity, opacity: 0.6, flexShrink: 0 }}
                    />
                  </a>
                ) : (
                  <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ color: isOngoingEndDate(edu.endDate) ? p.primary : p.slate900 }}>
                      {cvLocale?.boldHeaderEducation === 'company'
                        ? edu.institution
                        : edu.studyType}
                      {(cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area) &&
                        ` (${cvLocale?.boldHeaderEducation === 'company' ? '' : edu.area})`}
                    </span>
                    <span style={{ color: p.slate300 }}>.</span>
                    <span style={{ color: p.entity }}>
                      {(cvLocale?.boldHeaderEducation === 'company'
                        ? `${edu.studyType}${edu.area ? ` — ${edu.area}` : ''}`
                        : edu.institution) || 'Institution'}
                    </span>
                    <span style={{ color: p.slate300 }}>()</span>
                    {edu.location && (
                      <span style={{ color: p.slate400, fontSize: '0.9em' }}>
                        {' · '}
                        {edu.location}
                      </span>
                    )}
                  </span>
                )}
              </h3>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '0.75em',
                  color: p.slate500,
                  backgroundColor: p.slate100,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatCVDateRange(edu.startDate, edu.endDate)}
              </span>
            </div>

            <div
              style={{
                backgroundColor: p.slate50,
                padding: '16px',
                borderRadius: '8px',
                border: `1px solid ${p.slate100}`,
              }}
            >
              {edu.score && (
                <div
                  style={{
                    color: p.comment,
                    opacity: 0.8,
                    marginBottom: '8px',
                    fontFamily: FONT_MONO,
                    fontSize: '0.85em',
                  }}
                >
                  {`// ø ${edu.score}`}
                </div>
              )}
              {edu.courses && edu.courses.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    fontFamily: FONT_MONO,
                    marginTop: '4px',
                  }}
                >
                  {edu.courses.map((c, j) => (
                    <span
                      key={j}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: p.paper,
                        borderRadius: '4px',
                        fontSize: '0.7em',
                        color: p.slate600,
                        border: `1px solid ${p.slate200}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 600,
                      }}
                    >
                      <span
                        style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          backgroundColor: p.slate300,
                        }}
                      />
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
