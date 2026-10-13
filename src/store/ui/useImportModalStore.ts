import { type ImportStepType } from '@/components/modals/import/types';
import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type ImportModalSource = 'landing' | 'editor' | 'raw_json';

interface ImportModalStore {
  isOpen: boolean;
  step: ImportStepType;
  source: ImportModalSource | null;
  open: (initialStep?: ImportStepType, source?: ImportModalSource) => void;
  close: () => void;
  setStep: (step: ImportStepType) => void;
}

export const useImportModalStore = create<ImportModalStore>()(
  persist(
    immer((set) => ({
      isOpen: false,
      step: 'import_choice',
      source: null,
      open: (initialStep = 'import_choice', source) =>
        set((state) => {
          state.isOpen = true;
          state.step = initialStep;
          if (source) {
            state.source = source;
          }
        }),
      close: () =>
        set((state) => {
          state.isOpen = false;
          state.source = null;
        }),
      setStep: (step) =>
        set((state) => {
          state.step = step;
        }),
    })),
    {
      name: BRAND_STORAGE_KEYS.importModal,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
