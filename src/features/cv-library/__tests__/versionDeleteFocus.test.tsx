// @vitest-environment jsdom
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { CvLibraryHarness } from '@/test/cvLibraryHarness';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * The library's row delete, driven the way a keyboard user drives it.
 *
 * ⚠️ Two things here are only visible from the real components. The Delete item
 * lives inside a `Popover` that is **unmounted while closed**, so whatever
 * `DialogFrame` captured as the opener is gone twice over by the time the dialog
 * closes; and `handleDelete` runs `closeOnConfirm: false` and then rewrites the
 * *same* dialog into a success report, so the dialog that finally closes is that
 * one, still carrying the dead opener.
 */
afterEach(() => {
  useConfirmStore.getState().close();
});

/** The rows plus their dialog, through the shared `useCvLibrary.remove` stand-in. */
const Library = ({ labels }: { labels: string[] }) => (
  <>
    <CvLibraryHarness labels={labels} />
    <ConfirmModal />
  </>
);

const rowMenu = (label: string) =>
  screen.getByRole('button', { name: `More actions for ${label}` });

/** Focus the control, prove it took, then activate it from the keyboard. */
async function pressWithKeyboard(user: UserEvent, control: HTMLElement) {
  control.focus();
  expect(document.activeElement).toBe(control);
  await user.keyboard('{Enter}');
}

/** Menu → Delete → Confirm → OK, every step from the keyboard. */
async function deleteRow(user: UserEvent, label: string) {
  await pressWithKeyboard(user, rowMenu(label));
  await pressWithKeyboard(user, await screen.findByRole('button', { name: 'Delete' }));
  await pressWithKeyboard(user, await screen.findByRole('button', { name: 'Confirm' }));
  await pressWithKeyboard(user, await screen.findByRole('button', { name: 'OK' }));
}

describe('focus after a confirmed CV library delete', () => {
  it('lands on the menu trigger of the row that took the deleted one place', async () => {
    const user = userEvent.setup();
    render(<Library labels={['Alpha', 'Beta', 'Gamma']} />);

    await deleteRow(user, 'Beta');

    await waitFor(() => {
      expect(screen.queryByText('Beta')).toBeNull();
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement).toBe(rowMenu('Gamma'));
    });
  });

  /** No successor: the clamp offers the row before it. */
  it('lands on the previous row when the last one goes', async () => {
    const user = userEvent.setup();
    render(<Library labels={['Alpha', 'Beta', 'Gamma']} />);

    await deleteRow(user, 'Gamma');

    await waitFor(() => {
      expect(document.activeElement).toBe(rowMenu('Beta'));
    });
  });

  /**
   * ⚠️ The rung `entryDeleteAnchor` cannot supply. Its last one is the editor
   * rail's `#editor-section-heading`, which is not mounted on `/cvs` — so the
   * shared cascade would run out exactly here, on an empty library, and focus
   * would fall to `<body>`.
   */
  it('falls back to the empty state call to action when the library empties', async () => {
    const user = userEvent.setup();
    render(<Library labels={['Alpha']} />);

    await deleteRow(user, 'Alpha');

    await waitFor(() => {
      expect(document.activeElement).toBe(document.getElementById('cv-library-empty-cta'));
      expect(document.activeElement).not.toBe(document.body);
    });
  });
});
