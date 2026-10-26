import { CiExport } from 'react-icons/ci';

import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

interface ExportRunFooterProps {
  /** How many destinations the trigger would target right now. */
  count: number;
  total: number;
  done: number;
  isRunning: boolean;
  /** True when the trigger should relabel to a retry over the failed set. */
  isRetry: boolean;
  canRun: boolean;
  announcement: string;
  buildFailed: boolean;
  onCancel: () => void;
  onRun: () => void;
}

/**
 * The single trigger, its one-run promise, and the run's spoken half.
 *
 * The live region is always mounted and starts empty: a region that appears
 * together with its content is not announced by most screen readers, which is
 * the reasoning already written out in `Toast.tsx`.
 */
export function ExportRunFooter({
  count,
  total,
  done,
  isRunning,
  isRetry,
  canRun,
  announcement,
  buildFailed,
  onCancel,
  onRun,
}: ExportRunFooterProps) {
  const { t } = useTranslation();

  const triggerLabel = isRunning
    ? t('sync.export_dialog.running', { done, total })
    : count === 0
      ? t('sync.export_dialog.trigger_empty')
      : isRetry
        ? t('sync.export_dialog.retry', { count })
        : t('sync.export_dialog.trigger', { count });

  return (
    // Pinned so Export and Retry stay in reach once the body scrolls on a short
    // screen; the negative margins carry `bg-card` over DialogFrame's padding.
    <div className="border-border bg-card sticky bottom-0 -mx-4 -mb-4 flex flex-col gap-3 border-t px-4 pt-3 pb-4 sm:-mx-6 sm:-mb-6 sm:px-6 sm:pb-6">
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>

      {buildFailed && (
        <p className="text-muted-foreground px-1 text-xs leading-relaxed">
          {t('sync.export_dialog.build_failed_hint')}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-stretch">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={onCancel}
          disabled={isRunning}
        >
          {isRunning ? t('sync.export_dialog.close_when_finished') : t('common.cancel')}
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={onRun}
          disabled={!canRun || count === 0}
          loading={isRunning}
          loadingLabel={triggerLabel}
        >
          <CiExport className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="truncate">{triggerLabel}</span>
        </Button>
      </div>
    </div>
  );
}
