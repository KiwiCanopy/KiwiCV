import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/utils/cn';

export type FloatingSide = 'top' | 'bottom' | 'left' | 'right';

/** Space between the anchor and the surface; an arrow needs room to sit in. */
const GAP = 6;
const GAP_WITH_ARROW = 12;
/** Closest the surface comes to a viewport edge. */
const VIEWPORT_PAD = 8;

const ARROW_CLASSES: Record<FloatingSide, string> = {
  top: 'top-full -translate-y-1/2 border-r border-b',
  bottom: 'bottom-full translate-y-1/2 border-l border-t',
  left: 'left-full -translate-x-1/2 border-t border-r',
  right: 'right-full translate-x-1/2 border-b border-l',
};

interface Placement {
  top: number;
  left: number;
  /** The side actually used, after flipping away from a viewport edge. */
  side: FloatingSide;
  /** How far clamping moved the surface off its ideal spot, so the arrow still points at the anchor. */
  shift: number;
}

interface FloatingTooltipProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'style' | 'id'
> {
  id: string;
  /** The element the surface is placed against, and the one an outside press ignores. */
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  side?: FloatingSide;
  /** Along a top/bottom side: centred on the anchor, or flush with its trailing edge. */
  align?: 'center' | 'end';
  arrow?: boolean;
  /** `group` for a surface holding controls of its own (WCAG 4.1.2: a tooltip cannot). */
  role?: 'tooltip' | 'group';
  /** Changing it re-measures an open surface — a tap re-asking, or new content. */
  remeasureKey?: unknown;
  /** Escape anywhere while open; swallowed so it does not also close an enclosing layer. */
  onDismiss?: () => void;
  /** A press outside both the anchor and the surface while open. */
  onOutsidePress?: () => void;
  /**
   * Where the surface is portalled; `body` when absent. A modal's own content, so
   * its focus trap does not bounce focus that enters the surface. Placement stays
   * inside it, since a transformed or clipping container bounds the surface.
   */
  container?: HTMLElement | null;
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * A tooltip surface portalled to `body` (or `container`), placed against `anchorRef`, flipped and
 * clamped into the viewport, and kept on its anchor through scroll and resize.
 * It renders while closed — `invisible`, so an `aria-describedby` pointing at it
 * resolves before the first hover; unmount it to drop it from the document.
 */
export function FloatingTooltip({
  id,
  anchorRef,
  open,
  side = 'top',
  align = 'center',
  arrow = false,
  role = 'tooltip',
  remeasureKey,
  onDismiss,
  onOutsidePress,
  container,
  ref,
  className,
  children,
  ...rest
}: FloatingTooltipProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      surfaceRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const measure = useCallback(() => {
    const anchor = anchorRef.current;
    const surface = surfaceRef.current;
    if (!anchor || !surface) return;
    const rect = anchor.getBoundingClientRect();
    // `clientWidth`, not `innerWidth`: the latter includes a vertical scrollbar.
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    // Scrolled out of view: a clamped surface would float over unrelated content.
    if (
      rect.bottom < 0 ||
      rect.top > viewportHeight ||
      rect.right < 0 ||
      rect.left > viewportWidth
    ) {
      setPlacement(null);
      return;
    }
    const { offsetWidth: width, offsetHeight: height } = surface;
    // In a container, `top: 0; left: 0` need not be the viewport origin: a
    // transformed ancestor is a `fixed` element's containing block. In `body` it is.
    let originX = 0;
    let originY = 0;
    if (container) {
      const box = surface.getBoundingClientRect();
      const style = getComputedStyle(surface);
      originX = box.left - (parseFloat(style.left) || 0);
      originY = box.top - (parseFloat(style.top) || 0);
    }
    const bounds = container?.getBoundingClientRect();
    const minX = Math.max(0, bounds?.left ?? 0) + VIEWPORT_PAD;
    const maxX = Math.min(viewportWidth, bounds?.right ?? viewportWidth) - VIEWPORT_PAD;
    const minY = Math.max(0, bounds?.top ?? 0) + VIEWPORT_PAD;
    const maxY = Math.min(viewportHeight, bounds?.bottom ?? viewportHeight) - VIEWPORT_PAD;
    const gap = arrow ? GAP_WITH_ARROW : GAP;
    const clamp = (value: number, size: number, min: number, max: number) =>
      Math.max(min, Math.min(value, max - size));

    let resolved = side;
    let top: number;
    let left: number;
    if (side === 'top' || side === 'bottom') {
      const above = rect.top - gap - height;
      const below = rect.bottom + gap;
      const fitsAbove = above >= minY;
      const fitsBelow = below + height <= maxY;
      if (side === 'bottom' && !fitsBelow && fitsAbove) resolved = 'top';
      if (side === 'top' && !fitsAbove && fitsBelow) resolved = 'bottom';
      top = clamp(resolved === 'top' ? above : below, height, minY, maxY);
      left = align === 'end' ? rect.right - width : rect.left + rect.width / 2 - width / 2;
    } else {
      top = clamp(rect.top + rect.height / 2 - height / 2, height, minY, maxY);
      left = side === 'left' ? rect.left - gap - width : rect.right + gap;
    }
    const clampedLeft = clamp(left, width, minX, maxX);
    setPlacement({
      top: top - originY,
      left: clampedLeft - originX,
      side: resolved,
      shift: clampedLeft - left,
    });
  }, [anchorRef, side, align, arrow, container]);

  useLayoutEffect(() => {
    // Measured before paint, so a stale position from a previous opening never shows.
    if (open) measure();
  }, [open, remeasureKey, measure]);

  useEffect(() => {
    if (!open) return;
    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    // Window capture runs before Radix's document-level Escape handler, so the
    // one Escape that closes this surface does not also close an enclosing layer.
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !onDismiss) return;
      event.stopPropagation();
      onDismiss();
    };
    const press = (event: PointerEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target) || surfaceRef.current?.contains(target)) return;
      onOutsidePress?.();
    };
    window.addEventListener('scroll', follow, true);
    window.addEventListener('resize', follow);
    window.addEventListener('keydown', escape, true);
    document.addEventListener('pointerdown', press);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', follow, true);
      window.removeEventListener('resize', follow);
      window.removeEventListener('keydown', escape, true);
      document.removeEventListener('pointerdown', press);
    };
  }, [open, measure, onDismiss, onOutsidePress, anchorRef]);

  const shown = open && placement !== null;
  const vertical = placement?.side === 'top' || placement?.side === 'bottom';

  return createPortal(
    <div
      {...rest}
      ref={setRefs}
      id={id}
      role={role}
      // Always set, so `measure` can read where the container puts the origin.
      style={shown ? { top: placement.top, left: placement.left } : { top: 0, left: 0 }}
      className={cn(
        'bg-popover border-border text-popover-foreground fixed z-[9999] border',
        shown ? 'visible' : 'invisible',
        className,
      )}
    >
      {children}
      {arrow && shown && (
        <div
          aria-hidden="true"
          style={
            vertical
              ? {
                  left: `calc(50% - ${placement.shift}px)`,
                  transform: 'translateX(-50%) rotate(45deg)',
                }
              : { top: '50%', transform: 'translateY(-50%) rotate(45deg)' }
          }
          className={cn('bg-popover border-border absolute h-2 w-2', ARROW_CLASSES[placement.side])}
        />
      )}
    </div>,
    container ?? document.body,
  );
}
