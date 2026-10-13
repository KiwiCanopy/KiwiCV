import type { CustomSection, ResumeData, ResumeMeta } from '@/types/resume';
import { ALL_SECTION_KEYS, type SectionKey } from '@/utils/layout/constants';
import { isSectionKey } from '@/utils/layout/predicates';

/**
 * How the layout (`meta.content.order`, `hiddenSections`, `pageBreaks`,
 * `sectionLabels`) refers to a user-defined section: `custom:<id>`. The
 * prefix tells a custom section from a built-in one without the resume, and keeps
 * the exported `customSections[].id` a bare UUID.
 */
export const CUSTOM_SECTION_PREFIX = 'custom:';

export type CustomSectionToken = `${typeof CUSTOM_SECTION_PREFIX}${string}`;

/** A section the layout can place: a built-in key or a custom-section token. */
export type LayoutSectionId = SectionKey | CustomSectionToken;

export const customSectionToken = (id: string): CustomSectionToken =>
  `${CUSTOM_SECTION_PREFIX}${id}`;

export const isCustomSectionToken = (key: string): key is CustomSectionToken =>
  key.startsWith(CUSTOM_SECTION_PREFIX) && key.length > CUSTOM_SECTION_PREFIX.length;

export const findCustomSection = (
  data: Pick<ResumeData, 'customSections'>,
  token: string,
): CustomSection | undefined =>
  isCustomSectionToken(token)
    ? (data.customSections ?? []).find((section) => customSectionToken(section.id) === token)
    : undefined;

/** Built-in keys, then one token per custom section, in `customSections` order. */
export const allLayoutSectionIds = (
  data: Pick<ResumeData, 'customSections'>,
): LayoutSectionId[] => [
  ...ALL_SECTION_KEYS,
  ...(data.customSections ?? []).map((section) => customSectionToken(section.id)),
];

/** A built-in key, or the token of a custom section this resume has. */
export const isLayoutSectionId = (
  key: string,
  data: Pick<ResumeData, 'customSections'>,
): key is LayoutSectionId => isSectionKey(key) || !!findCustomSection(data, key);

/** The entries a layout id holds: a built-in section's array or a custom section's items. */
export const layoutSectionItems = (key: string, data: ResumeData): unknown[] => {
  if (isSectionKey(key)) {
    const items = data[key];
    return Array.isArray(items) ? items : [];
  }
  return findCustomSection(data, key)?.items ?? [];
};

/** The section has entries to render (hidden or not). */
export const layoutSectionExists = (key: string, data: ResumeData): boolean =>
  layoutSectionItems(key, data).length > 0;

/** A custom section's title as the editor shows it; `untitled` when blank. */
export const customSectionDisplayTitle = (section: CustomSection, untitled: string): string =>
  section.title.trim() || untitled;

export const layoutSectionRenderable = (key: string, data: ResumeData, meta: ResumeMeta): boolean =>
  layoutSectionExists(key, data) && !meta.content.hiddenSections?.includes(key);
