// @vitest-environment jsdom
import { LegalUpdateModal } from '@/components/modals/LegalUpdateModal';
import { DialogFrame } from '@/components/ui/DialogFrame';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const refreshProfile = vi.fn();
const addToast = vi.fn();
const eq = vi.fn(() => Promise.resolve({ error: null }));
const update = vi.fn(() => ({ eq }));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    // Never-accepted profile forces the consent gate open.
    profile: { accepted_privacy_at: null, accepted_terms_at: null },
    refreshProfile,
  }),
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/en/dashboard' }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { from: () => ({ update }) },
}));

vi.mock('@/store/ui/useToastStore', () => ({
  useToastStore: (selector: (s: { addToast: typeof addToast }) => unknown) =>
    selector({ addToast }),
}));

vi.mock('@/store/ui/useUIStore', () => ({
  useUIStore: (selector: (s: { firstTimeLanguageSelected: boolean }) => unknown) =>
    selector({ firstTimeLanguageSelected: true }),
}));

describe('LegalUpdateModal', () => {
  beforeEach(() => {
    refreshProfile.mockClear();
    addToast.mockClear();
    eq.mockClear();
    update.mockClear();
  });

  it('exposes an accessible blocking dialog named by its title', () => {
    render(<LegalUpdateModal />);
    expect(screen.getByRole('dialog', { name: /terms & privacy update/i })).toBeTruthy();
  });

  it('keeps the accept button disabled until consent is checked', async () => {
    const user = userEvent.setup();
    render(<LegalUpdateModal />);

    const accept = screen.getByRole('button', { name: /accept & continue/i }) as HTMLButtonElement;
    expect(accept.disabled).toBe(true);

    await user.click(screen.getByRole('checkbox'));
    expect(accept.disabled).toBe(false);
  });

  it('is non-dismissible: Escape does not close the consent gate', async () => {
    const user = userEvent.setup();
    render(<LegalUpdateModal />);

    expect(screen.getByRole('dialog', { name: /terms & privacy update/i })).toBeTruthy();
    await user.keyboard('{Escape}');
    // dismissible={false} must keep the blocking gate mounted.
    expect(screen.getByRole('dialog', { name: /terms & privacy update/i })).toBeTruthy();
  });

  it('persists consent and refreshes the profile on accept', async () => {
    const user = userEvent.setup();
    render(<LegalUpdateModal />);

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /accept & continue/i }));

    await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ accepted_terms: true, accepted_privacy: true }),
    );
    expect(eq).toHaveBeenCalledWith('id', 'user-1');
    await waitFor(() => expect(refreshProfile).toHaveBeenCalledTimes(1));
  });

  // #9: What's New, a post-sign-in export dialog or a restore prompt can open on
  // their own after this gate; none may take its scroll lock and focus.
  it('stays usable, and keeps the tick, when another dialog opens after it', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<LegalUpdateModal />);
    await user.click(screen.getByRole('checkbox'));

    await act(async () =>
      rerender(
        <>
          <LegalUpdateModal />
          <DialogFrame open onOpenChange={() => {}} title="Export">
            <button type="button">Export now</button>
          </DialogFrame>
        </>,
      ),
    );

    const gate = screen.getByRole('dialog', { name: /terms & privacy update/i });
    expect(gate.closest('[aria-hidden="true"]')).toBeNull();
    // Radix restores focus for the content a remount replaced a tick later.
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
    expect(gate.contains(document.activeElement)).toBe(true);
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
  });
});
