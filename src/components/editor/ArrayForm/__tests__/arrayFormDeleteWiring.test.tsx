// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { EducationForm } from '@/components/editor/EducationForm';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Every field carries an AI affordance that reads the signed-in profile. It is
// orthogonal to the delete, and an `AuthProvider` here would pull the whole auth
// stack in to assert where focus landed.
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * The **call sites**, which `src/hooks/__tests__/entryFocusHandoff.test.tsx` cannot reach.
 *
 * ⚠️ That suite's harness calls `useEntryFocusHandoff` itself and passes
 * `armHandoff(anchor, fromKeyboard)` from its own `onDelete`, so neither
 * `useArrayForm.ts` nor `ArrayForm.tsx` — the two files the fix changed — is
 * imported by it. Measured during review: moving the arm call into the
 * *confirmed* branch of `deleteItem`, or restoring `ArrayForm`'s pre-fix
 * `onDelete={() => deleteItem(index)}`, reverts the fix and leaves the entire
 * gate green. This renders the real `EducationForm`, which is a real production
 * consumer, and drives the original repro exactly.
 *
 * ⚠️ `education`, not `work`, on purpose: a hardcoded list id in
 * `entryDeleteAnchor` is a silent cross-list bug, and a suite written on `'work'`
 * is one whose expected value the production code did not have to supply.
 */
afterEach(() => {
  useResumeStore.setState((state) => ({
    resume: { ...state.resume, education: [] },
  }));
});

const deleteControls = () => screen.getAllByRole('button', { name: /^Delete “/ });

/** Focus the control, prove it took, then activate it from the keyboard. */
async function pressWithKeyboard(user: UserEvent, control: HTMLElement) {
  control.focus();
  expect(document.activeElement).toBe(control);
  await user.keyboard('{Enter}');
}

/** Three blank entries, added the way a user adds them. */
async function renderWithBlankEntries(user: UserEvent) {
  render(
    <MemoryRouter>
      <EducationForm defaultCollapsed={false} />
    </MemoryRouter>,
  );
  const add = screen.getByRole('button', { name: 'Add' });
  await user.click(add);
  await user.click(add);
  await user.click(add);
  await waitFor(() => expect(deleteControls()).toHaveLength(3));
}

describe('the blank-entry delete, driven through the real ArrayForm', () => {
  it('hands focus to the entry that took the deleted one place', async () => {
    const user = userEvent.setup();
    await renderWithBlankEntries(user);

    await pressWithKeyboard(user, deleteControls()[1]);

    await waitFor(() => {
      expect(deleteControls()).toHaveLength(2);
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement).toBe(deleteControls()[1]);
    });
  });

  /** No dialog on this route at all — that is the whole defect. */
  it('removes a blank entry without raising a confirm', async () => {
    const user = userEvent.setup();
    await renderWithBlankEntries(user);

    await pressWithKeyboard(user, deleteControls()[0]);

    await waitFor(() => expect(deleteControls()).toHaveLength(2));
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  /** The pointer gate: a mouse user has no focus to lose, so none is moved. */
  it('does not move focus for a pointer press', async () => {
    const user = userEvent.setup();
    await renderWithBlankEntries(user);

    await user.click(deleteControls()[1]);

    await waitFor(() => expect(deleteControls()).toHaveLength(2));
    expect(document.activeElement).toBe(document.body);
  });
});
