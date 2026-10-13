import type { ResumeData } from '@/types/resume';
import type { SectionKey } from '@/utils/layout/constants';
import {
  type LayoutSectionId,
  findCustomSection,
  isCustomSectionToken,
} from '@/utils/layout/customSections';
import { visibleCustomSectionItems } from '@/utils/visibility';

/**
 * Custom sections render through each theme's own volunteer renderer, in
 * both columns and both outputs, so they look native without per-theme design.
 * This module is the one place that maps a custom section onto that shape:
 * `position` carries the entry's name, `organization` stays empty.
 */

export type VolunteerShapedItem = ResumeData['volunteer'][number];

export interface CustomSectionView {
  /** Never blank: an untitled section takes the CV-language `customSection` label. */
  title: string;
  items: VolunteerShapedItem[];
}

/** Lucide `LayoutList`: the Typst icon a custom section's header uses in place of a volunteer glyph. */
export const CUSTOM_SECTION_TYPST_ICON = 'layout-list';

/** The section's visible entries in the volunteer shape, or `null` when nothing renders. */
export function customSectionView(data: ResumeData, token: string): CustomSectionView | null {
  const section = findCustomSection(data, token);
  if (!section || !isCustomSectionToken(token)) return null;

  const hiddenIds = data.meta?.content?.hiddenIds ?? [];
  const hiddenSections = data.meta?.content?.hiddenSections ?? [];
  const items = visibleCustomSectionItems(section, hiddenIds, hiddenSections).map((item) => ({
    organization: '',
    position: item.name,
    location: '',
    url: item.url,
    startDate: item.startDate,
    endDate: item.endDate,
    summary: item.summary,
    highlights: item.highlights,
    _vId: item._vId,
  }));

  return items.length > 0 ? { title: section.title.trim(), items } : null;
}

/**
 * What a theme renders for one layout entry: the section key whose renderer to
 * use, and the `v`/`labels` to hand it. A built-in key passes through; a
 * custom-section token becomes the theme's `volunteer` renderer fed this
 * section's entries and title. `null` when the entry renders nothing.
 *
 * Every theme's HTML registry lookup and Typst `serializeSection` goes through
 * this, so a custom section can only ever render the way the other eleven
 * themes render it.
 */
export function resolveLayoutSection<
  V extends { volunteer: VolunteerShapedItem[] },
  L extends Record<string, string>,
>(
  sectionId: LayoutSectionId,
  data: ResumeData,
  context: { v: V; labels: L },
): { key: SectionKey; v: V; labels: L; isCustom: boolean } | null {
  if (!isCustomSectionToken(sectionId)) {
    return { key: sectionId, v: context.v, labels: context.labels, isCustom: false };
  }
  const view = customSectionView(data, sectionId);
  if (!view) return null;
  // A blank title must not fall through to a theme's `labels.volunteer || 'volunteer'`.
  const title =
    view.title || (context.labels as Record<string, string>).customSection || 'Additional details';
  return {
    key: 'volunteer',
    v: { ...context.v, volunteer: view.items },
    labels: { ...context.labels, volunteer: title },
    // Themes whose volunteer header carries a heart swap it for this neutral one.
    isCustom: true,
  };
}
