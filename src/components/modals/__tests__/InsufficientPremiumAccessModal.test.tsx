// @vitest-environment jsdom
import { InsufficientPremiumAccessModal } from '@/components/modals/InsufficientPremiumAccessModal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// The sibling PricingDialog pulls in react-router hooks; it is not under test here.
vi.mock('@/components/monetization/PricingDialog', () => ({ PricingDialog: () => null }));

const track = vi.fn();
vi.mock('@/services/analytics', () => ({
  analytics: { track: (...args: unknown[]) => track(...args) },
  ANALYTICS_EVENTS: {
    PAYWALL_SHOWN: 'paywall_shown',
    PAYWALL_OPTION_SELECTED: 'paywall_option_selected',
    PAYWALL_CLOSED: 'paywall_closed',
  },
}));

function renderModal(overrides = {}) {
  const props = { isOpen: true, onClose: vi.fn(), ...overrides };
  render(<InsufficientPremiumAccessModal {...props} />);
  return props;
}

describe('InsufficientPremiumAccessModal', () => {
  it('exposes an accessible dialog named by its title', () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: /premium access required/i })).toBeTruthy();
  });

  it('opens pricing from the premium-pass action', async () => {
    const user = userEvent.setup();
    track.mockClear();
    renderModal();

    await user.click(screen.getByRole('button', { name: /premium pass/i }));
    expect(track).toHaveBeenCalledWith('paywall_option_selected', { mode: 'generic' });
  });

  /**
   * ⚠️ `limit` offers no action at all. It used to show a "Top Up Credits"
   * button — the only button it showed — and buying another Pass does nothing
   * for a daily allowance that is already spent.
   */
  it('offers no purchase action once the daily allowance is spent', () => {
    renderModal({ mode: 'limit' });
    expect(screen.queryByRole('button', { name: /premium pass/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /top up/i })).toBeNull();
  });

  it('reports PAYWALL_CLOSED with the x_button method when the close button is used', async () => {
    const user = userEvent.setup();
    track.mockClear();
    const { onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(track).toHaveBeenCalledWith('paywall_closed', { mode: 'generic', method: 'x_button' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when closed', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
