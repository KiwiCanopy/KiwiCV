// @vitest-environment jsdom
import { BillingSection } from '@/pages/AccountPage/components/BillingSection';
import type { Profile } from '@/providers/AuthContext';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

function renderBilling(overrides: Partial<Parameters<typeof BillingSection>[0]> = {}) {
  const openPricing = vi.fn();
  render(
    <BillingSection
      profile={{ isPremium: false } as Profile}
      isVerifyingPayment={false}
      openPricing={openPricing}
      formatUIDate={(d) => d}
      {...overrides}
    />,
  );
  return { openPricing };
}

/**
 * ⚠️ One card. This section held a pass card beside a credits-balance card, and
 * the processing state was routed to whichever tier was mid-verification — hence
 * the old `verifyingType` prop. With credits removed there is one card, one CTA
 * and one thing a payment can be verifying, so the routing is gone rather than
 * simplified.
 */
describe('BillingSection', () => {
  it('opens the pricing surface from the premium CTA', async () => {
    const user = userEvent.setup();
    const { openPricing } = renderBilling();

    await user.click(screen.getByRole('button', { name: /get premium/i }));
    expect(openPricing).toHaveBeenCalled();
  });

  it('replaces the CTA with a processing state while a payment is verifying', () => {
    renderBilling({ isVerifyingPayment: true });
    expect(screen.queryByRole('button', { name: /get premium/i })).toBeNull();
    expect(screen.getByText(/processing/i)).toBeTruthy();
  });

  it('offers no credits balance or top-up', () => {
    renderBilling();
    expect(screen.queryByRole('button', { name: /top up/i })).toBeNull();
    expect(screen.queryByText(/credit/i)).toBeNull();
  });
});
