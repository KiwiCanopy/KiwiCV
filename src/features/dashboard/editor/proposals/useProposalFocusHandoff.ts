import { useCallback, useLayoutEffect, useRef } from 'react';

import { REVIEW_NEXT_ANCHOR_ID } from '@/constants/focusAnchors';
import {
  DIFF_ROW_SELECTOR,
  type DiffAction,
  diffActionSelector,
} from '@/features/dashboard/editor/proposals/diffContract';
import { focusIfPossible, sectionHeadingAnchor } from '@/utils/focus';

/** Every entry's panel in the open section — the rail mounts one section. */
const PANEL_SELECTOR = '[data-ai-pending="entry"]';

interface PendingHandoff {
  /** The pressed row, so the row that takes its place is what gets offered. */
  index: number;
  action: DiffAction;
  /** This panel among the section's panels, read while it still exists. */
  panelIndex: number;
}

/**
 * Where focus goes when deciding a proposal removes the button that decided it.
 *
 * Accepting or declining drops the row from `rows`, and clearing the last one
 * drops the whole panel section (`EntryDiffPanel` then renders only its live
 * region), so the pressed button unmounts itself and focus falls to `<body>` —
 * WCAG 2.4.3. The effect lives here rather than in the row because the row is
 * the thing that disappears; `EntryDiffPanel` stays mounted either way.
 *
 * The anchor is **the next thing the user would do**, not the nearest surviving
 * element; `code/UI_PATTERNS.md` § Focus Handoff When a Control Removes Itself
 * argues the cascade and why each rung is where it is.
 */
export function useProposalFocusHandoff(rowCount: number) {
  const panelRef = useRef<HTMLElement>(null);
  const pending = useRef<PendingHandoff | null>(null);
  const previousCount = useRef(rowCount);

  useLayoutEffect(() => {
    if (rowCount === previousCount.current) return;
    previousCount.current = rowCount;

    // Rows also change when a fresh run lands or another tab writes the store.
    // Only a press in this panel arms the handoff; anything else moving focus
    // would be stealing it.
    const intent = pending.current;
    if (!intent) return;
    pending.current = null;

    // The unmounted button leaves focus on `<body>`. If something else has
    // claimed it in the meantime, it has a better claim than this.
    const active = document.activeElement;
    if (active !== document.body && !panelRef.current?.contains(active)) return;

    const rows = panelRef.current ? [...panelRef.current.querySelectorAll(DIFF_ROW_SELECTOR)] : [];
    const survivor = rows[Math.min(intent.index, rows.length - 1)];

    // ⚠️ The section's other entries, and the rung that is easiest to leave out.
    // A section-level run leaves one panel per entry, all of them on screen at
    // once, and the bar's Next section starts its search AFTER the open section
    // (`usePendingProposals`) — so without this the entry directly below the one
    // just cleared is stepped over while fully visible.
    const panels = [...document.querySelectorAll(PANEL_SELECTOR)];
    const sibling = panels[Math.min(intent.panelIndex, panels.length - 1)];

    const pressedSide = diffActionSelector(intent.action);
    const anchors = [
      survivor?.querySelector<HTMLElement>(pressedSide),
      sibling?.querySelector<HTMLElement>(pressedSide),
      document.getElementById(REVIEW_NEXT_ANCHOR_ID),
      sectionHeadingAnchor(),
    ];
    for (const anchor of anchors) {
      if (focusIfPossible(anchor)) return;
    }
  }, [rowCount]);

  /**
   * Call from a control that is about to clear rows, before it clears them.
   *
   * ⚠️ `fromKeyboard` is `isKeyboardActivation(event)` at the press site —
   * `code/UI_PATTERNS.md` § Focus Handoff When a Control Removes Itself.
   */
  const armHandoff = useCallback((index: number, action: DiffAction, fromKeyboard: boolean) => {
    if (!fromKeyboard) return;
    const panels = [...document.querySelectorAll(PANEL_SELECTOR)];
    pending.current = {
      index,
      action,
      panelIndex: panelRef.current ? panels.indexOf(panelRef.current) : -1,
    };
  }, []);

  return { panelRef, armHandoff };
}
