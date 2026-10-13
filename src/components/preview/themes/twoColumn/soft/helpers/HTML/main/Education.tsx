import { SectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import {
  educationHeading,
  educationSubheading,
} from '@/components/preview/themes/twoColumn/soft/helpers/shared/education';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink, GraduationCap } from 'lucide-react';

export const MainEducationSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
}: SoftSharedProps<ResumeData['education']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <SectionHeader title={labels.education || 'Education'} p={p} icon={GraduationCap} />

      {items.map((item, i) => (
        <div
          key={i}
          style={{
            paddingLeft: '12px',
            borderLeft: `2px solid ${p.border}`,
            marginLeft: '14px',
            marginBottom: i === items.length - 1 ? 0 : '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '4px',
              gap: '12px',
            }}
          >
            {/*
              ⚠️ The link matches `side/Education.tsx` and the serializer.
              This column rendered no `education.url` at all, and neither did the
              PDF — absent from both, which the parity sweep scores as agreement,
              so nothing was going to surface it. Eleven of the other themes link
              the education heading in both columns.
            */}
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <h4 style={{ fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>
                  {educationHeading(cvLocale, item)}
                </h4>
                <ExternalLink size={14} color={p.primary} />
              </a>
            ) : (
              <h4 style={{ fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>
                {educationHeading(cvLocale, item)}
              </h4>
            )}
            <span
              style={{
                fontSize: '0.8125rem',
                color: p.primary,
                backgroundColor: `${p.primary}12`,
                padding: '4px 10px',
                borderRadius: '8px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {formatCVDateRange(item.startDate, item.endDate)}
            </span>
          </div>

          <p
            style={{
              color: p.primary,
              fontWeight: 600,
              fontSize: '0.9375rem',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {[educationSubheading(cvLocale, item), item.location].filter(Boolean).join(' · ')}
          </p>

          {item.score && (
            <p
              style={{
                fontSize: '0.875rem',
                color: p.textMuted,
                margin: '4px 0 0 0',
                opacity: 0.9,
              }}
            >
              ø {item.score}
            </p>
          )}

          {item.courses && item.courses.length > 0 && (
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {item.courses.map((course, j) => (
                <span
                  key={j}
                  style={{
                    fontSize: '0.75rem',
                    color: p.textLight,
                    backgroundColor: p.bgLight,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${p.border}`,
                  }}
                >
                  {course}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
