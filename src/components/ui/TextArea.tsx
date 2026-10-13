import { type TextareaHTMLAttributes, forwardRef, useId, useState } from 'react';

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

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  infoHint?: string;
  infoIcon?: LucideIcon;
  layoutHint?: string;
  layoutIcon?: LucideIcon;
  immediate?: boolean;
  suffix?: React.ReactNode;
  /** Locks the field; same contract as `Input`'s. */
  lock?: FieldLock | null;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      label,
      error,
      infoHint,
      infoIcon: InfoIcon = CircleQuestionMark,
      layoutHint,
      layoutIcon: _layoutIcon,
      value,
      onChange,
      onBlur,
      onFocus,
      immediate,
      suffix,
      lock,
      id,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const viewMode = useUIStore((state) => state.viewMode);
    const [localValue, setLocalValue] = useState(value ?? '');
    const [isFocused, setIsFocused] = useState(false);
    const [prevValue, setPrevValue] = useState(value);
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const errorId = error ? `${controlId}-error` : undefined;
    const lockedId = lock ? lockedReasonId(controlId) : undefined;
    const describedBy = [ariaDescribedBy, lockedId, errorId].filter(Boolean).join(' ') || undefined;

    // Sync local state if value prop changes from outside (e.g. undo/redo or AI)
    if (value !== prevValue) {
      setPrevValue(value);
      if (!isFocused || value === '') {
        setLocalValue(value ?? '');
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalValue(e.target.value);
      if ((viewMode === 'html' || immediate) && onChange) {
        onChange(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      // Same as `Input`: a pre-lock buffer becomes the user's side, not the live value.
      if (lock) {
        if (isTypedBeforeLock(localValue, value, lock)) lock.keepTyped?.(localValue);
        setLocalValue(value ?? '');
      } else if (onChange && localValue !== (value ?? '')) {
        onChange(e as unknown as React.ChangeEvent<HTMLTextAreaElement>);
      }
      if (onBlur) {
        onBlur(e);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      if (onFocus) {
        onFocus(e);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <FieldLabel
            htmlFor={controlId}
            className="text-foreground mb-1 text-sm font-medium"
            layoutHint={layoutHint}
            infoHint={infoHint}
            infoIcon={InfoIcon}
          >
            {label}
          </FieldLabel>
        )}
        <LockedReason controlId={controlId} lock={lock} />

        <div className="relative">
          <textarea
            ref={ref}
            id={controlId}
            value={lock ? (value ?? '') : localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              // `placeholder:text-muted-foreground`, as `Input` has always had. Without it
              // the browser default applies — the text colour at ~50% alpha — which
              // measured 3.25:1 in light and 4.33:1 in dark against the field, both
              // under AA, on every multi-line field in the app.
              'placeholder:text-muted-foreground min-h-[80px] w-full rounded-md border px-3 py-2 shadow-sm transition-all focus:ring-2 focus:outline-none',
              suffix && 'pr-11',
              error
                ? 'border-destructive focus:ring-destructive focus:border-destructive'
                : 'border-input focus:border-primary-strong focus:ring-primary-strong/20 bg-card',
              lock && LOCKED_CONTROL_CLASS,
              className,
            )}
            {...props}
            readOnly={lock ? true : props.readOnly}
            aria-disabled={lock ? true : props['aria-disabled']}
          />
          {suffix && <div className="absolute top-2 right-2 flex items-center">{suffix}</div>}
        </div>
        {error && (
          <p id={errorId} className="text-destructive mt-1 text-sm">
            {error}
          </p>
        )}
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';
