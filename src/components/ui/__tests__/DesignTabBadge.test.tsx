// @vitest-environment jsdom
import { DesignTabBadge } from '@/components/ui/DesignTabBadge';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const setSearchParams = vi.fn();

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams(''), setSearchParams],
}));

describe('DesignTabBadge', () => {
  it('switches to the design tab when clicked', async () => {
    const user = userEvent.setup();
    render(<DesignTabBadge label="Layout" group="layout" targetId="section-order" />);

    await user.click(screen.getByRole('button', { name: /layout/i }));

    expect(setSearchParams).toHaveBeenCalledTimes(1);
    const next = setSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(next.get('tab')).toBe('design');
    expect(next.get('designSection')).toBe('layout');
    expect(next.get('designFocus')).toBe('section-order');
  });
});
