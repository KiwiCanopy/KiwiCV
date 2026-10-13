import type { LunarSharedProps } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

/**
 * ⚠️ **No `keywords` here, deliberately.** lunar's sidebar renders an
 * interest as its name and nothing else, which is what `serializeInterests`'
 * `isSide` branch emits — a row of `#lunar-side-badge(item.name)`. This
 * component used to render the keywords underneath as a second badge row, so a
 * user who kept interests in the sidebar saw keywords on screen and exported a
 * PDF without them (`previewExportParity.test.ts`).
 *
 * Resolved toward the sidebar's design rather than by teaching the serializer
 * keywords, because `skills` — lunar's other keyword-bearing section — already
 * settles it: `side/Skills.tsx` renders `skill.name` alone and the sidebar
 * serializer emits name plus a level bar, no keywords, and the two agree with no
 * mismatch on record. The sidebar is a compact list; keyword badges are a
 * main-column device, and `main/Interests.tsx` still renders them there.
 */
export const SideInterestsSection = ({
  data: interests,
}: LunarSharedProps<ResumeData['interests']>) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
    {interests.map((interest, i) => (
      <div key={i}>
        <div style={{ fontWeight: 600, fontSize: '0.92em', marginBottom: '0.4em' }}>
          {interest.name}
        </div>
      </div>
    ))}
  </div>
);
