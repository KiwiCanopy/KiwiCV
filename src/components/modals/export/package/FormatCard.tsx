import { type ComponentType } from 'react';

import { Switch } from '@/components/ui/Switch';
import { cn } from '@/utils/cn';
import { Lock } from 'lucide-react';

interface FormatCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  /**
   * A deliverable that cannot be switched off. The card renders a lock and the
   * "always included" note instead of a control, rather than a switch that
   * refuses to move.
   */
  locked?: boolean;
  lockedLabel?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export function FormatCard({
  icon: Icon,
  label,
  description,
  checked,
  disabled,
  locked,
  lockedLabel,
  onCheckedChange,
}: FormatCardProps) {
  return (
    <div
      className={cn(
        'border-border bg-card flex flex-col gap-2 rounded-xl border p-3',
        !checked && !locked && 'opacity-60',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-primary-strong shrink-0" aria-hidden="true">
          <Icon className="h-5 w-5" />
        </span>
        {locked ? (
          <span
            className="text-muted-foreground inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase"
            aria-hidden="true"
          >
            <Lock className="h-3 w-3" />
          </span>
        ) : (
          <Switch
            checked={checked}
            disabled={disabled}
            label={label}
            onCheckedChange={(next) => onCheckedChange?.(next)}
            className="h-7 w-12 shrink-0"
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-foreground text-sm font-bold tracking-tight">{label}</p>
        <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
        {locked && lockedLabel && (
          <p className="text-muted-foreground/70 mt-1 text-[10px] font-bold tracking-wide uppercase">
            {lockedLabel}
          </p>
        )}
      </div>
    </div>
  );
}
