import { useCallback, useEffect, useRef } from 'react';

/** Pointer grace so the pointer can cross onto the tooltip (WCAG 1.4.13 hoverable). */
export const HOVER_GRACE_MS = 150;

/**
 * A delayed hide for a hover-opened surface: `schedule` runs `hide` after the
 * grace period, `cancel` drops a pending one. Both are stable, and a pending hide
 * is dropped on unmount.
 */
export function useHoverGrace() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const schedule = useCallback(
    (hide: () => void) => {
      cancel();
      timer.current = setTimeout(() => {
        timer.current = null;
        hide();
      }, HOVER_GRACE_MS);
    },
    [cancel],
  );

  useEffect(() => cancel, [cancel]);

  return { cancel, schedule };
}
