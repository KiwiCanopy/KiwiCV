// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { EducationForm } from '@/components/editor/EducationForm';
import { en } from '@/locales/en/index';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * A date trigger is named by its visible label — then the date it shows,
 * once there is one. Empty, its placeholder is a description, not the name.
 */
let initialState: ReturnType<typeof useResumeStore.getState>;

beforeEach(() => {
  initialState = useResumeStore.getState();
  const resume = initialState.resume;
  useResumeStore.setState({
    resume: {
      ...resume,
      education: [
        {
          ...resume.education[0],
          institution: 'TU',
          startDate: '2020-01',
          endDate: '',
          _vId: 'e1',
        },
      ],
    },
  });
});

afterEach(() => {
  cleanup();
  useResumeStore.setState(initialState, true);
});

describe('date picker triggers', () => {
  it('are named by their label, then the date they show', async () => {
    render(
      <MemoryRouter>
        <EducationForm defaultCollapsed={false} />
      </MemoryRouter>,
    );
    screen.getByRole('button', { name: /TU/, expanded: false }).click();

    // Filled: the label, then the date.
    const start = await screen.findByRole('button', {
      name: new RegExp(`^${en.editor.fields.start_date} \\S`),
    });
    expect(start.getAttribute('aria-haspopup')).toBe('dialog');

    // Empty: the label alone, the hint as description.
    const end = screen.getByRole('button', { name: en.editor.fields.end_date });
    const describedBy = end.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(describedBy)?.textContent).toBe(
      en.editor.hints.leave_empty_for_present,
    );

    // The label is wired to its trigger, so clicking it reaches the picker.
    const label = screen.getByText(en.editor.fields.start_date, { selector: 'label' });
    expect(label.getAttribute('for')).toBe(start.id);

    // The dialog it opens carries the same name.
    start.click();
    expect(await screen.findByRole('dialog', { name: en.editor.fields.start_date })).toBeTruthy();
  });
});
