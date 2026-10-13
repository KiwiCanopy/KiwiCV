import { type SelectHTMLAttributes, forwardRef, useId } from 'react';

import { FieldLabel } from '@/components/ui/FieldLabel';
import { LockedReason } from '@/components/ui/LockedReason';
import { type FieldLock, LOCKED_CONTROL_CLASS, lockedReasonId } from '@/components/ui/fieldLock';
import { cn } from '@/utils/cn';
import { CircleQuestionMark, type LucideIcon } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  options: Array<{ value: string; label: string }>;
  infoHint?: React.ReactNode;
  infoInteractive?: boolean;
  infoIcon?: LucideIcon;
  /**
   * Locks the select. A `<select>` has no `readOnly`, so the lock refuses the
   * change and the press and keys that open or step the list.
   */
  lock?: FieldLock | null;
}

/** Keys a focused `<select>` opens or steps on; modified chords pass through. */
const isSelectKey = (event: React.KeyboardEvent) =>
  !event.ctrlKey &&
  !event.metaKey &&
  (event.key.length === 1 ||
    [
      'Enter',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'PageUp',
      'PageDown',
    ].includes(event.key));

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      containerClassName,
      options,
      infoHint,
      infoInteractive = false,
      infoIcon: InfoIcon = CircleQuestionMark,
      lock,
      id,
      'aria-describedby': ariaDescribedBy,
      onChange,
      onKeyDown,
      onMouseDown,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const errorId = error ? `${controlId}-error` : undefined;
    const lockedId = lock ? lockedReasonId(controlId) : undefined;
    const describedBy = [ariaDescribedBy, lockedId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <FieldLabel
            htmlFor={controlId}
            className="text-foreground mb-1 text-sm font-medium"
            infoHint={infoHint}
            infoInteractive={infoInteractive}
            infoIcon={InfoIcon}
          >
            {label}
          </FieldLabel>
        )}
        <LockedReason controlId={controlId} lock={lock} />

        <select
          ref={ref}
          id={controlId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'focus:ring-ring border-input focus:border-input bg-card w-full appearance-none truncate rounded-md border py-2 pr-9 pl-3 shadow-sm transition-colors focus:ring-2 focus:outline-none',
            props.value === '' || props.value === '0'
              ? // Locked, the value is content to read; the /60 alpha measured 2.47:1 there.
                cn('font-normal', lock ? 'text-muted-foreground' : 'text-muted-foreground/60')
              : 'text-foreground',
            'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E")] bg-[length:1.25rem_1.25rem] bg-[position:right_0.5rem_center] bg-no-repeat',
            error ? 'border-destructive focus:ring-destructive' : 'border-input',
            lock && LOCKED_CONTROL_CLASS,
            className,
          )}
          {...props}
          aria-disabled={lock ? true : props['aria-disabled']}
          onChange={(event) => {
            if (lock) return;
            onChange?.(event);
          }}
          onMouseDown={(event) => {
            if (lock) {
              // Refusing the press also refuses focus; give that half back.
              event.preventDefault();
              event.currentTarget.focus();
            }
            onMouseDown?.(event);
          }}
          onKeyDown={(event) => {
            if (lock && isSelectKey(event)) event.preventDefault();
            onKeyDown?.(event);
          }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
