import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * Whether a section row should carry its move controls itself rather than
 * leaving them one tap deep inside the overflow menu.
 *
 * True for coarse pointers and for a narrow Design column. On touch the only
 * way to reorder used to be a 250ms long-press that nothing on screen
 * announces, and a short touch-drag does nothing at all — which teaches the
 * user the control is dead. The buttons are the affordance that does not have
 * to be guessed.
 */
export function useInlineOrderControls(): boolean {
  const { isStandard } = useEditorBreakpoints();
  const isCoarsePointer = useMediaQuery('(pointer: coarse)');

  return isCoarsePointer || !isStandard;
}
