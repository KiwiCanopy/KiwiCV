import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => string;
  updateToast: (id: string, message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  pauseToast: (id: string) => void;
  resumeToast: (id: string) => void;
}

const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();
const toastDeadlines = new Map<string, number>();
const toastRemaining = new Map<string, number>();

export const useToastStore = create<ToastStore>()(
  immer((set) => {
    const clearToastTimer = (id: string) => {
      const timer = toastTimers.get(id);
      if (timer) clearTimeout(timer);
      toastTimers.delete(id);
      toastDeadlines.delete(id);
    };

    const removeToast = (id: string) => {
      clearToastTimer(id);
      toastRemaining.delete(id);
      set((state) => {
        state.toasts = state.toasts.filter((toast) => toast.id !== id);
      });
    };

    const scheduleRemoval = (id: string, duration: number) => {
      clearToastTimer(id);
      if (duration <= 0) return;
      toastDeadlines.set(id, Date.now() + duration);
      toastTimers.set(
        id,
        setTimeout(() => {
          toastTimers.delete(id);
          toastDeadlines.delete(id);
          toastRemaining.delete(id);
          set((state) => {
            state.toasts = state.toasts.filter((toast) => toast.id !== id);
          });
        }, duration),
      );
    };

    return {
      toasts: [],
      addToast: (message, type, duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => {
          state.toasts.push({ id, message, type, duration });
        });
        scheduleRemoval(id, duration);
        return id;
      },
      updateToast: (id, message, type, duration = 3000) => {
        set((state) => {
          const toast = state.toasts.find((item) => item.id === id);
          if (toast) {
            toast.message = message;
            toast.type = type;
            toast.duration = duration;
          }
        });
        toastRemaining.delete(id);
        scheduleRemoval(id, duration);
      },
      removeToast,
      pauseToast: (id) => {
        const deadline = toastDeadlines.get(id);
        if (!deadline) return;
        toastRemaining.set(id, Math.max(0, deadline - Date.now()));
        clearToastTimer(id);
      },
      resumeToast: (id) => {
        const duration = toastRemaining.get(id);
        if (duration === undefined) return;
        toastRemaining.delete(id);
        if (duration === 0) {
          set((state) => {
            state.toasts = state.toasts.filter((toast) => toast.id !== id);
          });
          return;
        }
        scheduleRemoval(id, duration);
      },
    };
  }),
);
