import { Button } from '@/components/ui/Button';
import { CircleAlert } from 'lucide-react';

interface PdfErrorFallbackProps {
  t: (key: string) => string;
  /** Retries the compile. Also clears the render-error lockout on Preview actions. */
  onRetry?: () => void;
  /** Underlying compiler message, shown so a content error can be acted on. */
  details?: string | null;
}

export function PdfErrorFallback({ t, onRetry, details }: PdfErrorFallbackProps) {
  return (
    <div className="animate-in fade-in zoom-in-95 absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xl duration-300">
      <div
        role="alert"
        className="border-border bg-card flex max-w-md flex-col items-center gap-4 rounded-2xl border p-8 text-center shadow-[var(--elevation-2)]"
      >
        <div className="bg-destructive/10 text-destructive flex h-16 w-16 items-center justify-center rounded-full">
          <CircleAlert className="h-10 w-10" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h3 className="text-foreground text-xl font-extrabold tracking-tight">
            {t('preview.pdf_render_error_title')}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t('preview.pdf_render_error_desc')}
          </p>
        </div>
        <div className="bg-secondary border-border rounded-xl border p-4 text-left">
          <p className="text-muted-foreground text-xs leading-relaxed italic">
            <span className="text-foreground font-semibold not-italic">
              {t('preview.pdf_render_error_pro_tip')}:
            </span>{' '}
            {t('preview.pdf_render_error_hint')}
          </p>
        </div>
        {details && (
          <p className="text-muted-foreground w-full text-left font-mono text-[11px] break-words">
            {details}
          </p>
        )}
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {t('preview.try_again')}
          </Button>
        )}
      </div>
    </div>
  );
}
