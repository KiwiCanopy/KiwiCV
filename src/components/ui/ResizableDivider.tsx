import { useCallback, useEffect, useRef } from 'react';

import { DASHBOARD_PANE_MIN_WIDTH } from '@/features/dashboard/layout/constants';
import { useTranslation } from '@/hooks/useTranslation';
import { useUIStore } from '@/store/ui/useUIStore';
import { cn } from '@/utils/cn';

interface ResizableDividerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  containerWidth: number;
}

export const ResizableDivider = ({ containerRef, containerWidth }: ResizableDividerProps) => {
  const { t } = useTranslation();
  const editorPaneWidth = useUIStore((state) => state.editorPaneWidth);
  const setEditorPaneWidth = useUIStore((state) => state.setEditorPaneWidth);
  const isDragging = useUIStore((state) => state.isDragging);
  const setIsDragging = useUIStore((state) => state.setIsDragging);

  const dividerRef = useRef<HTMLDivElement>(null);
  // Width the pane had when the drag started, plus the pointer that started it.
  // Escape needs both: one to restore the layout, one to release the capture
  // that would otherwise keep routing moves to a divider nobody is dragging.
  const dragStartWidthRef = useRef<number | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);

  const setWidth = useCallback(
    (nextWidth: number) => {
      const container = containerRef.current;
      if (!container) return;
      const maxWidth = container.getBoundingClientRect().width - DASHBOARD_PANE_MIN_WIDTH;
      const constrainedWidth = Math.max(DASHBOARD_PANE_MIN_WIDTH, Math.min(nextWidth, maxWidth));
      container.style.setProperty('--editor-width', `${constrainedWidth}px`);
      setEditorPaneWidth(constrainedWidth);
    },
    [containerRef, setEditorPaneWidth],
  );

  const resetWidth = useCallback(() => {
    const container = containerRef.current;
    if (container) setWidth(container.getBoundingClientRect().width / 2);
  }, [containerRef, setWidth]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      // Capture the pointer so move/up events keep arriving even when the
      // cursor leaves the window. Without this, releasing the button outside
      // the viewport left isDragging stuck and the drag overlay blocked all
      // further clicks.
      dividerRef.current?.setPointerCapture(e.pointerId);
      dragPointerIdRef.current = e.pointerId;
      const container = containerRef.current;
      const currentWidth = parseFloat(
        container?.style.getPropertyValue('--editor-width') || `${editorPaneWidth}`,
      );
      dragStartWidthRef.current = isNaN(currentWidth) ? editorPaneWidth : currentWidth;
      setIsDragging(true);
    },
    [containerRef, editorPaneWidth, setIsDragging],
  );

  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (e: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;

      const minWidth = DASHBOARD_PANE_MIN_WIDTH; // Standardized min-width for both panes
      const maxWidth = containerRect.width - minWidth;
      const constrainedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));

      // Direct DOM manipulation for buttery smooth performance
      container.style.setProperty('--editor-width', `${constrainedWidth}px`);
    };

    const endDrag = () => {
      setIsDragging(false);

      // Sync final state back to Zustand for persistence and breakpoint logic
      const container = containerRef.current;
      if (container) {
        const finalWidth = parseInt(container.style.getPropertyValue('--editor-width'));
        if (!isNaN(finalWidth)) {
          setEditorPaneWidth(finalWidth);
        }
      }
    };

    // Escape aborts the drag: the pane snaps back to the width it had when the
    // pointer went down. Without this a drag could only be committed — the
    // keyboard resize had a cancel path, the pointer one did not.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();

      const container = containerRef.current;
      const startWidth = dragStartWidthRef.current;
      if (container && startWidth !== null) {
        container.style.setProperty('--editor-width', `${startWidth}px`);
      }

      const pointerId = dragPointerIdRef.current;
      if (pointerId !== null && dividerRef.current?.hasPointerCapture(pointerId)) {
        dividerRef.current.releasePointerCapture(pointerId);
      }

      endDrag();
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('keydown', onKeyDown);
    // Safety nets: the browser can cancel the pointer stream (e.g. alt-tab,
    // OS gestures) and blur means we'll never see the pointerup — end the
    // drag instead of leaving the click-blocking overlay behind.
    document.addEventListener('pointercancel', endDrag);
    window.addEventListener('blur', endDrag);

    // Disable text selection and transitions while dragging
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', endDrag);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointercancel', endDrag);
      window.removeEventListener('blur', endDrag);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, setEditorPaneWidth, setIsDragging, containerRef]);

  return (
    <div
      ref={dividerRef}
      onPointerDown={onPointerDown}
      onDoubleClick={resetWidth}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          const direction = event.key === 'ArrowLeft' ? -1 : 1;
          setWidth(editorPaneWidth + direction * (event.shiftKey ? 40 : 10));
        }
        if (event.key === 'Home') {
          event.preventDefault();
          resetWidth();
        }
      }}
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={t('common.resize_workspace')}
      aria-valuemin={DASHBOARD_PANE_MIN_WIDTH}
      aria-valuemax={Math.max(
        DASHBOARD_PANE_MIN_WIDTH,
        Math.round(containerWidth - DASHBOARD_PANE_MIN_WIDTH),
      )}
      aria-valuenow={Math.round(editorPaneWidth)}
      title={`${t('common.resize_workspace')}. ${t('common.reset_workspace_split')}`}
      className={cn(
        'group relative z-50 flex w-1 cursor-col-resize items-center justify-center transition-colors',
        isDragging ? 'bg-primary' : 'bg-divider hover:bg-primary/50',
      )}
      style={{ touchAction: 'none' }}
    >
      {/* Hit area for easier grabbing */}
      <div className="absolute inset-y-0 -right-1 -left-1 w-3" />

      {/* Visual Handle */}
      <div
        className={cn(
          'bg-border pointer-events-none flex h-9 w-3 items-center justify-center rounded-full border transition-colors',
          isDragging ? 'bg-primary border-primary-strong' : 'bg-card',
        )}
      >
        <div className="flex flex-col gap-0.5">
          <div className="bg-muted-foreground/50 h-0.5 w-1 rounded-full" />
          <div className="bg-muted-foreground/50 h-0.5 w-1 rounded-full" />
          <div className="bg-muted-foreground/50 h-0.5 w-1 rounded-full" />
        </div>
      </div>
    </div>
  );
};
