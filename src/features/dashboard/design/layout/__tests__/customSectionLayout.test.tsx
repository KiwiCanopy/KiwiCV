// @vitest-environment jsdom
import { MemoryRouter, useSearchParams } from 'react-router-dom';

import { EmptySectionsGrid } from '@/features/dashboard/design/layout/EmptySectionsGrid';
import { LayoutEditor } from '@/features/dashboard/design/layout/LayoutEditor';
import { EditorLayoutContext } from '@/features/dashboard/layout/EditorLayoutContext';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { type ResumeData } from '@/types/resume';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * The Design tab's section lists used to filter with `isSectionKey`, which
 * drops every `custom:<id>` token — so the section was missing from the list,
 * and the first reorder persisted a column without it.
 */

const FIXTURE_TOKEN = 'custom:0b9c3c55-6c1e-4c1f-9a43-2f7f4f8a5e01';

const ParamProbe = () => {
  const [params] = useSearchParams();
  return <output data-testid="section-param">{params.get('section') ?? ''}</output>;
};

// Narrow, so each row carries its move buttons inline rather than in a menu.
const NARROW = { width: 375, isStandard: false, isSocial: false };

const renderLayout = (ui: React.ReactNode) =>
  render(
    <MemoryRouter>
      <EditorLayoutContext.Provider value={NARROW}>{ui}</EditorLayoutContext.Provider>
      <ParamProbe />
    </MemoryRouter>,
  );

const order = () => useResumeStore.getState().resume.meta.content.order;

const setResume = (themeId: string, edit: (resume: ResumeData) => void = () => {}) => {
  const resume = buildSingleItemResume(themeId);
  edit(resume);
  useResumeStore.setState({ resume });
};

const moveDown = (label: string) =>
  screen.getByRole('button', { name: new RegExp(`^Move “${label}” down`) });

describe('the one-column layout editor', () => {
  beforeEach(() =>
    setResume('plain', (resume) => {
      resume.meta.content.order.oneColumn = [];
    }),
  );

  it('lists a custom section absent from the stored order, by its title', () => {
    renderLayout(<LayoutEditor />);
    expect(screen.getByText('Conferences')).toBeTruthy();
    expect(screen.queryByText(FIXTURE_TOKEN)).toBeNull();
  });

  it('keeps the token through the first reorder', async () => {
    const user = userEvent.setup();
    renderLayout(<LayoutEditor />);

    const first = screen.getAllByRole('button', { name: /^Move “.*” down, position 1 / })[0];
    await user.click(first);

    await waitFor(() => expect(order().oneColumn.length).toBeGreaterThan(0));
    expect(order().oneColumn).toContain(FIXTURE_TOKEN);
  });

  it('hides and edits a custom section by its token', async () => {
    const user = userEvent.setup();
    renderLayout(<LayoutEditor />);

    await user.click(screen.getByRole('button', { name: 'Hide “Conferences”' }));
    expect(useResumeStore.getState().resume.meta.content.hiddenSections).toContain(FIXTURE_TOKEN);

    await user.click(screen.getByRole('button', { name: 'More actions for “Conferences”' }));
    await user.click(await screen.findByRole('button', { name: 'Edit “Conferences”' }));
    expect(screen.getByTestId('section-param').textContent).toBe(FIXTURE_TOKEN);
  });
});

describe('the two-column layout editor', () => {
  beforeEach(() =>
    setResume('lunar', (resume) => {
      const { twoColumn } = resume.meta.content.order;
      twoColumn.main = twoColumn.main.filter((id) => id !== FIXTURE_TOKEN);
      twoColumn.sidebar = twoColumn.sidebar.filter((id) => id !== FIXTURE_TOKEN);
    }),
  );

  it('lists a custom section absent from the stored order in the main column', () => {
    renderLayout(<LayoutEditor />);
    expect(screen.getByText('Conferences')).toBeTruthy();
  });

  it('keeps the token in main through the first reorder of that column', async () => {
    const user = userEvent.setup();
    renderLayout(<LayoutEditor />);

    const mainColumn = screen.getByText('Conferences').closest('.flex.flex-col.gap-1\\.5');
    expect(mainColumn).toBeTruthy();
    const firstMoveDown = within(mainColumn as HTMLElement).getAllByRole('button', {
      name: /^Move “.*” down, position 1 /,
    })[0];
    await user.click(firstMoveDown);

    expect(order().twoColumn.main).toContain(FIXTURE_TOKEN);
  });

  it('moves a custom section to the sidebar and keeps it there through a reorder', async () => {
    const user = userEvent.setup();
    renderLayout(<LayoutEditor />);

    await user.click(
      screen.getByRole('button', { name: 'Move “Conferences” to the other column' }),
    );
    expect(order().twoColumn.sidebar).toContain(FIXTURE_TOKEN);
    expect(order().twoColumn.main).not.toContain(FIXTURE_TOKEN);

    await user.click(moveDown('Conferences'));
    expect(order().twoColumn.sidebar).toContain(FIXTURE_TOKEN);
  });
});

describe('the empty-sections grid', () => {
  it('offers an entry-less custom section by its title and opens it by token', async () => {
    setResume('lunar', (resume) => {
      resume.customSections[0].items = [];
    });
    const user = userEvent.setup();
    renderLayout(<EmptySectionsGrid />);

    const card = screen.getByText('Conferences').parentElement as HTMLElement;
    expect(card.querySelector('svg.lucide-layout-list')).toBeTruthy();
    await user.click(within(card).getByRole('button'));

    expect(screen.getByTestId('section-param').textContent).toBe(FIXTURE_TOKEN);
  });
});
