import { getDashboardWorkspaceLayout } from '@/features/dashboard/layout/useDashboardWorkspace';
import { describe, expect, it } from 'vitest';

describe('getDashboardWorkspaceLayout', () => {
  it.each([
    [320, 'phone'],
    [767, 'phone'],
    [768, 'workspace'],
    [1179, 'workspace'],
    [1180, 'split'],
    [1600, 'split'],
  ] as const)('maps a %ipx measured content width to %s', (width, expectedLayout) => {
    expect(getDashboardWorkspaceLayout(width)).toBe(expectedLayout);
  });
});
