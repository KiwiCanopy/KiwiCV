import { useCallback, useState } from 'react';

import { useHoverGrace } from '@/components/ui/useHoverGrace';

interface Triggers {
  hover: boolean;
  focus: boolean;
  tap: boolean;
}

const NONE: Triggers = { hover: false, focus: false, tap: false };

/**
 * Show state for a refusal tooltip. Hover, focus and tap are tracked apart and
 * the tooltip shows while any holds, so the pointer leaving never hides it from a
 * keyboard user and a blur never hides it under the pointer. Every callback is
 * stable, so the tooltip's listeners are not re-added on each render.
 * `enabled` false hides it and forgets every trigger.
 */
export function useReasonTooltip(enabled: boolean) {
  const [triggers, setTriggers] = useState<Triggers>(NONE);
  // Bumped by each tap so a tooltip already showing re-measures.
  const [nonce, setNonce] = useState(0);
  const { cancel: cancelHoverEnd, schedule } = useHoverGrace();

  // Disabling can skip the events that would clear a trigger — a natively
  // disabled button does not reliably fire `blur` — so drop them all when it
  // happens, or the tooltip reopens on its own once re-enabled.
  const [wasEnabled, setWasEnabled] = useState(enabled);
  if (enabled !== wasEnabled) {
    setWasEnabled(enabled);
    if (!enabled) setTriggers(NONE);
  }

  const set = useCallback(
    (patch: Partial<Triggers>) => setTriggers((current) => ({ ...current, ...patch })),
    [],
  );

  const hoverStart = useCallback(() => {
    cancelHoverEnd();
    set({ hover: true });
  }, [cancelHoverEnd, set]);
  const hoverEnd = useCallback(() => schedule(() => set({ hover: false })), [schedule, set]);
  const focusStart = useCallback(() => set({ focus: true }), [set]);
  // A tap on a button that took focus ends with that focus.
  const focusEnd = useCallback(() => set({ focus: false, tap: false }), [set]);
  const tap = useCallback(() => {
    set({ tap: true });
    setNonce((value) => value + 1);
  }, [set]);
  const dismiss = useCallback(() => {
    cancelHoverEnd();
    setTriggers(NONE);
  }, [cancelHoverEnd]);
  // Touch: iOS does not focus a tapped button, so nothing else would clear a tap.
  const outsidePress = useCallback(() => set({ tap: false, hover: false }), [set]);

  const open = enabled && (triggers.hover || triggers.focus || triggers.tap);

  return {
    open,
    triggerProps: {
      onMouseEnter: hoverStart,
      onMouseLeave: hoverEnd,
      onFocus: focusStart,
      onBlur: focusEnd,
    },
    tap,
    tooltipProps: {
      open,
      remeasureKey: nonce,
      onMouseEnter: cancelHoverEnd,
      onMouseLeave: hoverEnd,
      onDismiss: dismiss,
      onOutsidePress: outsidePress,
    },
  };
}
