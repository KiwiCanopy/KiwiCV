import { type InputHTMLAttributes, forwardRef, useId, useState } from 'react';

import { FieldLabel } from '@/components/ui/FieldLabel';
import { LockedReason } from '@/components/ui/LockedReason';
import {
  type FieldLock,
  LOCKED_CONTROL_CLASS,
  isTypedBeforeLock,
  lockedReasonId,
} from '@/components/ui/fieldLock';
import { useUIStore } from '@/store/ui/useUIStore';
import { cn } from '@/utils/cn';
import { CircleQuestionMark, type LucideIcon } from 'lucide-react';

// ⚠️ `prefix` is omitted from the native attributes on purpose: HTML's own
// `prefix` is an RDFa string, which would make the adornment below untypeable.
// Nothing in this repo sets the RDFa one.
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  /**
   * Leading adornment, centred against the field the way `suffix` already is.
   * ⚠️ Exists so callers stop hand-placing one: an icon positioned from the
   * OUTER container has to guess the label's height, and is wrong by 2px at the
   * default and further out whenever the label wraps.
   */
  prefix?: React.ReactNode;
  error?: string;
  /**
   * A non-blocking notice, announced politely. Pass `null` while there is none
   * on a field that can warn: the live region then exists before its text does,
   * the only state in which a screen reader reliably announces it (#62).
   */
  warning?: string | null;
  infoHint?: React.ReactNode;
  infoInteractive?: boolean;
  infoIcon?: LucideIcon;
  layoutHint?: string;
  layoutIcon?: LucideIcon;
  containerClassName?: string;
  suffix?: React.ReactNode;
  liveUpdate?: boolean;
  /**
   * Locks the field: read-only, `aria-disabled`, the reason shown and
   * announced, and a buffer typed before the lock handed to `keepTyped` on blur
   * rather than committed. See `UI_PATTERNS.md` § Locked fields.
   */
  lock?: FieldLock | null;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      prefix,
      error,
      warning,
      infoHint,
      infoInteractive = false,
      infoIcon: InfoIcon = CircleQuestionMark,
      layoutHint,
      layoutIcon: _layoutIcon,
      containerClassName,
      suffix,
      liveUpdate = false,
      lock,
      type,
      value,
      onChange,
      onBlur,
      onFocus,
      id,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const viewMode = useUIStore((state) => state.viewMode);
    const isTextLike = !type || ['text', 'url', 'email', 'tel', 'password'].includes(type);
    const [localValue, setLocalValue] = useState(value ?? '');
    const [isFocused, setIsFocused] = useState(false);
    const [prevValue, setPrevValue] = useState(value);
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const errorId = error ? `${controlId}-error` : undefined;
    const warningId = warning && !error ? `${controlId}-warning` : undefined;
    const lockedId = lock ? lockedReasonId(controlId) : undefined;
    const describedBy =
      [ariaDescribedBy, lockedId, errorId, warningId].filter(Boolean).join(' ') || undefined;

    // Sync local state if value prop changes from outside (e.g. undo/redo or AI)
    if (value !== prevValue) {
      setPrevValue(value);
      if (!isFocused || value === '') {
        setLocalValue(value ?? '');
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isTextLike) {
        setLocalValue(e.target.value);
        if ((viewMode === 'html' || liveUpdate) && onChange) {
          onChange(e);
        }
      } else if (onChange) {
        onChange(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      // ⚠️ A buffer typed before the lock arrived must neither land on the
      // proposal nor vanish: it becomes the user's side of it. One that differs
      // from neither the proposal nor that side was never typed.
      if (lock) {
        if (isTextLike && isTypedBeforeLock(localValue, value, lock)) lock.keepTyped?.(localValue);
        setLocalValue(value ?? '');
      } else if (isTextLike && onChange && localValue !== (value ?? '')) {
        onChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
      }
      if (onBlur) {
        onBlur(e);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) {
        onFocus(e);
      }
    };

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <FieldLabel
            htmlFor={controlId}
            className="text-foreground mb-1 text-sm font-medium"
            layoutHint={layoutHint}
            infoHint={infoHint}
            infoInteractive={infoInteractive}
            infoIcon={InfoIcon}
          >
            {label}
          </FieldLabel>
        )}
        <LockedReason controlId={controlId} lock={lock} />

        <div className="relative">
          {prefix && (
            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            id={controlId}
            type={type}
            value={isTextLike ? (lock ? (value ?? '') : localValue) : value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              // The value needs an explicit token. Without one it inherited an
              // ancestor's light-mode ink and rendered at 1.5:1 on the dark
              // field — with a muted placeholder above it, the empty state was
              // more legible than the filled one.
              'placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 shadow-sm transition-all focus:ring-2 focus:outline-none',
              error ? 'text-destructive' : 'text-foreground',
              prefix && 'pl-9',
              suffix && 'pr-12',
              error
                ? 'border-destructive focus:ring-destructive focus:border-destructive'
                : warning
                  ? 'border-warning bg-warning/5 focus:ring-warning focus:border-warning'
                  : 'border-input focus:border-primary-strong focus:ring-primary-strong/20 bg-card',
              lock && LOCKED_CONTROL_CLASS,
              className,
            )}
            {...props}
            readOnly={lock ? true : props.readOnly}
            aria-disabled={lock ? true : props['aria-disabled']}
          />
          {suffix && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">{suffix}</div>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-destructive mt-1 text-sm font-medium">
            {error}
          </p>
        )}
        {warning !== undefined && (
          <p
            id={warningId}
            role="status"
            aria-live="polite"
            className={cn(warningId && 'text-warning mt-1 text-sm font-medium')}
          >
            {warningId ? warning : null}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
