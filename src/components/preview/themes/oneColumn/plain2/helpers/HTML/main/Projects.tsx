import {
  Entry,
  SectionHeader,
} from '@/components/preview/themes/oneColumn/plain2/helpers/shared/CommonHTML';
import type { Plain2SharedProps } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const MainProjectsSection = ({
  data: items,
  p,
  labels,
  formatCVDateRange,
  label,
}: Plain2SharedProps<ResumeData['projects']>) => {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <SectionHeader title={label || labels.projects} p={p} />
      {items.map((proj: ResumeData['projects'][number], i: number) => (
        <Entry
          key={i}
          title={proj.name}
          subtitle={
            [[proj.entity, proj.type].filter(Boolean).join(' — '), proj.location]
              .filter(Boolean)
              .join(' · ') || undefined
          }
          date={formatCVDateRange(proj.startDate, proj.endDate)}
          url={proj.url}
          p={p}
        >
          {proj.description && (
            <p style={{ margin: '4px 0 8px', fontSize: '0.929em', color: p.textMain }}>
              {proj.description}
            </p>
          )}
          {proj.highlights.length > 0 && (
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
              {proj.highlights.map((h: string, j: number) => (
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
