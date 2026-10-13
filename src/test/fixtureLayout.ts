import type { ResumeData } from '@/types/resume';
import {
  getDefaultOneColumnLayout,
  getDefaultTwoColumnLayout,
  normalizeTwoColumnLayout,
} from '@/utils/layout/getters';
import { isTwoColumnTheme } from '@/utils/layout/predicates';

/**
 * Give a fixture the section placement a real user of `themeId` would have.
 *
 * The section order comes from the production getters, never a list written out
 * here: a hand-written order would be one more copy of the section inventory to
 * drift.
 *
 * ⚠️ **Load-bearing, and it bites silently.** A two-column serializer reads the
 * stored `twoColumn` order directly, so an empty one renders a document with no
 * sections at all — which compiles fine and asserts nothing. (The one-column
 * path is self-healing: `getEffectiveSectionOrder` falls back to the theme
 * default when the stored order is empty.) `initialResumeState` ships that
 * order empty and `migrateLayoutMetadata` does *not* fill it —
 * `validateLayoutMetadata` does not treat an empty order as an error, so a
 * theme switch keeps it. This mirrors `placeholder-fallback.ts:118-121`
 * instead, which is the production expression for "give me this theme's default
 * placement for the sections that have content".
 *
 * ⚠️ **Shared because the trap is, not to save lines.** `buildSingleItemResume`
 * hit it once and `buildRealExportResume` would have hit it again
 * independently — `examples/resume_4_0_1.json` ships
 * `twoColumn: { main: [], sidebar: [] }` on disk, so a fixture that loads a real
 * export and skips this renders six themes' worth of empty documents and looks
 * green doing it. A second hand-copied version of this block is a second chance
 * to omit it.
 */
export function applyThemeLayout(data: ResumeData, themeId: string): void {
  if (isTwoColumnTheme(themeId)) {
    const { main, sidebar } = normalizeTwoColumnLayout(
      getDefaultTwoColumnLayout(themeId),
      data,
      data.meta,
    );
    data.meta.content.order.twoColumn = {
      ...data.meta.content.order.twoColumn,
      main,
      sidebar,
    };
  } else {
    data.meta.content.order.oneColumn = getDefaultOneColumnLayout(themeId);
  }
}
