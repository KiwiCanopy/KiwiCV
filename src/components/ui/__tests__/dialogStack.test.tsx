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

  // The other half: without the prop the later dialog takes over, which is the freeze.
  it('loses its layer to a later dialog without it', async () => {
    const { rerender } = render(<Scene staysOnTop={false} later={null} />);
    await openLater(rerender, false, 'frame');

    const gate = gateDialog();
    expect(isHiddenByAnotherDialog(gate)).toBe(true);
  });
});
