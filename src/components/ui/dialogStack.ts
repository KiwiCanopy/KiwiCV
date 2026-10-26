/**
 * Counts dialog opens, so a dialog that must stay on top can take the top of
 * Radix's stack back. Radix gives scroll lock, focus and `aria-hidden` to the
 * most recently opened dialog, so one opening later freezes whatever is under
 * it (#9).
 */
let opens = 0;
const listeners = new Set<() => void>();

export function noteDialogOpened(): void {
  opens += 1;
  listeners.forEach((listener) => listener());
}

export function subscribeToDialogOpens(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getDialogOpens = (): number => opens;
