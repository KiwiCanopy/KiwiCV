// @vitest-environment jsdom
import { useState } from 'react';

import { AccordionItem } from '@/components/ui/Accordion';
import { useEntryFocusHandoff } from '@/hooks/useEntryFocusHandoff';
import { entryDeleteAnchor } from '@/utils/focus';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

/**
 * `useArrayForm`'s **empty**-entry route, minus the store: `if (!isEmpty)` gates
 * the confirm, so a blank entry is dropped with no dialog at all and
 * `restoreFocusTo` is never consulted.
 *
 * ⚠️ The real `AccordionItem` is rendered rather than a bare button, because the
 * thing most likely to break is the `event.detail === 0` the delete control has
 * to hand back — a harness that passes `fromKeyboard` itself would still be
 * green with that threading removed.
 *
 * ⚠️ **This binds the hook and the accordion control, and nothing above them.**
 * The harness below calls `useEntryFocusHandoff` itself, so `useArrayForm`
 * and `ArrayForm` are not imported here and their wiring is not pinned by this
 * file: measured during review, moving the arm call into the *confirmed*
 * branch reverts the fix and leaves this suite green. `arrayFormDeleteWiring.test.tsx`
 * is the call-site half, and neither is redundant.
 */
function EntryList() {
  const [entries, setEntries] = useState(['Alpha', 'Beta', 'Gamma']);
  const armHandoff = useEntryFocusHandoff(entries.length);

  return (
    <>
      <h2 id="editor-section-heading" tabIndex={-1}>
        Work
      </h2>
      {entries.map((entry, index) => (
        <AccordionItem
          key={entry}
          title={entry}
          entryListId="work"
          onDelete={(fromKeyboard) => {
            armHandoff(entryDeleteAnchor('work', index), fromKeyboard);
            setEntries((previous) => previous.filter((_, i) => i !== index));
          }}
        >
          <p>{entry}</p>
        </AccordionItem>
      ))}
    </>
  );
}

const deleteControl = (name: string) =>
  screen.getByRole('button', { name: new RegExp(`Delete “${name}”$`) });

/** Focus the control, prove it took, then activate it from the keyboard. */
async function pressWithKeyboard(user: UserEvent, control: HTMLElement) {
  control.focus();
  expect(document.activeElement).toBe(control);
  await user.keyboard('{Enter}');
}

describe('focus after an empty entry is deleted without a dialog', () => {
  it('lands on the entry that took the deleted one place', async () => {
    const user = userEvent.setup();
    render(<EntryList />);

    await pressWithKeyboard(user, deleteControl('Beta'));

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

    await waitFor(() => {
      expect(document.activeElement).toBe(deleteControl('Beta'));
    });
  });

  /** Nothing left to offer: `entryDeleteAnchor`'s last rung. */
  it('falls back to the section heading when the list empties', async () => {
    const user = userEvent.setup();
    render(<EntryList />);

    await pressWithKeyboard(user, deleteControl('Alpha'));
    await pressWithKeyboard(user, deleteControl('Beta'));
    await pressWithKeyboard(user, deleteControl('Gamma'));

    await waitFor(() => {
      expect(document.activeElement).toBe(document.getElementById('editor-section-heading'));
    });
  });

  /**
   * ⚠️ The pointer gate, and the reason this is armed rather than unconditional:
   * a pointer user has no focus they can see, so moving it buys them nothing and
   * costs them a scroll. A mouse press must leave focus where it fell.
   */
  it('does not move focus for a pointer press', async () => {
    const user = userEvent.setup();
    render(<EntryList />);

    await user.click(deleteControl('Beta'));

    await waitFor(() => {
      expect(screen.queryByText('Beta')).toBeNull();
    });
    expect(document.activeElement).toBe(document.body);
  });
});
