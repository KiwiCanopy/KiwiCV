import { useEffect, useRef } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { type Toast as ToastType, useToastStore } from '@/store/ui/useToastStore';
import { cn } from '@/utils/cn';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <>
      <ToastAnnouncer toasts={toasts} />
      <div className="pointer-events-none fixed top-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </>
  );
}

/**
 * A live region has to be in the DOM and empty before its content arrives, so a
 * toast that mounts with its own role/aria-live is not announced by most screen
 * readers. These two regions are always mounted and carry only the newest
 * message, which also keeps the visible stack in arrival order and stops the
 * whole group being re-read every time one toast is added or dismissed.
 */
function ToastAnnouncer({ toasts }: { toasts: ToastType[] }) {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);
  const announcedRef = useRef<string | null>(null);

  const newest = toasts[toasts.length - 1];
  const newestId = newest?.id ?? null;

  useEffect(() => {
    if (!newest) {
      // Nothing on screen: drop the stale text rather than leaving it in the DOM.
      announcedRef.current = null;
      if (assertiveRef.current) assertiveRef.current.textContent = '';
      if (politeRef.current) politeRef.current.textContent = '';
      return;
    }
    if (announcedRef.current === newestId) return;
    announcedRef.current = newestId;
    const target = newest.type === 'error' ? assertiveRef.current : politeRef.current;
    if (target) target.textContent = newest.message;
  }, [newest, newestId]);

  return (
    <>
      <div
        ref={assertiveRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        ref={politeRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
}

function Toast({ toast }: { toast: ToastType }) {
  const removeToast = useToastStore((state) => state.removeToast);
  const pauseToast = useToastStore((state) => state.pauseToast);
  const resumeToast = useToastStore((state) => state.resumeToast);
  const { t } = useTranslation();

  const icons = {
    success: <CircleCheck className="h-5 w-5 text-green-500" />,
    error: <CircleAlert className="text-destructive h-5 w-5" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <TriangleAlert className="h-5 w-5 text-yellow-500" />,
  };

  const bgColors = {
    success: 'bg-green-50/90 dark:bg-emerald-950/40 border-green-200 dark:border-emerald-800/50',
    error: 'bg-red-50/90 dark:bg-red-950/40 border-red-200 dark:border-red-800/50',
    info: 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50',
    warning: 'bg-yellow-50/90 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800/50',
  };

  return (
    <div
      onMouseEnter={() => pauseToast(toast.id)}
      onMouseLeave={() => resumeToast(toast.id)}
      onFocusCapture={() => pauseToast(toast.id)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) resumeToast(toast.id);
      }}
      className={cn(
        'pointer-events-auto flex transform items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md transition-all duration-300',
        bgColors[toast.type],
        'animate-in fade-in slide-in-from-right-10 translate-y-0 scale-100 opacity-100',
      )}
    >
      <div className="shrink-0">{icons[toast.type]}</div>
      <p className="text-foreground text-sm font-medium">{toast.message}</p>
      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        aria-label={t('common.dismiss_notification')}
        className="text-muted-foreground hover:text-foreground ml-auto rounded-md p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
