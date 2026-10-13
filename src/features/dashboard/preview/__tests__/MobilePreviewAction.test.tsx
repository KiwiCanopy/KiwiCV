// @vitest-environment jsdom
import { MobilePreviewAction } from '@/features/dashboard/preview/MobilePreviewAction';
import { useUIStore } from '@/store/ui/useUIStore';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTypst', () => ({ warmTypst: vi.fn(async () => {}) }));

describe('MobilePreviewAction', () => {
  afterEach(() => {
    act(() => useUIStore.getState().setSidebarOpen(false));
  });

  // The pill is z-[60], above the phone drawer (Sheet, z-50).
  it('steps aside while the sidebar drawer is open', () => {
    render(<MobilePreviewAction />);
    expect(screen.getByRole('button', { name: /preview/i })).toBeTruthy();

    act(() => useUIStore.getState().setSidebarOpen(true));
    expect(screen.queryByRole('button', { name: /preview/i })).toBeNull();

    act(() => useUIStore.getState().setSidebarOpen(false));
    expect(screen.getByRole('button', { name: /preview/i })).toBeTruthy();
  });
});
