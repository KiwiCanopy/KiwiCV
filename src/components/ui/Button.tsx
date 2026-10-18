import {
  type ButtonHTMLAttributes,
  type ReactNode,
  forwardRef,
  useCallback,
  useId,
  useRef,
} from 'react';

import { useRefusalTooltip } from '@/components/ui/useRefusalTooltip';
import { cn } from '@/utils/cn';
import { LoaderCircle } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  disabledReason?: ReactNode;
  /**
   * `inline` prints the reason under the button; `tooltip` shows it on hover,
   * focus and tap and takes no room, for a control inside a one-line row.
   */
  disabledReasonDisplay?: 'inline' | 'tooltip';
  wrapperClassName?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  // ⚠️ `border-transparent`, not "no border": the 1px is kept so a primary and a
  // secondary button are the same height and align in a row.
  //
  // A filled button is identified by its label, not by its edge — ink on the
  // teal is 8.85:1 — so the fill's own 1.85:1 against the surface does not need
  // a rim to make the control findable. The light variants below are the
  // opposite case: `bg-card` on `--card` is 1.00:1, so their edge IS the button.
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 border-transparent',
  // ⚠️ Borderless BY DECISION (owner, 2026-09-01), not by omission. The fill is
  // 1.19:1 on `--card` and 1.11:1 on the canvas, so the shape is faint and the
  // label — 13.68:1 light, 10.75:1 dark — is what identifies the control. That
  // is the same argument `--primary` already makes for filled buttons carrying
  // no rim, applied to the light one.
  //
  // ⚠️ Do NOT "restore" `bg-card border-input` here. That was the previous
  // treatment and the two looks coexisted: this variant on My CVs and a
  // hand-rolled borderless copy in the dashboard header. One rule, chosen
  // deliberately, is the point.
  secondary: 'bg-secondary text-foreground hover:bg-secondary/80 border-transparent',
  quiet: 'bg-transparent text-foreground hover:bg-muted border-transparent',
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      wrapperClassName,
      variant = 'secondary',
      size = 'md',
      loading = false,
      loadingLabel,
      disabled,
      disabledReason,
      disabledReasonDisplay = 'inline',
      type = 'button',
      onClick,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      title,
      'aria-describedby': ariaDescribedBy,
      'aria-disabled': ariaDisabled,
      ...props
    },
    ref,
  ) => {
    const asTooltip = disabledReasonDisplay === 'tooltip';
    const generatedReasonId = useId();
    const inert = disabled || loading;
    const anchorRef = useRef<HTMLButtonElement | null>(null);
    const refusal = useRefusalTooltip({
      anchorRef,
      refused: asTooltip && Boolean(disabledReason),
      reason: disabledReason,
    });
    const reasonId = asTooltip
      ? refusal.describedBy
      : disabledReason
        ? generatedReasonId
        : undefined;
    const setRefs = useCallback(
      (node: HTMLButtonElement | null) => {
        anchorRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [anchorRef, ref],
    );
    // Only a refused button tracks hover and focus; every other one would
    // re-render on each pointer pass for nothing.
    const hint = refusal.tooltip ? refusal.triggerProps : undefined;
    // A natively disabled button leaves the accessibility tree, taking its
    // aria-describedby, aria-busy, and loading label with it — so none of them
    // would ever be announced. Whenever there is something to convey, stay in
    // the tree and refuse the activation instead. This matches DialogFrame,
    // which keeps its close button mounted and aria-disabled while busy.
    const softDisabled = inert && Boolean(disabledReason || loading);
    // A consumer can mark the button inert itself — DialogFrame does this for
    // its close button while a dialog is busy — and must not be overwritten.
    const isAriaDisabled = softDisabled || ariaDisabled === true || ariaDisabled === 'true';
    const button = (
      <button
        {...props}
        ref={setRefs}
        type={type}
        // A native title would stack a second tooltip on top of the reason.
        title={refusal.tooltip ? undefined : title}
        onMouseEnter={(event) => {
          hint?.onMouseEnter();
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          hint?.onMouseLeave();
          onMouseLeave?.(event);
        }}
        onFocus={(event) => {
          hint?.onFocus();
          onFocus?.(event);
        }}
        onBlur={(event) => {
          hint?.onBlur();
          onBlur?.(event);
        }}
        disabled={softDisabled ? undefined : inert}
        aria-disabled={isAriaDisabled || undefined}
        aria-busy={loading || undefined}
        aria-describedby={[ariaDescribedBy, reasonId].filter(Boolean).join(' ') || undefined}
        onClick={(event) => {
          if (isAriaDisabled) {
            event.preventDefault();
            // Touch has no hover, so a tap is how the reason gets read there.
            if (refusal.tooltip) refusal.tap();
            return;
          }
          onClick?.(event);
        }}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'aria-disabled:cursor-not-allowed aria-disabled:opacity-60',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
      >
        {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {loading && loadingLabel ? loadingLabel : children}
      </button>
    );

    // Always a fragment in this mode, so the reason coming and going never
    // changes the element type and remounts the button.
    if (asTooltip) {
      return (
        <>
          {button}
          {refusal.tooltip}
        </>
      );
    }

    if (!disabledReason) return button;

    return (
      <span className={cn('inline-flex flex-col items-start gap-1', wrapperClassName)}>
        {button}
        <span id={reasonId} className="text-muted-foreground text-xs leading-4">
          {disabledReason}
        </span>
      </span>
    );
  },
);

Button.displayName = 'Button';
