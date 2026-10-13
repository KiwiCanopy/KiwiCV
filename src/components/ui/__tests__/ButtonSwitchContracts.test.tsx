// @vitest-environment jsdom
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('Button disabledReason', () => {
  it('stays in the accessibility tree so the reason is announced', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled disabledReason="Add a page break first" onClick={onClick}>
        Move down
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Move down' });
    // A natively disabled button would not be queryable by role at all.
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.getAttribute('aria-disabled')).toBe('true');

    const describedBy = button.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toBe('Add a page break first');

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('still uses native disabled when there is no reason to convey', () => {
    render(<Button disabled>Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(true);
  });

  it('keeps a loading button in the tree so aria-busy and the label are observable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading loadingLabel="Saving" onClick={onClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('aria-busy')).toBe('true');

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards clicks when enabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Switch', () => {
  function Fixture({ onClick }: { onClick?: () => void }) {
    const [checked, setChecked] = useState(false);
    return (
      <Switch checked={checked} label="Show photo" onCheckedChange={setChecked} onClick={onClick} />
    );
  }

  it('toggles even when the consumer passes its own onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Fixture onClick={onClick} />);

    const toggle = screen.getByRole('switch', { name: 'Show photo' });
    expect(toggle.getAttribute('aria-checked')).toBe('false');

    await user.click(toggle);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(toggle.getAttribute('aria-checked')).toBe('true');
  });
});
