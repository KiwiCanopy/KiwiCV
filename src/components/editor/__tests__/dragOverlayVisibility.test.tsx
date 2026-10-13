// @vitest-environment jsdom
import { type ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { EducationForm } from '@/components/editor/EducationForm';
import { LanguageForm } from '@/components/editor/LanguageForm';
import { ProfileList } from '@/components/editor/ProfileList';
import { SkillsForm } from '@/components/editor/SkillsForm';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * An entry dragged in a hidden section is drawn hidden in the drag
 * overlay, as its row is. The overlays checked the entry's own hash only.
 */
let initialState: ReturnType<typeof useResumeStore.getState>;

const TITLE = 'Dragged entry';

beforeEach(() => {
  initialState = useResumeStore.getState();
  const resume = initialState.resume;
  useResumeStore.setState({
    resume: {
      ...resume,
      education: [{ ...resume.education[0], institution: TITLE, _vId: 'e1' }],
      skills: [{ name: TITLE, level: 2, keywords: [], _vId: 's1' }],
      languages: [{ language: TITLE, certificate: '', level: 2, _vId: 'l1' }],
      basics: {
        ...resume.basics,
        profiles: [{ network: TITLE, username: 'x', url: '', _vId: 'p1' }],
      },
      meta: {
        ...resume.meta,
        content: {
          ...resume.meta.content,
          hiddenIds: [],
          hiddenSections: ['education', 'skills', 'languages', 'profiles'],
        },
      },
    } as typeof resume,
  });
});

afterEach(() => {
  cleanup();
  useResumeStore.setState(initialState, true);
});

const EDITORS: [string, () => ReactElement][] = [
  ['education (ArrayForm)', () => <EducationForm defaultCollapsed={false} />],
  ['skills', () => <SkillsForm defaultCollapsed={false} />],
  ['languages', () => <LanguageForm defaultCollapsed={false} />],
  [
    'profiles',
    () => (
      <ProfileList
        profiles={useResumeStore.getState().resume.basics.profiles}
        onChange={() => {}}
      />
    ),
  ],
];

describe.each(EDITORS)('the drag overlay in %s', (_name, editor) => {
  it('draws an entry of a hidden section as hidden', async () => {
    render(<MemoryRouter>{editor()}</MemoryRouter>);
    const handle = screen.getAllByRole('button', { name: /drag|reorder|move/i })[0];
    await act(async () => {
      handle.focus();
      fireEvent.keyDown(handle, { key: ' ', code: 'Space' });
    });

    const copies = screen.getAllByText(TITLE);
    expect(copies.length).toBeGreaterThan(1);
    // The overlay renders after the list; a hidden entry is dimmed to 0.4 there,
    // as its row is when nothing is being dragged.
    const dimmed = (node: HTMLElement | null): boolean =>
      !!node && (node.style.opacity === '0.4' || dimmed(node.parentElement));
    expect(dimmed(copies[copies.length - 1])).toBe(true);
  });
});
