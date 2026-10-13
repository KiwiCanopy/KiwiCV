import React from 'react';

import { cn } from '@/utils/cn';
import { ChevronRight, LoaderCircle } from 'lucide-react';

export interface OptionCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
  badge?: React.ReactNode;
  chevron?: boolean;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  iconClassName?: string;
  customIndicator?: React.ReactNode;
}

/**
 * Flat bordered card for a single choice or entry point.
 * Renders as a button when `onClick` is supplied and as a static panel otherwise.
 */
export const OptionCard: React.FC<OptionCardProps> = ({
  title,
  description,
  icon,
  onClick,
  badge,
  chevron = true,
  className,
  disabled,
  loading,
  iconClassName,
  customIndicator,
}) => {
  const isButton = !!onClick;
  const Component = isButton ? 'button' : 'div';
  const interactionProps = isButton
    ? { disabled: disabled || loading, 'aria-busy': loading || undefined }
    : {};

  return (
    <Component
      onClick={onClick}
      {...interactionProps}
      className={cn(
        'bg-card group relative flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors sm:p-5',
        // ⚠️ The edge follows the ELEMENT, not the caller. `--input` is the
        // control edge and `--border` the decorative divider; this component
        // already switches between `button` and `div` on the same prop, so it
        // is the one place that knows which it is. Stating `border-border`
        // unconditionally put a real control on the readout edge in the three
        // modals that pass `onClick` — sync, import and the AI action cards —
        // all decision points, and the import step is a first-run surface.
        isButton ? 'border-input' : 'border-border',
        isButton && 'hover:bg-muted/40 active:scale-[0.99]',
        (disabled || loading) && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      {/* Icon Container */}
      <div
        className={cn(
          'bg-muted border-border flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border p-2 transition-colors',
          iconClassName,
        )}
      >
        {loading ? <LoaderCircle className="text-primary-strong h-6 w-6 animate-spin" /> : icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
          <span className="block text-base leading-tight font-bold">{title}</span>
          {badge}
        </div>
        {/* Deliberately unclamped: every call site renders two to four cards,
            so there is no density to protect, and a clamp cuts the description
            mid-sentence on a phone. Keep descriptions short instead. */}
        {description && <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>}
      </div>

      {/* Action Indicator */}
      {!loading && (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          {customIndicator ? (
            customIndicator
          ) : chevron ? (
            <ChevronRight className="text-muted-foreground/30 group-hover:text-muted-foreground h-5 w-5" />
          ) : null}
        </div>
      )}
    </Component>
  );
};
