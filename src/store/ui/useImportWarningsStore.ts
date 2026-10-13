import { type ImportWarning } from '@/utils/validation';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface ImportWarningsState {
  warnings: ImportWarning[];
  isOpen: boolean;
  isCritical: boolean;
  showWarnings: (warnings: ImportWarning[], isCritical?: boolean) => void;
  closeWarnings: () => void;
}

export const useImportWarningsStore = create<ImportWarningsState>()(
  immer((set) => ({
    warnings: [],
    isOpen: false,
    isCritical: false,
    showWarnings: (warnings, isCritical = false) => {
      if (warnings.length === 0) return;
      set((state) => {
        state.warnings = warnings;
        state.isOpen = true;
        state.isCritical = isCritical;
      });
    },
    closeWarnings: () => {
      set((state) => {
        state.isOpen = false;
        state.warnings = [];
        state.isCritical = false;
      });
    },
  })),
);
