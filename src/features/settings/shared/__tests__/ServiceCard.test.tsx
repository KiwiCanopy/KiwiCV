// @vitest-environment jsdom
import { ServiceCard } from '@/features/settings/shared/ServiceCard';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

function renderCard(props: Partial<Parameters<typeof ServiceCard>[0]> = {}) {
  const onToggle = vi.fn();
  const utils = render(
    <ServiceCard
      title="GitHub"
      description="Back up to a repo."
      icon={<span>icon</span>}
      isEnabled={false}
      onToggle={onToggle}
      {...props}
    />,
  );
  return { onToggle, ...utils };
}

describe('ServiceCard', () => {
  it('exposes the toggle as a switch that reports its state', () => {
    renderCard({ isEnabled: true });
    const toggle = screen.getByRole('switch', { name: 'GitHub' });
    expect(toggle.getAttribute('aria-checked')).toBe('true');
  });

  it('flips the switch exactly once per click', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderCard({ onToggle, isEnabled: false });

    await user.click(screen.getByRole('switch', { name: 'GitHub' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('does not fire the card body when the switch is clicked on a locked card', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onLockedClick = vi.fn();
    // The card root is clickable while locked. jsdom does not honour the
    // pointer-events-none guard, so this asserts the real defence: the switch's
    // stopPropagation keeps its click from bubbling into the locked handler.
    renderCard({ onToggle, isLocked: true, onLockedClick });

    await user.click(screen.getByRole('switch', { name: 'GitHub' }));
    expect(onLockedClick).not.toHaveBeenCalled();
  });

  it('runs the edit action from its button', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    renderCard({ onEdit, editLabel: 'Edit' });

    await user.click(screen.getByRole('button', { name: /Edit/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('surfaces the grant-permission action when access is required', async () => {
    const user = userEvent.setup();
    const onActionRequiredClick = vi.fn();
    renderCard({ isActionRequired: true, onActionRequiredClick });

    await user.click(screen.getByRole('button', { name: /grant/i }));
    expect(onActionRequiredClick).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderCard({ isEnabled: true, onEdit: vi.fn(), editLabel: 'Edit' });
    expect((await axe(container)).violations).toEqual([]);
  });
});
