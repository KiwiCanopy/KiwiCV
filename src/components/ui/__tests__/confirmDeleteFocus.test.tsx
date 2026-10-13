// @vitest-environment jsdom
import { useState } from 'react';

import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { entryDeleteAnchor } from '@/utils/focus';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

/**
 * The ordering the whole handoff rests on, and the one thing the unit tests
 * cannot see.
 *
 * ⚠️ Deleting an entry is **four** steps in three different queues: the store
 * sets `isOpen=false`, Radix's `FocusScope` schedules its restore in a
 * `setTimeout(…, 0)`, the `await confirm(…)` continuation runs as a microtask
 * and removes the row, and only then does the timer resolve `restoreFocusTo`.
 * If the timer ever won that race, `focusIfPossible` would succeed on the
 * still-mounted Delete button, `DialogFrame` would return early, React would
 * unmount it, and focus would fall to `<body>` — the original bug, with every unit
 * test green. `DialogFrame.test.tsx` removes its opener inside the closing
 * commit and `ConfirmModal.test.tsx` mocks the store, so neither reaches this.
 *
 * So this drives the REAL `useConfirmStore` promise, from the keyboard.
 */
afterEach(() => {
  useConfirmStore.getState().close();
});

/** A list shaped like the four editor delete flows, minus the form. */
function EntryList() {
  const [entries, setEntries] = useState(['Alpha', 'Beta', 'Gamma']);
  const confirm = useConfirmStore((state) => state.confirm);

  const remove = async (index: number) => {
    const confirmed = await confirm({
      title: 'confirm_delete_title',
      message: 'confirm_delete_message',
      variant: 'destructive',
      restoreFocusTo: entryDeleteAnchor('work', index),
    });
    if (!confirmed) return;
    setEntries((previous) => previous.filter((_, i) => i !== index));
  };

  return (
    <>
      <h2 id="editor-section-heading" tabIndex={-1}>
        Work
      </h2>
      {entries.map((entry, index) => (
        <div key={entry}>
          <span>{entry}</span>
          <button type="button" data-entry-delete="work" onClick={() => void remove(index)}>
            Delete {entry}
          </button>
        </div>
      ))}
      <ConfirmModal />
    </>
  );
}

/** Focus the control, prove it took, then activate it from the keyboard. */
async function pressWithKeyboard(user: UserEvent, control: HTMLElement) {
  control.focus();
  expect(document.activeElement).toBe(control);
  await user.keyboard('{Enter}');
}

const deleteControl = (name: string) => screen.getByRole('button', { name: `Delete ${name}` });

describe('focus after a confirmed entry delete', () => {
  it('lands on the entry that took the deleted one place', async () => {
    const user = userEvent.setup();
    render(<EntryList />);

    await pressWithKeyboard(user, deleteControl('Beta'));
    await pressWithKeyboard(user, await screen.findByRole('button', { name: 'common.confirm' }));

    await waitFor(() => {
      expect(screen.queryByText('Beta')).toBeNull();
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement).toBe(deleteControl('Gamma'));
    });
  });

  /** No successor: the clamp offers the entry before it. */
  it('lands on the previous entry when the last one goes', async () => {
    const user = userEvent.setup();
    render(<EntryList />);

    await pressWithKeyboard(user, deleteControl('Gamma'));
    await pressWithKeyboard(user, await screen.findByRole('button', { name: 'common.confirm' }));

    await waitFor(() => {
      expect(document.activeElement).toBe(deleteControl('Beta'));
    });
  });

  /** Cancelling must return the user to the button they pressed, not the anchor. */
  it('returns to the pressed control when the delete is cancelled', async () => {
    const user = userEvent.setup();
    render(<EntryList />);

    const pressed = deleteControl('Beta');
    await pressWithKeyboard(user, pressed);
    await pressWithKeyboard(user, await screen.findByRole('button', { name: 'common.cancel' }));

    await waitFor(() => {
      expect(screen.getByText('Beta')).toBeTruthy();
      expect(document.activeElement).toBe(pressed);
    });
  });
});
