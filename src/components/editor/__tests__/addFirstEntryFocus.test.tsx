// @vitest-environment jsdom
import { type ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { EducationForm } from '@/components/editor/EducationForm';
import { LanguageForm } from '@/components/editor/LanguageForm';
import { ProfileList } from '@/components/editor/ProfileList';
import { SkillsForm } from '@/components/editor/SkillsForm';
import { ENTRY_FIELDS_ATTR } from '@/constants/focusAnchors';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Fields carry an AI affordance that reads the signed-in profile; orthogonal here.
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * The empty section's "add first entry" card is replaced by the entry it
 * adds, so a keyboard press used to leave focus on `<body>`. Driven through each
 * of the four list editors that render the card, at the call site.
 */
let initialState: ReturnType<typeof useResumeStore.getState>;

beforeEach(() => {
  initialState = useResumeStore.getState();
  const resume = initialState.resume;
  useResumeStore.setState({
    resume: { ...resume, education: [], skills: [], languages: [] },
  });
});

afterEach(() => {
  useResumeStore.setState(initialState, true);
});

/** [name, list id, editor, the entry's first control in tab order]. */
const EDITORS: [string, string, () => ReactElement, string][] = [
  [
    'education (ArrayForm)',
    'education',
    () => <EducationForm defaultCollapsed={false} />,
    // The Start Date picker, ahead of End Date and every text field.
    'button[aria-haspopup="dialog"]',
  ],
  ['skills', 'skills', () => <SkillsForm defaultCollapsed={false} />, 'input'],
  ['languages', 'languages', () => <LanguageForm defaultCollapsed={false} />, 'input'],
  ['profiles', 'profiles', () => <ProfileList profiles={[]} onChange={() => {}} />, 'input'],
];

const addFirstCard = () => screen.getByRole('button', { name: /Add your first/ });

describe.each(EDITORS)('"add first entry" in %s', (_name, listId, editor, firstControl) => {
  const renderEditor = () => render(<MemoryRouter>{editor()}</MemoryRouter>);

  it('moves keyboard focus to the new entry’s first control', async () => {
    const user = userEvent.setup();
    renderEditor();
    const card = addFirstCard();
    card.focus();
    expect(document.activeElement).toBe(card);

    await user.keyboard('{Enter}');

    await waitFor(() => {
      const fields = document.querySelector(`[${ENTRY_FIELDS_ATTR}="${listId}"]`);
      expect(fields).not.toBeNull();
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement).toBe(fields!.querySelector(firstControl));
    });
  });

  /** The pointer gate: a mouse user has no focus to lose, so none is moved. */
  it('leaves focus alone for a pointer press', async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(addFirstCard());

    await waitFor(() =>
      expect(document.querySelector(`[${ENTRY_FIELDS_ATTR}="${listId}"]`)).not.toBeNull(),
    );
    expect(document.activeElement).toBe(document.body);
  });
});
