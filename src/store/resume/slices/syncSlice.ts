import { type ResumeStore } from '@/store/resume/types';
import { type SyncConfig } from '@/types/resume';
import { type StateCreator } from 'zustand';

/**
 * ⚠️ `SyncConfig`, not `ResumeStore['sync']`. Reading the field back off the
 * store was harmless only while `ResumeStore` restated every slice; now that it
 * extends them the same spelling is `TS2456` — the alias resolves through
 * itself. The slice is where the type is declared, and the store is downstream.
 */
export interface SyncSlice {
  sync: SyncConfig;
  updateSync: (sync: Partial<SyncConfig>) => void;
  resetSync: () => void;
}

export const createSyncSlice: StateCreator<
  ResumeStore,
  [['zustand/immer', never]],
  [],
  SyncSlice
> = (set) => ({
  sync: {
    github: { enabled: false },
    googleDrive: { enabled: false },
  },

  updateSync: (sync) =>
    set((state) => {
      if (sync.github) {
        state.sync.github = { ...state.sync.github, ...sync.github };
      }
      if (sync.googleDrive) {
        state.sync.googleDrive = { ...state.sync.googleDrive, ...sync.googleDrive };
      }
      // Shallow merge for top-level if needed (though sync config only has these two)
      const { github: _, googleDrive: __, ...rest } = sync;
      Object.assign(state.sync, rest);
    }),

  resetSync: () =>
    set((state) => {
      state.sync = {
        github: { enabled: false },
        googleDrive: { enabled: false },
      };
    }),
});
