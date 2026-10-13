import { type RefObject, useLayoutEffect, useState } from 'react';

import {
  DASHBOARD_PHONE_MAX_WIDTH,
  DASHBOARD_SPLIT_MIN_WIDTH,
} from '@/features/dashboard/layout/constants';

export type DashboardWorkspaceLayout = 'phone' | 'workspace' | 'split';

export const getDashboardWorkspaceLayout = (width: number): DashboardWorkspaceLayout =>
  width >= DASHBOARD_SPLIT_MIN_WIDTH
    ? 'split'
    : width > DASHBOARD_PHONE_MAX_WIDTH
      ? 'workspace'
      : 'phone';

export function useDashboardWorkspace(containerRef: RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState<{
    layout: DashboardWorkspaceLayout;
    width: number;
    measured: boolean;
  }>({ layout: 'phone', width: 0, measured: false });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateLayout = (width: number) => {
      const layout = getDashboardWorkspaceLayout(width);
      setState((current) =>
        current.layout === layout && current.width === width && current.measured
          ? current
          : { layout, width, measured: true },
      );
    };

    updateLayout(container.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) updateLayout(entry.contentRect.width);
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef]);

  return state;
}
