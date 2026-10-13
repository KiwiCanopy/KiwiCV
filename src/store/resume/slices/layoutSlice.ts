import { type ResumeStore } from '@/store/resume/types';
import { sanitizePageBreaks } from '@/store/resume/utils';
import {
  getDefaultTwoColumnLayout,
  isTwoColumnTheme,
  normalizeTwoColumnLayout,
} from '@/utils/layoutMetadata';
import { type StateCreator } from 'zustand';

export interface LayoutSlice {
  moveToMain: (section: string) => void;
  moveToSide: (section: string) => void;
  setMainSections: (sections: string[]) => void;
  setSideSections: (sections: string[]) => void;
  setTwoColumnLayout: (main: string[], sidebar: string[]) => void;
  setSidebarPosition: (position: 'left' | 'right') => void;
  resetLayoutToDefaults: () => void;
  togglePageBreak: (layout: 'oneColumn' | 'main' | 'sidebar', sectionId: string) => void;
}

export const createLayoutSlice: StateCreator<
  ResumeStore,
  [['zustand/immer', never]],
  [],
  LayoutSlice
> = (set, _get) => ({
  moveToMain: (section: string) => {
    set((state) => {
      const order = state.resume.meta.content.order;
      if (!order.twoColumn) {
        order.twoColumn = { main: [], sidebar: [] };
      }

      const main = order.twoColumn.main;
      const sidebar = order.twoColumn.sidebar;

      const sideIndex = sidebar.indexOf(section);
      if (sideIndex > -1) {
        sidebar.splice(sideIndex, 1);
      }
      if (!main.includes(section)) {
        main.push(section);
      }

      state.resume.meta.content.pageBreaks = sanitizePageBreaks(state.resume);
    });
  },

  moveToSide: (section: string) => {
    set((state) => {
      const order = state.resume.meta.content.order;
      if (!order.twoColumn) {
        order.twoColumn = { main: [], sidebar: [] };
      }

      const main = order.twoColumn.main;
      const sidebar = order.twoColumn.sidebar;

      const mainIndex = main.indexOf(section);
      if (mainIndex > -1) {
        main.splice(mainIndex, 1);
      }
      if (!sidebar.includes(section)) {
        sidebar.push(section);
      }

      state.resume.meta.content.pageBreaks = sanitizePageBreaks(state.resume);
    });
  },

  setMainSections: (sections) => {
    set((state) => {
      if (!state.resume.meta.content.order.twoColumn) {
        state.resume.meta.content.order.twoColumn = { main: [], sidebar: [] };
      }
      state.resume.meta.content.order.twoColumn.main = sections;
      state.resume.meta.content.pageBreaks = sanitizePageBreaks(state.resume);
    });
  },

  setSideSections: (sections) => {
    set((state) => {
      if (!state.resume.meta.content.order.twoColumn) {
        state.resume.meta.content.order.twoColumn = { main: [], sidebar: [] };
      }
      state.resume.meta.content.order.twoColumn.sidebar = sections;
      state.resume.meta.content.pageBreaks = sanitizePageBreaks(state.resume);
    });
  },

  setTwoColumnLayout: (main, sidebar) => {
    set((state) => {
      if (!state.resume.meta.content.order.twoColumn) {
        state.resume.meta.content.order.twoColumn = { main: [], sidebar: [] };
      }
      state.resume.meta.content.order.twoColumn.main = main;
      state.resume.meta.content.order.twoColumn.sidebar = sidebar;
      state.resume.meta.content.pageBreaks = sanitizePageBreaks(state.resume);
    });
  },

  setSidebarPosition: (position) => {
    set((state) => {
      if (!state.resume.meta.content.order.twoColumn) {
        state.resume.meta.content.order.twoColumn = { main: [], sidebar: [] };
      }
      state.resume.meta.content.order.twoColumn.sidebarPosition = position;
    });
  },

  resetLayoutToDefaults: () => {
    set((state) => {
      const themeName = state.resume.meta.theme.name;
      const isTwoCol = isTwoColumnTheme(themeName);

      if (isTwoCol) {
        const defaults = getDefaultTwoColumnLayout(themeName);
        const normalized = normalizeTwoColumnLayout(defaults, state.resume, state.resume.meta);

        Object.assign(state.resume.meta.content.order.twoColumn, normalized);
      } else {
        state.resume.meta.content.order.oneColumn = [];
      }

      state.resume.meta.content.pageBreaks = sanitizePageBreaks(state.resume);
    });
  },

  togglePageBreak: (layout, sectionId) => {
    set((state) => {
      if (!state.resume.meta.content.pageBreaks) {
        state.resume.meta.content.pageBreaks = {
          oneColumn: [],
          twoColumn: { main: [], sidebar: [] },
        };
      }

      const breaks = state.resume.meta.content.pageBreaks;

      if (layout === 'oneColumn') {
        if (!breaks.oneColumn) breaks.oneColumn = [];
        const index = breaks.oneColumn.indexOf(sectionId);
        if (index > -1) breaks.oneColumn.splice(index, 1);
        else breaks.oneColumn.push(sectionId);
      } else {
        if (!breaks.twoColumn) breaks.twoColumn = { main: [], sidebar: [] };
        const list = breaks.twoColumn[layout as 'main' | 'sidebar'] || [];
        const index = list.indexOf(sectionId);
        if (index > -1) list.splice(index, 1);
        else list.push(sectionId);
        breaks.twoColumn[layout as 'main' | 'sidebar'] = list;
      }

      state.resume.meta.content.pageBreaks = sanitizePageBreaks(state.resume);
    });
  },
});
