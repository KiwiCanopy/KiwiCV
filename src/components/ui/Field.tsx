import { type ReactNode, useId } from 'react';

import { FieldLabel } from '@/components/ui/FieldLabel';
import { cn } from '@/utils/cn';

export interface FieldControlProps {
  id: string;
  'aria-invalid': true | undefined;
  'aria-describedby': string | undefined;
  'aria-required': true | undefined;
}

interface FieldProps {
  label: ReactNode;
  children: (controlProps: FieldControlProps) => ReactNode;
  id?: string;
  description?: ReactNode;
  warning?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  layoutHint?: string;
  infoHint?: ReactNode;
  infoInteractive?: boolean;
}

export function Field({
  label,
  children,
  id,
  description,
  warning,
  error,
  required,
  className,
  layoutHint,
  infoHint,
  infoInteractive,
}: FieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const warningId = warning ? `${controlId}-warning` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [descriptionId, warningId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('w-full', className)}>
      <FieldLabel
        htmlFor={controlId}
        className="text-foreground mb-1 text-sm font-medium"
        layoutHint={layoutHint}
        infoHint={infoHint}
        infoInteractive={infoInteractive}
        after={required ? <span aria-hidden="true">*</span> : undefined}
      >
        {label}
      </FieldLabel>
      {description && (
        <p id={descriptionId} className="text-muted-foreground mb-1 text-sm">
          {description}
        </p>
      )}
      {children({
        id: controlId,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        // The asterisk beside the label is aria-hidden decoration; without this
        // the control is announced as optional.
        'aria-required': required ? true : undefined,
      })}
      {warning && (
        <p id={warningId} className="text-warning mt-1 text-sm">
          {warning}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-destructive mt-1 text-sm font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
