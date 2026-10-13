// @vitest-environment jsdom
import { ToastContainer } from '@/components/ui/Toast';
import { useToastStore } from '@/store/ui/useToastStore';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

afterEach(() => {
  useToastStore.getState().toasts.forEach(({ id }) => useToastStore.getState().removeToast(id));
  vi.useRealTimers();
});

describe('ToastContainer', () => {
  it('announces errors assertively and provides a named close action', async () => {
    const user = userEvent.setup();
    const { container } = render(<ToastContainer />);

    act(() => {
      useToastStore.getState().addToast('Backup failed', 'error', 0);
    });

    expect(screen.getByRole('alert').textContent).toContain('Backup failed');
    await user.click(screen.getByRole('button', { name: /Dismiss notification/ }));
    expect(screen.queryByText('Backup failed')).toBeNull();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('pauses automatic dismissal while the toast is being inspected', () => {
    vi.useFakeTimers();
    render(<ToastContainer />);

    act(() => {
      useToastStore.getState().addToast('Saved locally', 'success', 1000);
    });
    // The message appears twice: once in the persistent announcer, once in the
    // visible toast. The hover handlers live on the visible one.
    const visibleMessage = screen
      .getAllByText('Saved locally')
      .find((node) => node.tagName === 'P')!;
    const toast = visibleMessage.parentElement!;

    act(() => {
      vi.advanceTimersByTime(600);
      fireEvent.mouseEnter(toast);
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getAllByText('Saved locally').some((n) => n.tagName === 'P')).toBe(true);

    act(() => {
      fireEvent.mouseLeave(toast);
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryAllByText('Saved locally').some((n) => n.tagName === 'P')).toBe(false);
  });
});
