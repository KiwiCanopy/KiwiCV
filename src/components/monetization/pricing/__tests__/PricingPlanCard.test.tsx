// @vitest-environment jsdom
import { PricingPlanCard } from '@/components/monetization/pricing/PricingPlanCard';
import { passes } from '@/components/monetization/pricing/catalog';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

const recommendedPlan = passes.find((plan) => plan.recommended)!;
const plainPlan = passes.find((plan) => !plan.recommended)!;

function renderCard(
  overrides: { isProcessing?: string | null; plan?: (typeof passes)[number] } = {},
) {
  const handlePurchase = vi.fn();
  const utils = render(
    <PricingPlanCard
      category="passes"
      plan={overrides.plan ?? recommendedPlan}
      isProcessing={overrides.isProcessing ?? null}
      isSmallScreen={false}
      handlePurchase={handlePurchase}
    />,
  );
  return { handlePurchase, ...utils };
}

describe('PricingPlanCard', () => {
  it('purchases on click and keyboard when idle', async () => {
    const user = userEvent.setup();
    const { handlePurchase } = renderCard();

    const card = screen.getByRole('button', { name: /Buy now/i });
    await user.click(card);
    card.focus();
    await user.keyboard('{Enter}');

    expect(handlePurchase).toHaveBeenCalledTimes(2);
    expect(handlePurchase).toHaveBeenCalledWith(recommendedPlan.id);
  });

  it('blocks purchase while any card is processing, by mouse and by keyboard', async () => {
    const user = userEvent.setup();
    // Some OTHER card is mid-checkout; this one still shows "Buy now" but is
    // inert until it clears. This is the guard that replaced native `disabled`.
    const { handlePurchase } = renderCard({ plan: plainPlan, isProcessing: recommendedPlan.id });

    const card = screen.getByRole('button', { name: /Buy now/i });
    expect(card.getAttribute('aria-disabled')).toBe('true');

    await user.click(card);
    card.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(handlePurchase).not.toHaveBeenCalled();
  });

  it('marks only the actively-purchasing card busy', () => {
    renderCard({ plan: recommendedPlan, isProcessing: recommendedPlan.id });
    expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');
  });

  it('does not announce aria-busy on a sibling card during checkout', () => {
    renderCard({ plan: plainPlan, isProcessing: recommendedPlan.id });
    const card = screen.getByRole('button');
    expect(card.getAttribute('aria-disabled')).toBe('true');
    expect(card.getAttribute('aria-busy')).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderCard();
    expect((await axe(container)).violations).toEqual([]);
  });
});
