import { type ResumeStore } from '@/store/resume/types';
import { type StateCreator } from 'zustand';

export type SaveStatus = 'saving' | 'saved' | 'error';

export interface StatusSlice {
  isSyncingData: boolean;
  setIsSyncingData: (syncing: boolean) => void;
  isGeneratingPDF: boolean;
  setIsGeneratingPDF: (loading: boolean) => void;
  isPdfRenderError: boolean;
  setIsPdfRenderError: (error: boolean) => void;
  /**
   * Pages in the last successfully compiled PDF, or `null` while unknown.
   *
   * ⚠️ `null` is load-bearing: it covers "not compiled yet", "compiling" and
   * "the byte format changed and we could not read it", and the chip renders
   * nothing in all three. A wrong page count is worse than no page count.
   */
  pdfPageCount: number | null;
  setPdfPageCount: (count: number | null) => void;
  /** Real localStorage-persistence state, driven by the persist storage. */
  saveStatus: SaveStatus;
  /** Epoch ms of the last successful persist, or null before the first save. */
  lastSavedAt: number | null;
  setSaveStatus: (status: SaveStatus, savedAt?: number | null) => void;
}

export const createStatusSlice: StateCreator<
  ResumeStore,
  [['zustand/immer', never]],
  [],
  StatusSlice
> = (set) => ({
  isSyncingData: false,
  setIsSyncingData: (syncing) =>
    set((state) => {
      state.isSyncingData = syncing;
    }),

  isGeneratingPDF: false,
  setIsGeneratingPDF: (loading) =>
    set((state) => {
      state.isGeneratingPDF = loading;
    }),

  isPdfRenderError: false,
  setIsPdfRenderError: (error) =>
    set((state) => {
      state.isPdfRenderError = error;
    }),

  pdfPageCount: null,
  setPdfPageCount: (count) =>
    set((state) => {
      state.pdfPageCount = count;
    }),

  saveStatus: 'saved',
  lastSavedAt: null,
  setSaveStatus: (status, savedAt) =>
    set((state) => {
      state.saveStatus = status;
      if (status === 'saved') {
        state.lastSavedAt = savedAt ?? Date.now();
      }
    }),
});
