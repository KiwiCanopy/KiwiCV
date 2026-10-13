// @vitest-environment jsdom
import { type MouseEvent } from 'react';

import { DialogFrame } from '@/components/ui/DialogFrame';
import { InfoBox } from '@/components/ui/InfoBox';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('InfoBox', () => {
  it('names its trigger', () => {
    render(
      <InfoBox content="Shown on the exported PDF">
        <span aria-hidden="true">?</span>
      </InfoBox>,
    );

    expect(screen.getByRole('button', { name: 'More information' })).toBeTruthy();
  });

  it('accepts a specific label', () => {
    render(
      <InfoBox content="Shown on the exported PDF" label="About the PDF footer">
        <span aria-hidden="true">?</span>
      </InfoBox>,
    );

    expect(screen.getByRole('button', { name: 'About the PDF footer' })).toBeTruthy();
  });

  it('lets a visible child label win, so the accessible name contains it', () => {
    render(
      <InfoBox content="Where this column renders" label="main">
        <span>main</span>
      </InfoBox>,
    );

    // WCAG 2.5.3: a trigger showing "main" must not be named "More information".
    expect(screen.getByRole('button', { name: 'main' })).toBeTruthy();
  });

  it('opens on click without swallowing the event', async () => {
    // The trigger used to preventDefault and stopPropagation unconditionally,
    // to survive being nested inside a <label> or a <Link>. That masked the
    // invalid nesting and left the Data Management link dead to a mouse. Every
    // consumer now renders the trigger as a sibling, so the suppression is
    // gone and an ancestor's own handler must still run.
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    render(
      <div onClick={onClick}>
        <InfoBox content="Backups live in your own cloud">
          <span aria-hidden="true">?</span>
        </InfoBox>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'More information' }));

    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('tooltip').textContent).toContain('Backups live in your own cloud');
  });

  it('names an interactive surface after its trigger', async () => {
    const user = userEvent.setup();
    render(
      <InfoBox content="Backups live in your own cloud" label="About backups" interactive>
        <span aria-hidden="true">?</span>
      </InfoBox>,
    );

    await user.click(screen.getByRole('button', { name: 'About backups' }));

    expect(screen.getByRole('group', { name: 'About backups' })).toBeTruthy();
  });
});

describe('InfoBox Escape', () => {
  it('closes a hover-opened tooltip without taking focus from where it is', async () => {
    const user = userEvent.setup();
    render(
      <>
        <input aria-label="Elsewhere" />
        <InfoBox content="Backups live in your own cloud" interactive>
          <span aria-hidden="true">?</span>
        </InfoBox>
      </>,
    );
    const elsewhere = screen.getByRole('textbox', { name: 'Elsewhere' });
    await user.click(elsewhere);

    await user.hover(screen.getByRole('button', { name: 'More information' }));
    expect(screen.getByRole('group')).toBeTruthy();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('group')).toBeNull();
    expect(document.activeElement).toBe(elsewhere);
  });

  it('returns focus to the trigger when it was inside the tooltip, and stays closed', async () => {
    const user = userEvent.setup();
    render(
      <InfoBox content={<button type="button">Learn more</button>} interactive>
        <span aria-hidden="true">?</span>
      </InfoBox>,
    );
    const trigger = screen.getByRole('button', { name: 'More information' });

    await user.click(trigger);
    act(() => screen.getByRole('button', { name: 'Learn more' }).focus());
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('group')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});

describe('InfoBox keyboard bridge into a portalled interactive tooltip', () => {
  const renderInteractive = () =>
    render(
      <>
        <InfoBox
          interactive
          content={
            <>
              <a href="#design">Open design</a>
              <button type="button">Learn more</button>
            </>
          }
        >
          <span aria-hidden="true">?</span>
        </InfoBox>
        <input aria-label="Next field" />
      </>,
    );
  const trigger = () => screen.getByRole('button', { name: 'More information' });

  it('moves Tab from the trigger to the first control inside', async () => {
    const user = userEvent.setup();
    renderInteractive();
    await user.tab();
    expect(document.activeElement).toBe(trigger());

    await user.tab();

    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Open design' }));
    expect(screen.getByRole('group')).toBeTruthy();
  });

  it('moves ArrowDown from the trigger to the first control inside', async () => {
    const user = userEvent.setup();
    renderInteractive();
    await user.tab();

    await user.keyboard('{ArrowDown}');

    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Open design' }));
  });

  it('returns Shift+Tab from the first control to the trigger, still open', async () => {
    const user = userEvent.setup();
    renderInteractive();
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Open design' }));

    await user.tab({ shift: true });

    expect(document.activeElement).toBe(trigger());
    expect(screen.getByRole('group')).toBeTruthy();
  });

  it('closes on Tab past the last control and focuses what follows the trigger', async () => {
    const user = userEvent.setup();
    renderInteractive();
    await user.tab();
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Learn more' }));

    await user.tab();

    expect(screen.queryByRole('group')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Next field' }));
  });

  it('closes on Escape inside and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    renderInteractive();
    await user.tab();
    await user.tab();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('group')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });
});

describe('InfoBox hover grace (WCAG 1.4.13)', () => {
  afterEach(() => vi.useRealTimers());
  const isShown = (tooltip: HTMLElement) => !tooltip.className.includes('invisible');

  it('keeps a non-interactive tooltip open while the pointer rests on it', () => {
    vi.useFakeTimers();
    render(
      <InfoBox content="Shown on the exported PDF">
        <span aria-hidden="true">?</span>
      </InfoBox>,
    );
    const button = screen.getByRole('button', { name: 'More information' });
    fireEvent.mouseEnter(button);
    const tooltip = screen.getByRole('tooltip');
    expect(isShown(tooltip)).toBe(true);

    fireEvent.mouseLeave(button);
    fireEvent.mouseEnter(tooltip);
    act(() => vi.advanceTimersByTime(500));
    expect(isShown(tooltip)).toBe(true);

    fireEvent.mouseLeave(tooltip);
    act(() => vi.advanceTimersByTime(500));
    expect(isShown(tooltip)).toBe(false);
  });

  it('stays open after the pointer leaves while the trigger has focus (persistent)', () => {
    vi.useFakeTimers();
    render(
      <InfoBox content="Shown on the exported PDF">
        <span aria-hidden="true">?</span>
      </InfoBox>,
    );
    const button = screen.getByRole('button', { name: 'More information' });
    act(() => button.focus());
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    act(() => vi.advanceTimersByTime(500));

    expect(isShown(screen.getByRole('tooltip'))).toBe(true);
  });

  it('stays open after the pointer leaves while focus is inside an interactive one', () => {
    vi.useFakeTimers();
    render(
      <InfoBox interactive content={<button type="button">Learn more</button>}>
        <span aria-hidden="true">?</span>
      </InfoBox>,
    );
    const button = screen.getByRole('button', { name: 'More information' });
    fireEvent.mouseEnter(button);
    act(() => screen.getByRole('button', { name: 'Learn more' }).focus());
    fireEvent.mouseLeave(button);
    act(() => vi.advanceTimersByTime(500));

    expect(screen.getByRole('group')).toBeTruthy();
  });
});

describe('InfoBox description before the first focus', () => {
  it('points aria-describedby at the hint while closed', () => {
    render(
      <InfoBox content="Shown on the exported PDF">
        <span aria-hidden="true">?</span>
      </InfoBox>,
    );
    const describedBy = screen
      .getByRole('button', { name: 'More information' })
      .getAttribute('aria-describedby');

    expect(describedBy && document.getElementById(describedBy)?.textContent).toBe(
      'Shown on the exported PDF',
    );
  });
});

describe('InfoBox tooltip surface focused by a click on its text', () => {
  const setup = async () => {
    const user = userEvent.setup();
    render(
      <>
        <InfoBox interactive content={<button type="button">Learn more</button>}>
          <span aria-hidden="true">?</span>
        </InfoBox>
        <input aria-label="Next field" />
      </>,
    );
    await user.tab();
    act(() => screen.getByRole('group').focus());
    return user;
  };

  it('returns Shift+Tab from the surface to the trigger', async () => {
    const user = await setup();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'More information' }));
  });

  it('exits forward from the surface to what follows the trigger', async () => {
    const user = await setup();
    await user.tab();
    expect(screen.queryByRole('group')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Next field' }));
  });
});

describe('InfoBox inside a modal', () => {
  const renderInDialog = () =>
    render(
      <DialogFrame open onOpenChange={() => {}} title="Export">
        <InfoBox interactive content={<button type="button">Learn more</button>}>
          <span aria-hidden="true">?</span>
        </InfoBox>
      </DialogFrame>,
    );

  it('portals the tooltip into the dialog, inside its focus trap', async () => {
    const user = userEvent.setup();
    renderInDialog();
    await user.click(screen.getByRole('button', { name: 'More information' }));

    expect(screen.getByRole('dialog').contains(screen.getByRole('group'))).toBe(true);
  });

  it('moves Tab from the trigger into the tooltip without the focus scope wrapping it', async () => {
    const user = userEvent.setup();
    renderInDialog();
    const trigger = screen.getByRole('button', { name: 'More information' });
    act(() => trigger.focus());

    await user.tab();

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Learn more' }));
  });

  it('returns Shift+Tab from the tooltip to the trigger', async () => {
    const user = userEvent.setup();
    renderInDialog();
    const trigger = screen.getByRole('button', { name: 'More information' });
    act(() => trigger.focus());
    await user.tab();

    await user.tab({ shift: true });

    expect(document.activeElement).toBe(trigger);
  });
});

describe('InfoBox forward exit skips aria-hidden controls', () => {
  it('lands on the first control that is not hidden from assistive tech', async () => {
    const user = userEvent.setup();
    render(
      <>
        <InfoBox interactive content={<button type="button">Learn more</button>}>
          <span aria-hidden="true">?</span>
        </InfoBox>
        <div aria-hidden="true">
          <button type="button">Hidden</button>
        </div>
        <input aria-label="Next field" />
      </>,
    );
    await user.tab();
    await user.tab();

    await user.tab();

    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Next field' }));
  });
});
