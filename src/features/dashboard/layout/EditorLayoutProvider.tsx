import React, { useLayoutEffect, useRef, useState } from 'react';

import {
  EditorLayoutContext,
  type EditorLayoutContextValue,
} from '@/features/dashboard/layout/EditorLayoutContext';

interface EditorLayoutProviderProps {
  children: React.ReactNode;
  /** Classes for the measured element. */
  className?: string;
  /**
   * Filled with the measured element, for callers that also need to scroll it.
   * The provider owns the node, so a second `ref` on the same div would be a
   * second source of truth.
   */
  elementRef?: React.RefObject<HTMLDivElement | null>;
}

const deriveLayout = (width: number): EditorLayoutContextValue => ({
  width,
  isStandard: width > 560,
  isSocial: width > 650,
});

/**
 * Publishes the width of **the box its children actually get** — `contentRect`,
 * so padding on the measured element is already deducted.
 *
 * ⚠️ It must wrap that box, never the whole editor pane. The pane also holds the
 * 246px section rail, so a provider around the pane tells a ~600px entry column
 * it has 900px and `ProfileItem` picks its twelve-column social row for a space
 * that cannot hold it. One provider per measured box: the editor's scrolling
 * entry column mounts one beside the rail, and the Design tab mounts another.
 *
 * The Design tab's provider deliberately sits *outside* its scroller's padding,
 * which keeps its measurement byte-for-byte what it was before the rail existed.
 * Design has no rail, nothing there is mis-measured, and re-tuning seven design
 * consumers is not this fix's job.
 */
export const EditorLayoutProvider = ({
  children,
  className,
  elementRef,
}: EditorLayoutProviderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<EditorLayoutContextValue>(() => {
    const isSSR = typeof window === 'undefined';
    const isProbablyDesktop = !isSSR && window.innerWidth >= 1024;

    return deriveLayout(isProbablyDesktop ? 600 : 0);
  });

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const width = entry.contentRect.width;

      // ⚠️ Both dashboard tab layers stay mounted; `LeftPane` hides the
      // inactive one with `hidden`, and a `display:none` element measures 0.
      // Applying that would collapse every consumer of the hidden layer to its
      // narrowest layout, so switching tabs would rebuild the layout twice.
      // Hold the last real measurement instead — the observer still reports the
      // true width the moment the layer is shown again.
      if (width <= 0) return;

      setLayout(deriveLayout(width));
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <EditorLayoutContext.Provider value={layout}>
      <div
        ref={(node) => {
          containerRef.current = node;
          if (elementRef) elementRef.current = node;
        }}
        data-editor-measured-column=""
        className={className}
      >
        {children}
      </div>
    </EditorLayoutContext.Provider>
  );
};
