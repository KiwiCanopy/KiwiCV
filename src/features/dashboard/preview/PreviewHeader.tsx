import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import type { ViewMode } from '@/store/ui/useUIStore';
import { cn } from '@/utils/cn';
import { PreviewPopupBlockedError, openHTMLPreview, openPDFPreview } from '@/utils/preview-utils';
import { ExternalLink, FileText, Globe } from 'lucide-react';

interface PreviewHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const PreviewHeader = ({ viewMode, onViewModeChange }: PreviewHeaderProps) => {
  const { t } = useTranslation();
  const resume = useResumeStore((state) => state.resume);
  const isPdfRenderError = useResumeStore((state) => state.isPdfRenderError);
  const pdfPageCount = useResumeStore((state) => state.pdfPageCount);
  const confirm = useConfirmStore((state) => state.confirm);

  // ⚠️ Renders nothing while the count is unknown and nothing on a render
  // error — a chip that flickers to "1 page" between compiles reads as the CV
  // having shrunk. `null` covers not-compiled, compiling and unreadable bytes.
  const showPageCount = viewMode === 'pdf' && !isPdfRenderError && pdfPageCount !== null;

  // On non-desktop devices where text is hidden, the label remains consistent

  // Fullscreen / Open-in-tab handler
  const handleExpand = async () => {
    const name = resume.basics.name || t('common.untitled');
    const label = resume.basics.label;
    const tabTitle = label ? `${name} — ${label} | KiwiCV` : `${name} | KiwiCV`;

    if (viewMode === 'pdf' && isPdfRenderError) {
      confirm({
        title: t('preview.pdf_render_error_title'),
        message: `${t('preview.pdf_render_error_desc')}\n\n${t('preview.pdf_render_error_pro_tip')}: ${t('preview.pdf_render_error_hint')}`,
        confirmText: t('common.ok'),
        cancelText: '',
      });
      return;
    }

    try {
      if (viewMode === 'html') {
        analytics.track(ANALYTICS_EVENTS.PREVIEW_HTML_TAB, { tabTitle });
        await openHTMLPreview(resume, tabTitle);
      } else {
        analytics.track(ANALYTICS_EVENTS.PREVIEW_PDF_TAB, { tabTitle });
        await openPDFPreview(resume, tabTitle);
      }
    } catch (error) {
      console.error('Preview failed:', error);
      confirm({
        title: t('common.error'),
        message:
          error instanceof PreviewPopupBlockedError
            ? t('preview.popup_blocked')
            : t('header.preview_failed_msg'),
        confirmText: t('common.ok'),
        cancelText: '',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="border-border bg-card flex min-h-[64px] shrink-0 items-center justify-center border-b px-4">
      <div className="flex items-center gap-2">
        {/* Segmented Toggle for HTML / PDF */}
        <SegmentedToggle
          value={viewMode}
          onChange={onViewModeChange}
          className="w-auto sm:min-w-[160px]"
          options={[
            {
              value: 'html',
              label: t('preview.view_html'),
              labelClassName: 'hidden sm:inline',
              hint: t('preview.view_html'),
              icon: <Globe size={16} className="shrink-0" />,
            },
            {
              value: 'pdf',
              label: t('preview.view_pdf'),
              labelClassName: 'hidden sm:inline',
              hint: t('preview.view_pdf'),
              icon: <FileText size={16} className="shrink-0" />,
            },
          ]}
        />

        {showPageCount && (
          <span className="border-border/70 text-muted-foreground hidden h-8 shrink-0 items-center rounded-full border px-3 text-xs font-medium sm:inline-flex">
            {t('preview.fits_pages', { count: pdfPageCount })}
          </span>
        )}

        {/* Separator */}
        <div className="bg-border/60 hidden h-6 w-px sm:block" />

        {/* Open in new tab */}
        <button
          onClick={handleExpand}
          disabled={viewMode === 'pdf' && isPdfRenderError}
          className={cn(
            // ⚠️ `bg-card`, overriding `btn-outline`'s `--background` fill for
            // this button only. The utility's fill is a *different* pale green
            // from the `--muted` HTML/PDF toggle beside it — two near-identical
            // tones with no meaning between them, an accident of the two
            // components picking different tokens.
            //
            // It keeps its border, unlike the other controls that lost theirs:
            // white on this white header is 1.00:1, so the edge is the only
            // thing that makes it a button — and it is a real action sitting
            // next to a filled toggle, not a passive label. Same treatment as
            // `Button variant="secondary"` and the sidebar's language select.
            'btn-outline bg-card flex h-10 w-10 items-center justify-center gap-2 px-0 text-sm font-medium whitespace-nowrap sm:w-auto sm:px-4',
            viewMode === 'pdf' && isPdfRenderError && 'cursor-not-allowed opacity-50',
          )}
          title={t('header.open_in_tab')}
        >
          <ExternalLink size={16} className="shrink-0" />
          <span className="hidden sm:inline">{t('header.open_in_tab')}</span>
        </button>
      </div>
    </div>
  );
};
