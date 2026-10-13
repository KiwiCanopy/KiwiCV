import {
  SectionHeader,
  TimelineEntry,
} from '@/components/preview/themes/twoColumn/foggy/helpers/shared/CommonHTML';
import type { FoggySharedProps } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';
import { Folder } from 'lucide-react';

export const MainProjectsSection = ({
  data: visibleProjects,
  p,
  labels,
  label,
  icon,
  formatCVDateRange,
}: FoggySharedProps<ResumeData['projects']>) => {
  if (!visibleProjects || visibleProjects.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: p.bgCard,
        border: `1px solid ${p.border}`,
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: '28px 32px',
      }}
    >
      <SectionHeader icon={icon || <Folder size={16} />} title={label || labels.projects} p={p} />
      <div style={{ paddingLeft: '4px' }}>
        {visibleProjects.map((proj, i) => {
          const dateStr = formatCVDateRange(proj.startDate, proj.endDate);
          const isPresent = isOngoingEndDate(proj.endDate);
          return (
            <TimelineEntry
              key={i}
              title={proj.name}
              // ⚠️ `type` belongs in the main column's org line, which is
              // what the editor promises next to the field and what the main
              // serializer has always emitted here (`typst/experience.ts`,
              // `projectMeta`). This rendered `entity` alone, so the PDF carried
              // a project type the preview never showed.
              subtitle={[proj.entity, proj.type].filter(Boolean).join(' — ')}
              location={proj.location}
              date={dateStr}
              summary={proj.description}
              highlights={proj.highlights}
              url={proj.url}
              isPresent={isPresent}
              isLast={i === visibleProjects.length - 1}
              p={p}
            />
          );
        })}
      </div>
    </div>
  );
};
