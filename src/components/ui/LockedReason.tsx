import { useState } from 'react';

import { type FieldLock, lockedReasonId } from '@/components/ui/fieldLock';

interface LockedReasonProps {
  /** The id of the control the reason describes. */
  controlId: string;
  lock: FieldLock | null | undefined;
}

/**
 * The reason line between a field's label and its control, plus a polite live
 * region that says it again when the lock arrives on a field that has focus —
 * a description that appears under the caret is otherwise never read.
 *
 * ⚠️ The region renders for `lock === null` too, so it exists before it is
 * filled: a region mounted already populated is not announced. `undefined` opts
 * out, so controls outside the AI editor carry no empty status region.
 */
export function LockedReason({ controlId, lock }: LockedReasonProps) {
  const reason = lock?.reason;
  const [previousReason, setPreviousReason] = useState(reason);
  const [announcement, setAnnouncement] = useState('');

  if (reason !== previousReason) {
    setPreviousReason(reason);
    const control = typeof document === 'undefined' ? null : document.getElementById(controlId);
    const focused = control !== null && control === document.activeElement;
    setAnnouncement(reason && !previousReason && focused ? reason : '');
  }

  return (
    <>
      {lock !== undefined && (
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>
      )}
      {reason && (
        <p id={lockedReasonId(controlId)} className="text-muted-foreground mb-1 text-xs">
          {reason}
        </p>
      )}
    </>
  );
}
