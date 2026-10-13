import { type RefObject, useEffect, useLayoutEffect, useState } from 'react';

/**
 * The nearest ancestor that actually scrolls, or `null` for the viewport. The app shell scrolls
 * `<main>`, not the window, and a viewport-rooted observer's margin cannot reach past that clip.
 */
export function scrollParent(node: HTMLElement): HTMLElement | null {
  for (let el = node.parentElement; el; el = el.parentElement) {
    // Overflow alone is not enough: `overflow-x: hidden` computes `overflow-y` to `auto` too.
    const scrolls = /(auto|scroll)/.test(getComputedStyle(el).overflowY);
    if (scrolls && el.scrollHeight > el.clientHeight) return el;
  }
  return null;
}

interface NearViewportOptions {
  /** CSS margin around the scroll container's visible area, e.g. `'600px 0px'`. */
  margin?: string;
  /** Latch `true` on the first approach and stop observing. */
  once?: boolean;
}

/**
 * Whether `ref` is within `margin` of the visible area of its scroll container. Stays `false`
 * where `IntersectionObserver` is unavailable. Follows `ref` to a new node (a keyed remount), and
 * the new node starts `false` and earns its own approach, `once` included — but only from the
 * commit after the swap: that commit's passive effects still see the old node's value. A caller
 * that must start over on a new input keys the whole component instead.
 */
export function useNearViewport(
  ref: RefObject<HTMLElement | null>,
  { margin = '0px', once = false }: NearViewportOptions = {},
): boolean {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [near, setNear] = useState<{ node: HTMLElement; value: boolean } | null>(null);

  // A keyed remount swaps `ref.current` without changing `ref`, so re-read it after every commit;
  // setting the same node bails out, so this cannot loop. Layout, so the old node's value is
  // corrected before paint and before any passive effect acts on it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    setNode(ref.current);
  });

  useEffect(() => {
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        // One target, so the last entry is its current state.
        const intersecting = entries.at(-1)?.isIntersecting ?? false;
        if (once) {
          if (!intersecting) return;
          observer.disconnect();
        }
        setNear({ node, value: intersecting });
      },
      { root: scrollParent(node), rootMargin: margin },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, [node, margin, once]);

  return near?.node === node && near.value;
}
