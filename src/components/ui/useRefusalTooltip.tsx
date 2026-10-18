import { type ReactNode, type RefObject, useId } from 'react';

import { FloatingTooltip } from '@/components/ui/FloatingTooltip';
import { useReasonTooltip } from '@/components/ui/useReasonTooltip';

interface RefusalTooltipOptions {
  /** The refused control; the tooltip is placed against it. */
  anchorRef: RefObject<HTMLElement | null>;
  /** Whether the control refuses its press; the tooltip and description exist only then. */
  refused: boolean;
  reason: ReactNode;
  /** Keeps it closed while refused — a natively disabled control can swallow its `blur`. */
  paused?: boolean;
}

/**
 * A refused control's reason as a portalled tooltip, opened by hover, keyboard
 * focus and tap (UI_PATTERNS § An empty section refuses Improve). The caller
 * puts `triggerProps` and `describedBy` on the control `anchorRef` names, calls
 * `tap()` on a refused press, and renders `tooltip` beside it.
 */
export function useRefusalTooltip({
  anchorRef,
  refused,
  reason,
  paused = false,
}: RefusalTooltipOptions) {
  const id = useId();
  const state = useReasonTooltip(refused && !paused);

  return {
    describedBy: refused ? id : undefined,
    triggerProps: state.triggerProps,
    tap: state.tap,
    tooltip: refused ? (
      // End-aligned below: a refusable control trails its row in every consumer.
      <FloatingTooltip
        id={id}
        anchorRef={anchorRef}
        side="bottom"
        align="end"
        {...state.tooltipProps}
        className="max-w-60 rounded-md px-2.5 py-1.5 text-xs leading-snug shadow-lg"
      >
        {reason}
      </FloatingTooltip>
    ) : null,
  };
}
