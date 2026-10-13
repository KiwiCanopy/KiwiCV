// @vitest-environment jsdom
/**
 * A failed persist must be perceivable at EVERY width.
 *
 * `SaveStatusLine` is `hidden lg:flex`. `display:none` removes an element from
 * the accessibility tree as well as the screen, so below 1024px its
 * `role="alert"` never fires and the failure is both invisible and unannounced.
 * The toast is the actual notice; these cases pin the two rules that make it
 * usable rather than maddening.
 */
import { useSaveFailureToast } from '@/features/dashboard/layout/useSaveFailureToast';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useToastStore } from '@/store/ui/useToastStore';
import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const Probe = () => {
  useSaveFailureToast();
  return null;
};

const setStatus = (status: 'saved' | 'error') =>
  act(() => {
    useResumeStore.getState().setSaveStatus(status);
  });

const toastMessages = () => useToastStore.getState().toasts.map((toast) => toast.message);

describe('a save failure is announced at every width', () => {
  beforeEach(() => {
    setStatus('saved');
    act(() => {
      useToastStore.setState({ toasts: [] });
    });
  });

  it('raises a toast when the status turns to error', () => {
    render(<Probe />);
    expect(toastMessages()).toEqual([]);

    setStatus('error');

    expect(toastMessages()).toEqual(['dashboard.save_status.error']);
  });

  it('does not stack a toast on every re-render while the failure persists', () => {
    const { rerender } = render(<Probe />);
    setStatus('error');

    // ⚠️ Re-RENDER, not re-set. Writing the same `saveStatus` leaves the effect's
    // dependency unchanged, so the effect never re-runs and this case would pass
    // with no guard at all — the first version of this test did exactly that and
    // proved nothing. `useTranslation` hands back a fresh `t` each render, so an
    // ordinary re-render IS what re-runs the effect while the status sits at
    // `error`. That is the real "toast per keystroke" path.
    rerender(<Probe />);
    rerender(<Probe />);

    expect(toastMessages()).toHaveLength(1);
  });

  it('re-arms after a save succeeds, because the second failure still matters', () => {
    render(<Probe />);
    setStatus('error');
    setStatus('saved');
    setStatus('error');

    expect(toastMessages()).toHaveLength(2);
  });
});
