// @vitest-environment jsdom
import { useState } from 'react';

import { DialogFrame, DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

function Fixture(props: {
  busy?: boolean;
  closeLabel?: string;
  dismissible?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { onOpenChange = () => {}, ...frameProps } = props;

  return (
    <DialogFrame
      open
      onOpenChange={onOpenChange}
      title="Back up"
      description="Save a copy."
      {...frameProps}
    >
      <p>Body</p>
    </DialogFrame>
  );
}

describe('DialogFrame', () => {
  it('names the dialog and its close control', async () => {
    const { container } = render(<Fixture />);

    expect(screen.getByRole('dialog', { name: 'Back up' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeTruthy();
    expect((await axe(container)).violations).toEqual([]);
  });

  /**
   * ⚠️ Both rungs, because the prop is optional now. The default is what makes
   * a dialog written tomorrow announce itself correctly; the override is the
   * rung `LanguageOnboardingModal` stands on, which resolves through its own
   * `translate` before a language has been chosen.
   */
  it('takes an explicit closeLabel over the default', () => {
    render(<Fixture closeLabel="Zurueck zur Auswahl" />);

    expect(screen.getByRole('button', { name: 'Zurueck zur Auswahl' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Close dialog' })).toBeNull();
  });

  it('closes on Escape and on the close button when idle', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Fixture onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(onOpenChange).toHaveBeenCalledWith(false, 'close-button');

    onOpenChange.mockClear();
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false, 'escape');
  });

  it('keeps the close control focusable but inert while busy', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Fixture busy onOpenChange={onOpenChange} />);

    const close = screen.getByRole('button', { name: 'Close dialog' });
    expect(close.getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole('dialog').getAttribute('aria-busy')).toBe('true');

    close.focus();
    expect(document.activeElement).toBe(close);

    await user.click(close);
    await user.keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('blocks Escape when it becomes busy after mount', async () => {
    // Radix registers the Escape handler once; a mount-time closure would miss a
    // later in-flight lock and let Escape dismiss a busy dialog (e.g. a delete
    // mid-flight). The handler must read the latest `busy`.
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    function Toggling() {
      const [busy, setBusy] = useState(false);
      return (
        <DialogFrame open busy={busy} onOpenChange={onOpenChange} title="Back up">
          <button type="button" onClick={() => setBusy(true)}>
            Start
          </button>
        </DialogFrame>
      );
    }

    render(<Toggling />);
    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('omits the close control when not dismissible, without claiming to be busy', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Fixture dismissible={false} onOpenChange={onOpenChange} />);

    expect(screen.queryByRole('button', { name: 'Close dialog' })).toBeNull();
    expect(screen.getByRole('dialog').getAttribute('aria-busy')).toBeNull();

    await user.keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('hands its scroll region over when the dialog owns its own column', () => {
    // `scrollable={false}` + `innerClassName` is the escape hatch for dialogs
    // that pin a header over a `flex-1` body instead of scrolling as a whole.
    render(
      <DialogFrame
        open
        onOpenChange={() => {}}
        title="Back up"
        scrollable={false}
        innerClassName="flex max-h-[80vh] flex-col"
      >
        <p>Body</p>
      </DialogFrame>,
    );

    const region = screen.getByRole('dialog').querySelector('.custom-scrollbar');
    expect(region?.className).toContain('flex-col');
    expect(region?.className).toContain('overflow-hidden');
    expect(region?.className).not.toContain('h-responsive');
  });

  describe('header mode', () => {
    function HeaderFixture(props: {
      onOpenChange?: (open: boolean, reason?: string) => void;
      busy?: boolean;
      dismissible?: boolean;
    }) {
      const { onOpenChange = () => {}, ...frameProps } = props;

      return (
        <DialogFrame
          open
          onOpenChange={onOpenChange}
          {...frameProps}
          header={
            <div>
              <DialogFrameTitle>Upgrade</DialogFrameTitle>
              <DialogFrameDescription>Pick a plan.</DialogFrameDescription>
              <button type="button">Passes</button>
            </div>
          }
        >
          <p>Body</p>
        </DialogFrame>
      );
    }

    it('takes its accessible name from the visible heading, with no second copy', async () => {
      const { container } = render(<HeaderFixture />);

      expect(screen.getByRole('dialog', { name: 'Upgrade' })).toBeTruthy();
      // The visible heading is the name. A regression here means an sr-only
      // title crept back in alongside it.
      expect(screen.getAllByText('Upgrade')).toHaveLength(1);
      expect(screen.getAllByText('Pick a plan.')).toHaveLength(1);
      expect((await axe(container)).violations).toEqual([]);
    });

    it('still owns the close control', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<HeaderFixture onOpenChange={onOpenChange} />);

      await user.click(screen.getByRole('button', { name: 'Close dialog' }));
      expect(onOpenChange).toHaveBeenCalledWith(false, 'close-button');
    });

    it('honours busy and dismissible the same way the default shape does', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const { unmount } = render(<HeaderFixture busy onOpenChange={onOpenChange} />);

      expect(
        screen.getByRole('button', { name: 'Close dialog' }).getAttribute('aria-disabled'),
      ).toBe('true');
      await user.click(screen.getByRole('button', { name: 'Close dialog' }));
      await user.keyboard('{Escape}');
      expect(onOpenChange).not.toHaveBeenCalled();
      unmount();

      render(<HeaderFixture dismissible={false} onOpenChange={onOpenChange} />);
      expect(screen.queryByRole('button', { name: 'Close dialog' })).toBeNull();
      await user.keyboard('{Escape}');
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  /**
   * ⚠️ **Every case here presses a key.** `fireEvent.click` cannot see this
   * defect: it never gives the opener focus, so there is nothing to lose and
   * `document.activeElement` is `<body>` before *and* after.
   *
   * ⚠️ Assertions go through `waitFor`. Radix restores focus inside a
   * `setTimeout(…, 0)` in `FocusScope`'s cleanup, so a synchronous check reads
   * the moment before the restore and passes on broken code.
   */
  /**
   * ⚠️ The anchor is snapshotted in `handleOpenAutoFocus`, so what matters is
   * that the snapshot is REFRESHED on every open — a store singleton like
   * `ConfirmModal` is reused across ~18 call sites with a different anchor each
   * time. Deleting that one assignment left every existing suite green
   * (measured during review).
   *
   * ⚠️ Both cases blur first. After a restore, focus is ON the anchor, so the
   * next open captures the anchor as its opener and the first rung answers
   * before the snapshot is ever consulted — a test that skips the blur is
   * testing the wrong rung and passes either way.
   */
  describe('the anchor snapshot is taken fresh on each open', () => {
    function ReopenFixture({ anchorId }: { anchorId: string }) {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" id="first" onClick={() => setOpen(true)}>
            First
          </button>
          <button type="button" id="second">
            Second
          </button>
          <DialogFrame
            open={open}
            onOpenChange={setOpen}
            restoreFocusTo={() => document.getElementById(anchorId)}
            title="Back up"
          >
            <button type="button" onClick={() => setOpen(false)}>
              Apply
            </button>
          </DialogFrame>
        </>
      );
    }

    it('uses the anchor from the latest open, not the first', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ReopenFixture anchorId="first" />);

      const open = document.getElementById('first') as HTMLElement;
      open.focus();
      await user.keyboard('{Enter}');
      await user.click(await screen.findByRole('button', { name: 'Apply' }));
      await waitFor(() => expect(document.activeElement).toBe(open));

      // The opener must be gone from focus, or it answers before the anchor.
      rerender(<ReopenFixture anchorId="second" />);
      (document.activeElement as HTMLElement).blur();
      open.click();

      await user.click(await screen.findByRole('button', { name: 'Apply' }));
      await waitFor(() => {
        expect(document.activeElement).toBe(document.getElementById('second'));
      });
    });
  });

  describe('focus restoration on close', () => {
    function RestoreFixture({
      role,
      restoreFocusTo,
      onOpenAutoFocus,
      removesOpener = false,
      disablesOpener = false,
    }: {
      role?: 'dialog' | 'alertdialog';
      restoreFocusTo?: () => HTMLElement | null | undefined;
      onOpenAutoFocus?: (event: Event) => void;
      /** The dialog's action deletes the control that opened it. */
      removesOpener?: boolean;
      /** The dialog's action leaves the opener mounted but inert. */
      disablesOpener?: boolean;
    }) {
      const [open, setOpen] = useState(false);
      const [openerPresent, setOpenerPresent] = useState(true);
      const [openerInert, setOpenerInert] = useState(false);

      return (
        <>
          <button type="button" id="before">
            Before
          </button>
          {openerPresent && (
            <button
              type="button"
              id="opener"
              aria-disabled={openerInert || undefined}
              onClick={() => setOpen(true)}
            >
              Open
            </button>
          )}
          <button type="button" id="fallback">
            Fallback
          </button>
          <DialogFrame
            role={role}
            open={open}
            onOpenChange={(next) => setOpen(next)}
            onOpenAutoFocus={onOpenAutoFocus}
            restoreFocusTo={restoreFocusTo}
            title="Back up"
          >
            <button
              type="button"
              onClick={() => {
                if (removesOpener) setOpenerPresent(false);
                if (disablesOpener) setOpenerInert(true);
                setOpen(false);
              }}
            >
              Apply
            </button>
          </DialogFrame>
        </>
      );
    }

    /**
     * ⚠️ By id, not by role. Radix marks everything outside an open dialog
     * `aria-hidden`, and `restoreFocusTo` is resolved inside that window — a
     * role query would throw there rather than return the anchor.
     */
    const byId = (id: string) => document.getElementById(id) as HTMLElement;

    /** Focus the control, prove it took, then activate it from the keyboard. */
    async function pressWithKeyboard(user: UserEvent, control: HTMLElement) {
      control.focus();
      expect(document.activeElement).toBe(control);
      await user.keyboard('{Enter}');
    }

    it('returns focus to the opener on Escape', async () => {
      const user = userEvent.setup();
      render(<RestoreFixture />);

      const opener = screen.getByRole('button', { name: 'Open' });
      await pressWithKeyboard(user, opener);
      await screen.findByRole('dialog');

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(document.activeElement).not.toBe(document.body);
        expect(document.activeElement).toBe(opener);
      });
    });

    it('returns focus to the opener from the close button', async () => {
      const user = userEvent.setup();
      render(<RestoreFixture />);

      const opener = screen.getByRole('button', { name: 'Open' });
      await pressWithKeyboard(user, opener);

      await pressWithKeyboard(user, await screen.findByRole('button', { name: 'Close dialog' }));

      await waitFor(() => {
        expect(document.activeElement).toBe(opener);
      });
    });

    /**
     * ⚠️ The alertdialog needs its own initial focus to be a real test. Radix's
     * alert-dialog autofocuses a `Cancel` wrapper `DialogFrame` does not render,
     * so with no `onOpenAutoFocus` focus never leaves the opener and "restored"
     * would pass on code that restores nothing. `ConfirmModal` — the one
     * alertdialog consumer — supplies exactly this handler.
     */
    it('returns focus to the opener from an alertdialog', async () => {
      const user = userEvent.setup();
      render(
        <RestoreFixture
          role="alertdialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            screen.getByRole('button', { name: 'Apply' }).focus();
          }}
        />,
      );

      const opener = screen.getByRole('button', { name: 'Open' });
      await pressWithKeyboard(user, opener);
      await screen.findByRole('alertdialog');
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Apply' }));
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(document.activeElement).not.toBe(document.body);
        expect(document.activeElement).toBe(opener);
      });
    });

    it('falls back to the named anchor when the action removed the opener', async () => {
      const user = userEvent.setup();
      render(<RestoreFixture removesOpener restoreFocusTo={() => byId('fallback')} />);

      await pressWithKeyboard(user, screen.getByRole('button', { name: 'Open' }));
      await pressWithKeyboard(user, await screen.findByRole('button', { name: 'Apply' }));

      await waitFor(() => {
        expect(document.activeElement).not.toBe(document.body);
        expect(document.activeElement).toBe(byId('fallback'));
      });
    });

    /**
     * ⚠️ The opener wins whenever it can still take focus. A cancelled delete has
     * to return the user to the button they pressed, so `restoreFocusTo` is the
     * fallback for a dead opener — never an override of a live one.
     */
    it('prefers a surviving opener over the named anchor', async () => {
      const user = userEvent.setup();
      render(<RestoreFixture restoreFocusTo={() => byId('fallback')} />);

      const opener = screen.getByRole('button', { name: 'Open' });
      await pressWithKeyboard(user, opener);
      await pressWithKeyboard(user, await screen.findByRole('button', { name: 'Apply' }));

      await waitFor(() => {
        expect(document.activeElement).toBe(opener);
      });
    });

    /**
     * ⚠️ A surviving opener is not automatically a usable one. `Button` renders
     * `aria-disabled` rather than `disabled` whenever it has something to
     * announce and refuses the activation itself, so an opener that is still
     * mounted can be a control that does nothing — the pending bar's own trap
     * `isConnected` alone would park focus on it.
     */
    it('falls through when the opener survives but has been disabled', async () => {
      const user = userEvent.setup();
      render(<RestoreFixture disablesOpener restoreFocusTo={() => byId('fallback')} />);

      await pressWithKeyboard(user, screen.getByRole('button', { name: 'Open' }));
      await pressWithKeyboard(user, await screen.findByRole('button', { name: 'Apply' }));

      await waitFor(() => {
        expect(document.activeElement).not.toBe(document.body);
        expect(document.activeElement).toBe(byId('fallback'));
      });
      expect(document.activeElement).not.toBe(byId('opener'));
    });

    /**
     * With no anchor and a dead opener the frame leaves focus alone rather than
     * inventing a destination — 23 consumers span the editor, the account page
     * and the legal page, and the focus ruling rejected the nearest survivor.
     */
    it('does not throw focus somewhere arbitrary when nothing can take it', async () => {
      const user = userEvent.setup();
      render(<RestoreFixture removesOpener />);

      await pressWithKeyboard(user, screen.getByRole('button', { name: 'Open' }));
      await pressWithKeyboard(user, await screen.findByRole('button', { name: 'Apply' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
      expect(document.activeElement).not.toBe(byId('before'));
      expect(document.activeElement).not.toBe(byId('fallback'));
    });

    /** Capturing the opener must not disturb a consumer's own initial focus. */
    it('leaves a consumer onOpenAutoFocus in charge of the open side', async () => {
      const user = userEvent.setup();
      const onOpenAutoFocus = vi.fn((event: Event) => {
        event.preventDefault();
        screen.getByRole('button', { name: 'Apply' }).focus();
      });
      render(<RestoreFixture onOpenAutoFocus={onOpenAutoFocus} />);

      const opener = screen.getByRole('button', { name: 'Open' });
      await pressWithKeyboard(user, opener);

      await waitFor(() => {
        expect(onOpenAutoFocus).toHaveBeenCalled();
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Apply' }));
      });

      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(document.activeElement).toBe(opener);
      });
    });
  });
});
