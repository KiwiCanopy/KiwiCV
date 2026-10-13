// @vitest-environment jsdom
import { type ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { CustomSectionForm } from '@/components/editor/CustomSectionForm';
import { EducationForm } from '@/components/editor/EducationForm';
import { LanguageForm } from '@/components/editor/LanguageForm';
import { SkillsForm } from '@/components/editor/SkillsForm';
import { ENTRY_FIELDS_ATTR } from '@/constants/focusAnchors';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * The call sites of `AccordionItem`'s `aiTarget.isEmpty`: a freshly added entry
 * is blank, so its Improve is refused, and the first character typed makes it
 * live. `AccordionItem`'s own suite cannot see a call site passing a constant.
 */
let initialState: ReturnType<typeof useResumeStore.getState>;

beforeEach(() => {
  initialState = useResumeStore.getState();
  const resume = initialState.resume;
  useResumeStore.setState({ resume: { ...resume, education: [], skills: [], languages: [] } });
});

afterEach(() => {
  useResumeStore.setState(initialState, true);
});

const EDITORS: [string, () => ReactElement][] = [
  ['education (ArrayForm)', () => <EducationForm defaultCollapsed={false} />],
  ['skills', () => <SkillsForm defaultCollapsed={false} />],
  ['languages', () => <LanguageForm defaultCollapsed={false} />],
];

const entryImprove = () => screen.getByRole('button', { name: /^Improve “.*” with AI$/ });

describe.each(EDITORS)('entry Improve in %s', (_name, editor) => {
  it('is refused while the new entry is blank and live once it has text', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter>{editor()}</MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /Add your first/ }));
    await waitFor(() => expect(entryImprove().getAttribute('aria-disabled')).toBe('true'));

    await user.type(screen.getAllByRole('textbox')[0], 'Something');
    await user.tab();

    await waitFor(() => expect(entryImprove().getAttribute('aria-disabled')).toBeNull());
  });
});

/**
 * The custom-section header computes its own `isEmpty` in `ArrayForm`, since
 * `sectionId` cannot name a token. Blank drafts are not persisted, so a section
 * holding only one is still empty.
 */
describe('custom section header Improve', () => {
  it('is refused while every entry is blank and live once one has text', async () => {
    const user = userEvent.setup();
    useResumeStore.setState((state) => ({
      resume: { ...state.resume, customSections: [{ id: 'talks', title: 'Talks', items: [] }] },
    }));
    render(
      <MemoryRouter>
        <CustomSectionForm token="custom:talks" onDelete={() => {}} defaultCollapsed={false} />
      </MemoryRouter>,
    );
    const headerImprove = () => screen.getByRole('button', { name: /^Optimize Talks$/ });

    expect(headerImprove().getAttribute('aria-disabled')).toBe('true');
    await user.click(screen.getByRole('button', { name: /Add your first/ }));
    await waitFor(() => expect(entryImprove()).toBeTruthy());
    expect(headerImprove().getAttribute('aria-disabled')).toBe('true');

    // The first textbox is the section title; the entry's fields follow it.
    const entryField = screen
      .getAllByRole('textbox')
      .find((box) => box.closest(`[${ENTRY_FIELDS_ATTR}]`));
    expect(entryField, 'no entry field rendered').toBeTruthy();
    await user.type(entryField!, 'Keynote');
    await user.tab();

    await waitFor(() => expect(headerImprove().getAttribute('aria-disabled')).toBeNull());
  });
});
