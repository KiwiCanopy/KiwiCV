import { type ReactNode } from 'react';

import { type DestinationRunState } from '@/components/modals/export/types';
import { Switch } from '@/components/ui/Switch';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { Check, LoaderCircle, TriangleAlert } from 'lucide-react';

interface DestinationRowProps {
  icon: ReactNode;
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  run?: DestinationRunState;
  onCheckedChange: (checked: boolean) => void;
  /** An extra control the destination needs, e.g. the Pages target path. */
  children?: ReactNode;
}

function StatusPill({ run }: { run: DestinationRunState }) {
  const { t } = useTranslation();

  if (run.status === 'running') {
    return (
      <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-semibold">
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        {t('sync.export_dialog.status_running')}
      </span>
    );
  }

  if (run.status === 'done') {
    return (
      <span className="text-primary-strong inline-flex items-center gap-1.5 text-xs font-semibold">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        {t('sync.export_dialog.status_done')}
      </span>
    );
  }

  if (run.status === 'failed') {
    return (
      <span className="text-destructive inline-flex items-start gap-1.5 text-xs font-semibold">
        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="min-w-0">{run.error || t('sync.export_dialog.status_failed')}</span>
      </span>
    );
  }

  return null;
}

/**
 * One destination: what it is, whether this run targets it, and how it went.
 *
 * A succeeded row locks its switch — rerunning a destination that already wrote
 * is not what a retry means — while a failed row keeps its switch on so the
 * retry has something to target.
 */
export function DestinationRow({
  icon,
  label,
  description,
  checked,
  disabled,
  run,
  onCheckedChange,
  children,
}: DestinationRowProps) {
  const isRunning = run?.status === 'running';

  return (
    <div
      className={cn(
        'border-border bg-card flex flex-col gap-3 rounded-xl border p-3 sm:p-4',
        run?.status === 'failed' && 'border-destructive/40',
      )}
      aria-busy={isRunning || undefined}
    >
      <div className="flex items-start gap-3">
        <span className="text-primary-strong mt-0.5 shrink-0" aria-hidden="true">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm font-bold tracking-tight">{label}</p>
          <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
          {run && (
            <div className="mt-1.5">
              <StatusPill run={run} />
            </div>
          )}
        </div>
        <Switch
          checked={checked}
          disabled={disabled}
          label={label}
          onCheckedChange={onCheckedChange}
          className="shrink-0"
        />
      </div>
      {children}
    </div>
  );
}
