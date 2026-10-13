import {
  Entry,
  SectionHeader,
} from '@/components/preview/themes/oneColumn/plain2/helpers/shared/CommonHTML';
import type { Plain2SharedProps } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainVolunteerSection = ({
  data: items,
  p,
  labels,
  formatCVDateRange,
  label,
}: Plain2SharedProps<ResumeData['volunteer']>) => {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <SectionHeader title={label || labels.volunteer} p={p} />
      {items.map((vol: ResumeData['volunteer'][number], i: number) => (
        <Entry
          key={i}
          title={vol.position}
          subtitle={[vol.organization, vol.location].filter(Boolean).join(' · ')}
          date={formatCVDateRange(vol.startDate, vol.endDate)}
          url={vol.url}
          p={p}
        >
          {vol.summary && (
            <p style={{ margin: '4px 0', fontSize: '0.929em', color: p.textMain }}>{vol.summary}</p>
          )}
          {vol.highlights && vol.highlights.length > 0 && (
            <ul
              style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '0.929em',
                color: p.textMain,
                listStyleType: 'disc',
                listStylePosition: 'outside',
              }}
            >
              {vol.highlights.map((h: string, j: number) => (
                <li key={j} style={{ marginBottom: '3px' }}>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </Entry>
      ))}
    </section>
  );
};
