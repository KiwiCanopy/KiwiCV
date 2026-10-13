import { type ResumeStore } from '@/store/resume/types';
import { sanitizePageBreaks } from '@/store/resume/utils';
import { type CustomSectionItem } from '@/types/resume';
import { isItemKeyOf, sectionTarget } from '@/utils/aiTarget';
import { createCustomSection } from '@/utils/items';
import { customSectionToken } from '@/utils/layoutMetadata';
import { type StateCreator } from 'zustand';

export interface CustomSectionsSlice {
  /** Adds an empty section at the end of the layout; returns its id. */
  addCustomSection: (title: string) => string;
  /** Removes the section and every layout reference to its token. */
  removeCustomSection: (id: string) => void;
  renameCustomSection: (id: string, title: string) => void;
  /** Replaces the entries through `setResume`, so they are sanitized like any section's. */
  setCustomSectionItems: (id: string, items: CustomSectionItem[]) => void;
}

const without = (list: string[] | undefined, token: string) =>
  (list ?? []).filter((entry) => entry !== token);

export const createCustomSectionsSlice: StateCreator<
  ResumeStore,
  [['zustand/immer', never]],
  [],
  CustomSectionsSlice
> = (set, get) => ({
  addCustomSection: (title) => {
    const section = createCustomSection(title);
    const token = customSectionToken(section.id);
    set((state) => {
      state.resume.customSections.push(section);
      const order = state.resume.meta.content.order;
      // An empty order means "theme default", which appends custom sections on
      // its own; only an explicit one needs the token. A lone token in an empty
      // two-column order would read as a complete layout on a theme switch.
      if (order.oneColumn.length > 0) order.oneColumn.push(token);
      if (order.twoColumn.main.length + order.twoColumn.sidebar.length > 0) {
        order.twoColumn.main.push(token);
      }
    });
    return section.id;
  },

  removeCustomSection: (id) =>
    set((state) => {
      const token = customSectionToken(id);
      const { content, theme } = state.resume.meta;
      state.resume.customSections = state.resume.customSections.filter((s) => s.id !== id);
      content.order.oneColumn = without(content.order.oneColumn, token);
      content.order.twoColumn.main = without(content.order.twoColumn.main, token);
      content.order.twoColumn.sidebar = without(content.order.twoColumn.sidebar, token);
      content.hiddenSections = without(content.hiddenSections, token);
      content.hiddenIds = (content.hiddenIds ?? []).filter((hash) => !hash.startsWith(`${token}:`));
      if (theme.params.sectionLabels) delete theme.params.sectionLabels[token];
      const breaks = content.pageBreaks;
      if (breaks) {
        breaks.oneColumn = without(breaks.oneColumn, token);
        if (breaks.twoColumn) {
          breaks.twoColumn.main = without(breaks.twoColumn.main, token);
          breaks.twoColumn.sidebar = without(breaks.twoColumn.sidebar, token);
        }
      }
      content.pageBreaks = sanitizePageBreaks(state.resume);
      // Its AI proposals too: with the section gone, no Discard can reach them.
      delete state.ai.suggestions[sectionTarget(token)];
      Object.keys(state.ai.suggestions).forEach((key) => {
        if (isItemKeyOf(key, token)) delete state.ai.suggestions[key];
      });
    }),

  renameCustomSection: (id, title) =>
    set((state) => {
      const section = state.resume.customSections.find((s) => s.id === id);
      if (section) section.title = title;
    }),

  setCustomSectionItems: (id, items) => {
    const resume = get().resume;
    get().setResume(
      {
        ...resume,
        customSections: resume.customSections.map((s) => (s.id === id ? { ...s, items } : s)),
      },
      { silent: true },
    );
  },
});
