import { type ResumeData, type VisibilitySection } from '@/types/resume';
import {
  customSectionDisplayTitle,
  customSectionToken,
  findCustomSection,
  isSectionKey,
} from '@/utils/layoutMetadata';

/**
 * The layout editors' row labels: the theme's section labels, plus each custom
 * section's own title under its token — `labels[token]` would otherwise
 * fall back to the raw `custom:<uuid>`.
 */
export const withCustomSectionLabels = (
  labels: Readonly<Record<string, string>>,
  data: Pick<ResumeData, 'customSections'>,
  untitled: string,
): Record<string, string> => ({
  ...labels,
  ...Object.fromEntries(
    data.customSections.map((section) => [
      customSectionToken(section.id),
      customSectionDisplayTitle(section, untitled),
    ]),
  ),
});

/**
 * What `toggleSectionVisibility` needs for a layout row — a built-in key or a
 * custom token — or `null` for an id that is neither.
 *
 * ⚠️ The `Array.isArray` check is not redundant after `isSectionKey`: being one
 * of the twelve does not make `resume[key]` an array at runtime.
 */
export const sectionVisibilityTarget = (
  sectionId: string,
  data: ResumeData,
): { section: VisibilitySection; items: Array<Record<string, unknown>> } | null => {
  if (isSectionKey(sectionId)) {
    const items = data[sectionId] as unknown;
    return Array.isArray(items) ? { section: sectionId, items } : null;
  }
  const custom = findCustomSection(data, sectionId);
  return custom ? { section: customSectionToken(custom.id), items: custom.items } : null;
};
