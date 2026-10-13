/**
 * A field a pending AI proposal covers. See `UI_PATTERNS.md` § Locked fields.
 *
 * `mine` is the user's side of the proposal — what "Keep mine" restores — and
 * `keepTyped` replaces it with text typed before the lock arrived, so that text
 * survives the lock instead of being discarded on blur.
 *
 * A control's `lock` prop is `null` for a field that can be locked but is not:
 * that mounts its live region in advance, so a lock arriving later is announced.
 * `undefined` (every control outside the AI editor) mounts nothing.
 */
export interface FieldLock {
  reason: string;
  mine: unknown;
  keepTyped?: (value: unknown) => void;
}

/** The fill a locked control takes. Never opacity: dimmed text measured 4.38:1. */
export const LOCKED_CONTROL_CLASS = 'bg-muted cursor-default';

/**
 * An inert button beside a locked field: `Button`'s 0.6 disabled opacity
 * swapped for the muted token, which clears 4.5:1 without alpha.
 */
export const LOCKED_BUTTON_CLASS =
  'aria-disabled:opacity-100 aria-disabled:text-muted-foreground aria-disabled:cursor-default disabled:opacity-100 disabled:text-muted-foreground';

/**
 * A button beside a locked field: inert, described by the reason, and out of
 * the tab order — a list of six bullets would otherwise add ~30 dead stops after
 * the field already said why. Spread last, so it overrides
 * dnd-kit's own `aria-describedby` ("press space to pick up").
 */
export const lockedButtonProps = (reasonId: string | undefined) =>
  reasonId ? ({ 'aria-disabled': true, 'aria-describedby': reasonId, tabIndex: -1 } as const) : {};

/**
 * Whether a locked text field's buffer holds typing from before the lock: it
 * matches neither the proposal on display nor the user's own side. A field that
 * merely had focus when the proposal landed still holds the user's side.
 */
export const isTypedBeforeLock = (buffer: unknown, shown: unknown, lock: FieldLock) => {
  const typed = String(buffer ?? '');
  return typed !== String(shown ?? '') && typed !== String(lock.mine ?? '');
};

/** The id a locked control's `aria-describedby` points at. */
export const lockedReasonId = (controlId: string) => `${controlId}-locked`;
