import { SidebarItem } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const SideReferencesSection = ({
  data: references,
  p,
}: LunarSharedProps<ResumeData['references']>) => (
  <>
    {references.map((ref, i) => (
      <SidebarItem key={i} p={p}>
        <div style={{ fontWeight: 600 }}>{ref.name}</div>
        {ref.reference && (
          <div
            style={{ fontStyle: 'italic', fontSize: '0.86em', opacity: 0.8, marginTop: '0.1em' }}
          >
            "{ref.reference}"
          </div>
        )}
      </SidebarItem>
    ))}
  </>
);
