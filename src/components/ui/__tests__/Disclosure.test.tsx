// @vitest-environment jsdom
import { useState } from 'react';

import { Disclosure } from '@/components/ui/Disclosure';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

function Fixture() {
  const [open, setOpen] = useState(false);

  return (
    <Disclosure
      open={open}
      onOpenChange={setOpen}
      trigger="Profile"
      actions={<button type="button">Edit</button>}
    >
      <p>Profile fields</p>
    </Disclosure>
  );
}

describe('Disclosure', () => {
  it('exposes expanded state without nesting sibling actions', async () => {
    const user = userEvent.setup();
    const { container } = render(<Fixture />);
    const trigger = screen.getByRole('button', { name: 'Profile' });
    const action = screen.getByRole('button', { name: 'Edit' });

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(action.closest('button')?.parentElement).not.toBe(trigger);

    await user.click(trigger);

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Profile fields').parentElement?.hidden).toBe(false);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('toggles with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const trigger = screen.getByRole('button', { name: 'Profile' });

    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    await user.keyboard(' ');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
