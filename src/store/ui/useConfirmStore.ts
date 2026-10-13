import { type FocusAnchor } from '@/utils/focus';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface ConfirmOptions {
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'destructive';
  preferredFocus?: 'cancel' | 'confirm';
  /**
   * Where focus goes on close when the control that called `confirm()` is gone
   * — a row's Delete button whose row the confirmed action removes. Sibling to
   * `preferredFocus`: that one answers the open side, this one the close side
   * A getter, since the answer only exists after the delete lands.
   */
  restoreFocusTo?: FocusAnchor;
  isLoading?: boolean;
  closeOnConfirm?: boolean;
  showCloseButton?: boolean;
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions;
  resolve: ((value: boolean | null) => void) | null;
  confirm: (options: ConfirmOptions) => Promise<boolean | null>;
  setLoading: (loading: boolean) => void;
  setOptions: (options: Partial<ConfirmOptions>) => void;
  setResolve: (resolve: ((value: boolean | null) => void) | null) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onDismiss: () => void;
  close: () => void;
}

export const useConfirmStore = create<ConfirmState>()(
  immer((set, get) => ({
    isOpen: false,
    options: {
      title: '',
      message: '',
      confirmText: undefined,
      cancelText: undefined,
      variant: 'primary',
      preferredFocus: 'cancel',
      isLoading: false,
      closeOnConfirm: true,
      showCloseButton: true,
    },
    resolve: null,
    confirm: (options) => {
      return new Promise((resolve) => {
        set((state) => {
          state.isOpen = true;
          state.resolve = resolve;
          state.options = {
            confirmText: undefined,
            cancelText: undefined,
            variant: 'primary',
            preferredFocus: 'cancel',
            restoreFocusTo: undefined,
            isLoading: false,
            closeOnConfirm: true,
            showCloseButton: true,
            ...options,
          };
        });
      });
    },
    setLoading: (loading) => {
      set((state) => {
        state.options.isLoading = loading;
      });
    },
    setOptions: (options) => {
      set((state) => {
        Object.assign(state.options, options);
      });
    },
    setResolve: (resolve) => {
      set((state) => {
        state.resolve = resolve;
      });
    },
    onConfirm: () => {
      const { resolve, options } = get();
      if (options.closeOnConfirm) {
        if (resolve) resolve(true);
        set((state) => {
          state.isOpen = false;
          state.resolve = null;
        });
      } else {
        // Start spinning immediately to provide feedback on the click
        set((state) => {
          state.options.isLoading = true;
        });
        if (resolve) resolve(true);
        // We don't close, just resolve. The caller is responsible for calling onDismiss() later.
      }
    },
    onCancel: () => {
      const { resolve, options } = get();
      if (options.isLoading) return; // Prevent cancel while loading
      if (resolve) resolve(false);
      set((state) => {
        state.isOpen = false;
        state.resolve = null;
      });
    },
    onDismiss: () => {
      const { resolve, options } = get();
      if (options.isLoading) return; // Prevent user-initiated dismiss while loading
      if (resolve) resolve(null);
      set((state) => {
        state.isOpen = false;
        state.resolve = null;
      });
    },
    close: () => {
      const { resolve } = get();
      if (resolve) resolve(null);
      set((state) => {
        state.isOpen = false;
        state.resolve = null;
        state.options.isLoading = false;
      });
    },
  })),
);
