// @vitest-environment jsdom
import { createRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { fireEvent, render, screen } from '@testing-library/react';
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

describe('Button disabledReasonDisplay="tooltip"', () => {
  const Row = ({ refused, onClick }: { refused: boolean; onClick?: () => void }) => (
    <Button
      title="Add a page break"
      disabled={refused}
      disabledReason={refused ? 'Not on the first section' : undefined}
      disabledReasonDisplay="tooltip"
      onClick={onClick}
    >
      Page break
    </Button>
  );

  it('puts the reason in a tooltip, not under the button, and opens it on tap', () => {
    const onClick = vi.fn();
    render(<Row refused onClick={onClick} />);

    const button = screen.getByRole('button', { name: 'Page break' });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    // The native title would stack a second tooltip on the reason.
    expect(button.hasAttribute('title')).toBe(false);
    const tooltip = document.getElementById(button.getAttribute('aria-describedby')!)!;
    expect(tooltip.getAttribute('role')).toBe('tooltip');
    expect(tooltip.textContent).toBe('Not on the first section');
    // Not a sibling in the row: portalled to body.
    expect(button.parentElement!.contains(tooltip)).toBe(false);

    expect(tooltip.classList.contains('invisible')).toBe(true);
    // A bare click, with no focus: touch Safari does not focus a tapped button.
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(tooltip.classList.contains('visible')).toBe(true);
  });

  it('still forwards the consumer’s ref and focus handlers while refused', () => {
    const ref = createRef<HTMLButtonElement>();
    const onFocus = vi.fn();
    const onMouseEnter = vi.fn();
    render(
      <Button
        ref={ref}
        disabled
        disabledReason="Not on the first section"
        disabledReasonDisplay="tooltip"
        onFocus={onFocus}
        onMouseEnter={onMouseEnter}
      >
        Page break
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Page break' });
    expect(ref.current).toBe(button);
    fireEvent.focus(button);
    fireEvent.mouseEnter(button);
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onMouseEnter).toHaveBeenCalledOnce();
    const tooltip = document.getElementById(button.getAttribute('aria-describedby')!)!;
    expect(tooltip.classList.contains('visible')).toBe(true);
  });

  it('shows no tooltip for a reason on a button that is not disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button
        title="Add a page break"
        disabledReason="Stray reason"
        disabledReasonDisplay="tooltip"
        onClick={onClick}
      >
        Page break
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Page break' });
    expect(button.hasAttribute('aria-describedby')).toBe(false);
    expect(button.getAttribute('title')).toBe('Add a page break');
    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('keeps the same button node while the reason comes and goes', () => {
    const { rerender } = render(<Row refused={false} />);
    const before = screen.getByRole('button', { name: 'Page break' });
    expect(before.getAttribute('title')).toBe('Add a page break');

    rerender(<Row refused />);
    expect(screen.getByRole('button', { name: 'Page break' })).toBe(before);
    rerender(<Row refused={false} />);
    expect(screen.getByRole('button', { name: 'Page break' })).toBe(before);
    expect(before.hasAttribute('aria-describedby')).toBe(false);
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
