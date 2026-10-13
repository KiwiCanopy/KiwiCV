import { type ResumeStore } from '@/store/resume/types';
import { applySectionPlacement } from '@/store/resume/utils';
import { type ResumeData, type VisibilitySection } from '@/types/resume';
import { getSectionItemHash } from '@/utils/hash';
import { allLayoutSectionIds, layoutSectionItems } from '@/utils/layout/customSections';
import { type StateCreator } from 'zustand';

export interface VisibilitySlice {
  toggleItemVisibility: (section: VisibilitySection, item: Record<string, unknown>) => void;
  /**
   * ⚠️ `items` is **required**, and that is a decision rather than a
   * tightening. The store type and this one disagreed — required there,
   * optional here — and the two describe different behaviour, not different
   * strictness: unhiding a section without the array leaves that section's
   * individually-hidden item ids in `meta.content.hiddenIds`, so the section
   * comes back with some of its entries still missing. All five call sites pass
   * it. The runtime `Array.isArray` guard below stays, because the value is a
   * user-facing array reaching this from four different forms.
   */
  toggleSectionVisibility: (
    section: VisibilitySection,
    items: Array<Record<string, unknown>>,
  ) => void;
  cleanupHiddenIds: () => void;
}

/** The entries a visibility section holds; custom sections by token. */
const sectionItemsOf = (resume: ResumeData, section: VisibilitySection): unknown[] => {
  if (section === 'profiles') return resume.basics.profiles;
  if (section === 'basics:image') return [];
  return layoutSectionItems(section, resume);
};

export const createVisibilitySlice: StateCreator<
  ResumeStore,
  [['zustand/immer', never]],
  [],
  VisibilitySlice
> = (set, _get) => ({
  toggleItemVisibility: (section, item) => {
    const hash = getSectionItemHash(section, item);
    set((state) => {
      const content = state.resume.meta.content;
      if (!content.hiddenIds) content.hiddenIds = [];
      if (!content.hiddenSections) content.hiddenSections = [];

      const isSectionHidden = content.hiddenSections.includes(section as string);
      const isItemExplicitlyHidden = content.hiddenIds.includes(hash);
      const isEffectivelyHidden = isSectionHidden || isItemExplicitlyHidden;

      if (isEffectivelyHidden) {
        // Unhiding logic
        if (isItemExplicitlyHidden) {
          content.hiddenIds = content.hiddenIds.filter((id) => id !== hash);
        }

        if (isSectionHidden) {
          content.hiddenSections = content.hiddenSections.filter((s) => s !== section);

          const sectionItems = sectionItemsOf(state.resume, section);

          if (Array.isArray(sectionItems)) {
            const otherItemHashes = sectionItems
              .map((si) => getSectionItemHash(section, si as Record<string, unknown>))
              .filter((h) => h !== hash);

            const itemsToAdd = otherItemHashes.filter((h) => !content.hiddenIds.includes(h));
            content.hiddenIds.push(...itemsToAdd);
          }
        }
      } else {
        // Hiding logic
        if (!isItemExplicitlyHidden) {
          content.hiddenIds.push(hash);

          const sectionItems = sectionItemsOf(state.resume, section);

          if (Array.isArray(sectionItems) && sectionItems.length > 0) {
            const allNowHidden = sectionItems.every((si) => {
              const siHash = getSectionItemHash(section, si as Record<string, unknown>);
              return content.hiddenIds.includes(siHash);
            });

            if (allNowHidden) {
              content.hiddenSections.push(section as string);
            }
          }
        }
      }

      applySectionPlacement(state.resume, section);
    });
  },

  toggleSectionVisibility: (section, items) => {
    set((state) => {
      const content = state.resume.meta.content;
      if (!content.hiddenSections) content.hiddenSections = [];
      if (!content.hiddenIds) content.hiddenIds = [];

      const isHidden = content.hiddenSections.includes(section as string);

      if (isHidden) {
        // Unhiding section
        content.hiddenSections = content.hiddenSections.filter((s) => s !== section);
        if (items && Array.isArray(items)) {
          const itemHashes = items.map((item) => getSectionItemHash(section, item));
          content.hiddenIds = content.hiddenIds.filter((id) => !itemHashes.includes(id));
        }
      } else {
        // Hiding section
        content.hiddenSections.push(section as string);
        if (content.pageBreaks) {
          if (content.pageBreaks.oneColumn) {
            content.pageBreaks.oneColumn = content.pageBreaks.oneColumn.filter(
              (id) => id !== section,
            );
          }
          if (content.pageBreaks.twoColumn) {
            content.pageBreaks.twoColumn.main = (content.pageBreaks.twoColumn.main || []).filter(
              (id) => id !== section,
            );
            content.pageBreaks.twoColumn.sidebar = (
              content.pageBreaks.twoColumn.sidebar || []
            ).filter((id) => id !== section);
          }
        }
      }

      applySectionPlacement(state.resume, section);
    });
  },

  cleanupHiddenIds: () => {
    set((state) => {
      const validHashes = new Set<string>();

      // Driven from the canonical inventory rather than an inline copy. A
      // section missing from this walk contributes no valid hashes, so the
      // filter below would treat every hidden item in it as stale and drop the
      // id — silently unhiding the lot. Custom sections included.
      allLayoutSectionIds(state.resume).forEach((key) => {
        (layoutSectionItems(key, state.resume) as Array<Record<string, unknown>>).forEach(
          (item) => {
            validHashes.add(getSectionItemHash(key, item));
          },
        );
      });

      state.resume.basics.profiles.forEach((item: Record<string, unknown>) => {
        validHashes.add(getSectionItemHash('profiles', item));
      });

      const content = state.resume.meta.content;
      if (content.hiddenIds) {
        content.hiddenIds = content.hiddenIds.filter((id: string) => validHashes.has(id));
      }
    });
  },
});
