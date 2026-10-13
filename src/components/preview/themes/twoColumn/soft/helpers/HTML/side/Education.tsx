import { SideSectionHeader } from '@/components/preview/themes/twoColumn/soft/helpers/shared/CommonHTML';
import {
  educationHeading,
  educationSubheading,
} from '@/components/preview/themes/twoColumn/soft/helpers/shared/education';
import type { SoftSharedProps } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { ExternalLink, GraduationCap } from 'lucide-react';

export const SideEducationSection = ({
  cvLocale,

  data: items,
  p,
  labels,
  formatCVDateRange,
}: SoftSharedProps<ResumeData['education']>) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div style={{ marginBottom: '12px' }}>
      <SideSectionHeader title={labels.education || 'Education'} p={p} icon={GraduationCap} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ width: '100%' }}>
            {item.startDate && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: p.primary,
                  fontWeight: 600,
                  margin: '0 0 2px 0',
                }}
              >
                {formatCVDateRange(item.startDate, item.endDate)}
              </p>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2px',
              }}
            >
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
                  <h5
                    style={{ fontWeight: 700, fontSize: '0.8125rem', margin: 0, color: p.textMain }}
                  >
                    {educationHeading(cvLocale, item)}
                  </h5>
                  <ExternalLink size={12} color={p.primary} />
                </a>
              ) : (
                <h5
                  style={{ fontWeight: 700, fontSize: '0.8125rem', margin: 0, color: p.textMain }}
                >
                  {educationHeading(cvLocale, item)}
                </h5>
              )}
            </div>
            {(educationSubheading(cvLocale, item) || item.location) && (
              <p style={{ color: p.textLight, fontSize: '0.75rem', margin: '1px 0' }}>
                {[educationSubheading(cvLocale, item), item.location].filter(Boolean).join(' · ')}
              </p>
            )}
            {/*
              ⚠️ The score line matches `main/Education.tsx`, and its absence was
              one of the parity sweep's `export-only` rows: the serializer has always put
              `score` in this entry's detail line, in *both* columns. Seventeen of
              the sweep's eighteen runs render it in both outputs — soft's sidebar
              preview was the only one that did not, so a user's grade was in the
              PDF and not on screen. `SIDE_OVERRIDES.education` blanks only
              `courses`, and `EducationForm.tsx` badges only `courses`
              main-column-only, so nothing claimed the sidebar should drop this.
            */}
            {item.score && (
              <p style={{ color: p.textLight, fontSize: '0.75rem', margin: '1px 0', opacity: 0.9 }}>
                ø {item.score}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
