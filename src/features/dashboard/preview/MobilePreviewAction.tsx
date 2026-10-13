import { useEffect, useState } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { warmTypst } from '@/hooks/useTypst';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { cn } from '@/utils/cn';
import { PreviewPopupBlockedError, openHTMLPreview, openPDFPreview } from '@/utils/preview-utils';
import * as Popover from '@radix-ui/react-popover';
import { Eye, FileText, Globe, RotateCcw } from 'lucide-react';

type PreviewFormat = 'pdf' | 'html';
type PreviewStatus = 'idle' | 'opening' | 'generating' | 'opened' | 'error';

export function MobilePreviewAction() {
  const { t } = useTranslation();
  const resume = useResumeStore((state) => state.resume);
  const isPdfRenderError = useResumeStore((state) => state.isPdfRenderError);
  const [status, setStatus] = useState<PreviewStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastFormat, setLastFormat] = useState<PreviewFormat>('pdf');
  const [open, setOpen] = useState(false);
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  // Boot the Typst worker while the user is still editing.
  //
  // ⚠️ Phone-only by construction: `DashboardLayout` renders this component
  // only at the phone layout, which is also the only layout that never mounts
  // `RightPane`. Every other layout has a live preview that created the worker
  // long ago; here the Preview tap used to be the first thing that touched it,
  // so it paid the compiler WASM, the renderer and the eager fonts before it
  // could start compiling.
  //
  // Idle-scheduled and unawaited: this competes with the editor for the same
  // connection, and a failure only means the tap pays what it paid before.
  useEffect(() => {
    const warm = () => void warmTypst().catch(() => {});
    if (typeof requestIdleCallback !== 'function') {
      const timeoutId = setTimeout(warm, 2_000);
      return () => clearTimeout(timeoutId);
    }
    const handle = requestIdleCallback(warm, { timeout: 5_000 });
    return () => cancelIdleCallback(handle);
  }, []);

  const openPreview = async (format: PreviewFormat) => {
    setLastFormat(format);
    setErrorMessage('');
    setStatus('opening');
    setOpen(false);

    if (format === 'pdf' && isPdfRenderError) {
      setStatus('error');
      setErrorMessage(t('preview.render_failed'));
      return;
    }

    const name = resume.basics.name || t('common.untitled');
    const label = resume.basics.label;
    const tabTitle = label ? `${name} — ${label} | KiwiCV` : `${name} | KiwiCV`;

    try {
      const previewPromise =
        format === 'pdf'
          ? openPDFPreview(resume, tabTitle, {
              loadingLabel: t('preview.generating'),
              tabTitle,
            })
          : openHTMLPreview(resume, tabTitle, {
              loadingLabel: t('preview.generating'),
              tabTitle,
            });
      setStatus('generating');
      analytics.track(
        format === 'pdf'
          ? ANALYTICS_EVENTS.MOBILE_PREVIEW_PDF
          : ANALYTICS_EVENTS.MOBILE_PREVIEW_HTML,
      );
      await previewPromise;
      setStatus('opened');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof PreviewPopupBlockedError
          ? t('preview.popup_blocked')
          : t('preview.render_failed'),
      );
    }
  };

  const statusLabel =
    status === 'opening'
      ? t('preview.opening')
      : status === 'generating'
        ? t('preview.generating')
        : status === 'opened'
          ? t('preview.opened')
          : '';

  // The drawer is modal; at z-[60] this pill would sit on top of it.
  if (isSidebarOpen) return null;

  return (
    <div className="fixed right-4 bottom-4 z-[60] flex flex-col items-end gap-3 md:hidden">
      {status === 'error' && (
        <div className="border-danger/30 bg-card max-w-[min(22rem,calc(100vw-2rem))] rounded-xl border p-4 shadow-[var(--elevation-2)]">
          <p className="text-danger text-sm leading-5" role="alert">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => openPreview(lastFormat)}
            className="btn-outline mt-3 min-h-11 gap-2"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t('preview.try_again')}
          </button>
        </div>
      )}

      <span className="sr-only" aria-live="polite" role="status">
        {statusLabel}
      </span>

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="btn-outline bg-card min-h-11 gap-2 shadow-[var(--elevation-1)]"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            {t('dashboard.preview')}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="top"
            align="end"
            sideOffset={8}
            className="border-border bg-card z-[70] w-64 rounded-xl border p-2 shadow-[var(--elevation-2)]"
          >
            <p className="text-muted-foreground px-3 py-2 text-xs font-semibold">
              {t('preview.choose_format')}
            </p>
            <button
              type="button"
              onClick={() => openPreview('pdf')}
              disabled={isPdfRenderError}
              className={cn(
                'hover:bg-secondary flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium',
                isPdfRenderError && 'cursor-not-allowed opacity-50',
              )}
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              {t('preview.open_pdf')}
            </button>
            {isPdfRenderError && (
              <p className="text-danger px-3 pb-2 text-xs leading-4">
                {t('preview.render_failed')}
              </p>
            )}
            <button
              type="button"
              onClick={() => openPreview('html')}
              className="hover:bg-secondary flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium"
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              {t('preview.open_html')}
            </button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
