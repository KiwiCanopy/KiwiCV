// @vitest-environment jsdom
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DialogFrame } from '@/components/ui/DialogFrame';
import { Sheet } from '@/components/ui/Sheet';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

/** Whether Radix has handed the dialog's layer to another: `aria-hidden` on it or an ancestor. */
const gateDialog = () => screen.getByText('Consent').closest('[role="dialog"]') as HTMLElement;
const isHiddenByAnotherDialog = (dialog: HTMLElement) => !!dialog.closest('[aria-hidden="true"]');

function Gate({ staysOnTop }: { staysOnTop: boolean }) {
  return (
    <DialogFrame
      open
      onOpenChange={() => {}}
      dismissible={false}
      staysOnTop={staysOnTop}
      title="Consent"
    >
      <input type="checkbox" aria-label="I agree" />
    </DialogFrame>
  );
}

type Later = 'frame' | 'confirm' | 'sheet';

function Scene({ staysOnTop, later }: { staysOnTop: boolean; later: Later | null }) {
  return (
    <>
      <Gate staysOnTop={staysOnTop} />
      <DialogFrame open={later === 'frame'} onOpenChange={() => {}} title="Export">
        <button type="button">Export now</button>
      </DialogFrame>
      <Sheet open={later === 'sheet'} onOpenChange={() => {}} title="Menu" description="Nav">
        <button type="button">Home</button>
      </Sheet>
      <ConfirmModal />
    </>
  );
}

async function openLater(
  rerender: (ui: React.ReactElement) => void,
  staysOnTop: boolean,
  later: Later,
) {
  await act(async () => {
    if (later === 'confirm')
      void useConfirmStore.getState().confirm({ title: 'Saving', message: 'Wait' });
    rerender(<Scene staysOnTop={staysOnTop} later={later === 'confirm' ? null : later} />);
  });
}

afterEach(() => {
  act(() => useConfirmStore.getState().close());
});

describe('a dialog that stays on top (#9)', () => {
  it.each(['frame', 'confirm', 'sheet'] as const)(
    'keeps focus and its layer when a %s opens after it',
    async (later) => {
      const { rerender } = render(<Scene staysOnTop later={null} />);
      await openLater(rerender, true, later);

      const gate = gateDialog();
      expect(isHiddenByAnotherDialog(gate)).toBe(false);
      // Radix restores focus for the content a remount replaced a tick later.
      await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
      expect(gate.contains(document.activeElement)).toBe(true);
    },
  );

  it('hands the layer back to the later dialog once it closes', async () => {
    function Closable({ gateOpen }: { gateOpen: boolean }) {
      return (
        <>
          <DialogFrame
            open={gateOpen}
            onOpenChange={() => {}}
            dismissible={false}
            staysOnTop
            title="Consent"
          >
            <input type="checkbox" aria-label="I agree" />
          </DialogFrame>
          <DialogFrame open onOpenChange={() => {}} title="Export">
            <button type="button">Export now</button>
          </DialogFrame>
        </>
      );
    }
    const { rerender } = render(<Closable gateOpen />);
    await act(async () => {});
    expect(isHiddenByAnotherDialog(gateDialog())).toBe(false);

    await act(async () => rerender(<Closable gateOpen={false} />));

    const exportDialog = screen.getByRole('dialog', { name: 'Export' });
    expect(isHiddenByAnotherDialog(exportDialog)).toBe(false);
  });

  // Radix restores focus for the replaced content a tick after the remount; aimed at
  // the opener the new content captured, it would pull focus out of the gate.
  it('moves focus nowhere outside it once the remount has focused it', async () => {
    const focused: HTMLElement[] = [];
    const focus = HTMLElement.prototype.focus;
    const spy = vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (
      this: HTMLElement,
      options?: FocusOptions,
    ) {
      focused.push(this);
      focus.call(this, options);
    });
    try {
      const { rerender } = render(<Scene staysOnTop later={null} />);
      focused.length = 0;
      await openLater(rerender, true, 'frame');
      await act(() => new Promise((resolve) => setTimeout(resolve, 20)));

      const gate = gateDialog();
      const backInGate = focused.findIndex((node) => gate.contains(node));
      expect(backInGate).toBeGreaterThanOrEqual(0);
      expect(focused.slice(backInGate).filter((node) => !gate.contains(node))).toEqual([]);
    } finally {
      spy.mockRestore();
    }
  });

  it('puts focus back on the control the user had focused', async () => {
    function TwoControls({ later }: { later: boolean }) {
      return (
        <>
          <DialogFrame open onOpenChange={() => {}} dismissible={false} staysOnTop title="Consent">
            {/* Two non-links: Radix never picks a link for initial focus. */}
            <button type="button">Read the terms</button>
            <input type="checkbox" aria-label="I agree" />
          </DialogFrame>
          <DialogFrame open={later} onOpenChange={() => {}} title="Export">
            <button type="button">Export now</button>
          </DialogFrame>
        </>
      );
    }
    const { rerender } = render(<TwoControls later={false} />);
    await act(async () => screen.getByLabelText('I agree').focus());

    await act(async () => rerender(<TwoControls later />));
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));

    expect(document.activeElement).toBe(screen.getByLabelText('I agree'));
  });

  it('paints on the top layer and does not remount for a dialog nested in it', async () => {
    let renders = 0;
    function Counted() {
      renders += 1;
      return null;
    }
    render(
      <DialogFrame open onOpenChange={() => {}} dismissible={false} staysOnTop title="Consent">
        <Counted />
        <DialogFrame open onOpenChange={() => {}} title="Nested">
          <button type="button">Inner</button>
        </DialogFrame>
      </DialogFrame>,
    );
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));

    expect(gateDialog().className).toContain('z-[9999]');
    expect(renders).toBeLessThan(5);
  });

  it('does not remount for a sheet nested in it', async () => {
    let renders = 0;
    function Counted() {
      renders += 1;
      return null;
    }
    render(
      <DialogFrame open onOpenChange={() => {}} dismissible={false} staysOnTop title="Consent">
        <Counted />
        <Sheet open onOpenChange={() => {}} title="Menu" description="Nav">
          <button type="button">Home</button>
        </Sheet>
      </DialogFrame>,
    );
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));

    expect(renders).toBeLessThan(5);
  });

  function Reopenable({ open, later }: { open: boolean; later: boolean }) {
    return (
      <>
        <DialogFrame
          open={open}
          onOpenChange={() => {}}
          dismissible={false}
          staysOnTop
          title="Consent"
        >
          <button type="button">Read the terms</button>
          <input type="checkbox" aria-label="I agree" />
        </DialogFrame>
        <DialogFrame open={later} onOpenChange={() => {}} title="Export">
          <button type="button">Export now</button>
        </DialogFrame>
      </>
    );
  }

  it('forgets the last focus once closed, so a reopen takes Radix’s first choice', async () => {
    const { rerender } = render(<Reopenable open later={false} />);
    await act(async () => screen.getByLabelText('I agree').focus());
    await act(async () => rerender(<Reopenable open={false} later={false} />));

    await act(async () => rerender(<Reopenable open later={false} />));
    await act(async () => rerender(<Reopenable open later />));
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));

    expect(document.activeElement).toBe(screen.getByText('Read the terms'));
  });

  it('falls back to Radix’s first choice when the remembered control is gone', async () => {
    function Shrinking({ later }: { later: boolean }) {
      return (
        <>
          <DialogFrame open onOpenChange={() => {}} dismissible={false} staysOnTop title="Consent">
            <button type="button">Read the terms</button>
            {!later && <input type="checkbox" aria-label="I agree" />}
          </DialogFrame>
          <DialogFrame open={later} onOpenChange={() => {}} title="Export">
            <button type="button">Export now</button>
          </DialogFrame>
        </>
      );
    }
    const { rerender } = render(<Shrinking later={false} />);
    await act(async () => screen.getByLabelText('I agree').focus());

    await act(async () => rerender(<Shrinking later />));
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));

    expect(document.activeElement).toBe(screen.getByText('Read the terms'));
  });

  // The other half: without the prop the later dialog takes over, which is the freeze.
  it('loses its layer to a later dialog without it', async () => {
    const { rerender } = render(<Scene staysOnTop={false} later={null} />);
    await openLater(rerender, false, 'frame');

    const gate = gateDialog();
    expect(isHiddenByAnotherDialog(gate)).toBe(true);
  });
});
