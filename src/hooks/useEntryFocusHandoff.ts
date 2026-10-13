import { useCallback, useLayoutEffect, useRef } from 'react';

import { type FocusAnchor, focusIfPossible } from '@/utils/focus';

/**
 * Where focus goes when adding or removing an entry unmounts the control that
 * did it, with no dialog in between — WCAG 2.4.3.
 *
 * Two presses need it: deleting a **blank** entry, which `useArrayForm` drops
 * without a confirm so `restoreFocusTo` never runs, and the empty
 * section's "add first entry" card, which the new entry replaces. The
 * caller names the anchor; this lands on it once the entry count has changed.
 *
 * `code/UI_PATTERNS.md` § Focus Handoff When a Control Removes Itself.
 */
export function useEntryFocusHandoff(entryCount: number) {
  const pending = useRef<FocusAnchor | null>(null);
  const previousCount = useRef(entryCount);

  useLayoutEffect(() => {
    if (entryCount === previousCount.current) return;
    previousCount.current = entryCount;

    // Entries also change on a drag or another tab writing the store. Only a
    // press arms the handoff; anything else moving focus would be stealing it.
    const anchor = pending.current;
    if (anchor === null) return;
    pending.current = null;

    // The unmounted control leaves focus on `<body>`. If something else has
    // claimed it in the meantime, it has a better claim than this.
    if (document.activeElement !== document.body) return;

    focusIfPossible(anchor());
  }, [entryCount]);

  /**
   * Call from the control before it changes the entries.
   *
   * ⚠️ `fromKeyboard` is `isKeyboardActivation(event)` at the press site — see
   * `code/UI_PATTERNS.md` § Focus Handoff When a Control Removes Itself.
   */
  return useCallback((anchor: FocusAnchor, fromKeyboard: boolean) => {
    if (!fromKeyboard) return;
    pending.current = anchor;
  }, []);
}
