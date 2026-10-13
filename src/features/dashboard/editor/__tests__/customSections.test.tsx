// @vitest-environment jsdom
import { MemoryRouter, useSearchParams } from 'react-router-dom';

import { SECTION_HEADING_ANCHOR_ID } from '@/constants/focusAnchors';
import { EditorTab } from '@/features/dashboard/editor/EditorTab';
import { RAIL_SECTION_ORDER } from '@/features/dashboard/editor/rail/railSections';
import { en } from '@/locales/en/index';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { lookupTranslation } from '@/utils/translationLookup';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * Custom sections through the composed `EditorTab`, so a prop dropped
 * between the rail hook, the rail, the panel and the form fails here rather
 * than only in the browser (`.claude/rules/testing.md`).
 */

/** What `t()` renders: the English value, or the path while the key is unshipped. */
const label = (path: string): string => lookupTranslation(en, path) ?? path;

const FIXTURE_ID = '0b9c3c55-6c1e-4c1f-9a43-2f7f4f8a5e01';
const FIXTURE_TOKEN = `custom:${FIXTURE_ID}`;

const ParamProbe = () => {
  const [params] = useSearchParams();
  return <output data-testid="section-param">{params.get('section') ?? ''}</output>;
};

const renderEditor = (initialEntry: string, workspaceWidth = 1400) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <EditorTab
        workspaceLayout={workspaceWidth < 700 ? 'phone' : 'split'}
        workspaceWidth={workspaceWidth}
        editorPaneWidth={900}
      />
      <ParamProbe />
    </MemoryRouter>,
  );

const sectionParam = () => screen.getByTestId('section-param').textContent;
const rail = () => screen.getByRole('navigation', { name: label('editor.rail.title') });
const heading = () => document.getElementById(SECTION_HEADING_ANCHOR_ID);
const titleInput = () =>
  screen.getByLabelText(label('editor.custom_sections.title_label')) as HTMLInputElement;
const deleteButton = () =>
  screen.getByRole('button', { name: label('editor.custom_sections.delete') });
const customSections = () => useResumeStore.getState().resume.customSections;

async function pressWithKeyboard(user: UserEvent, control: HTMLElement) {
  control.focus();
  expect(document.activeElement).toBe(control);
  await user.keyboard('{Enter}');
}

beforeEach(() => {
  useResumeStore.setState({ resume: buildSingleItemResume('lunar') });
  useUIStore.setState({ editorRailCollapsed: false });
});

afterEach(() => {
  act(() => useConfirmStore.getState().close());
  vi.restoreAllMocks();
});

describe('the rail’s custom sections group', () => {
  it('lists each custom section under its heading, with its entry count, then Add', () => {
    renderEditor('/?section=work');
    const nav = within(rail());

    expect(nav.getByRole('heading', { name: label('editor.custom_sections.group_title') }));
    const row = nav.getByRole('button', { name: /Conferences/ });
    expect(within(row).getByText('1')).toBeTruthy();
    expect(nav.getByRole('button', { name: label('editor.custom_sections.add') })).toBeTruthy();
  });

  it('shows the group, and its Add row, with no custom section yet', () => {
    useResumeStore.setState((state) => ({ resume: { ...state.resume, customSections: [] } }));
    renderEditor('/?section=work');

    expect(
      within(rail()).getByRole('button', { name: label('editor.custom_sections.add') }),
    ).toBeTruthy();
  });

  it('names a blank-titled section Untitled rather than leaving the row empty', () => {
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        customSections: [{ ...state.resume.customSections[0], title: '  ' }],
      },
    }));
    renderEditor('/?section=work');

    expect(within(rail()).getByRole('button', { name: /Untitled/ })).toBeTruthy();
  });

  it('tells custom rows apart in the collapsed rail by their first letter', () => {
    useUIStore.setState({ editorRailCollapsed: true });
    renderEditor('/?section=basics');
    const title = customSections()[0].title;
    const row = screen.getByRole('button', { name: title });
    // The visible glyph, not the sr-only name (which contains the letter anyway).
    const glyph = [...row.querySelectorAll('[aria-hidden="true"]')].map((el) => el.textContent);
    expect(glyph).toContain(Array.from(title)[0]);
  });

  it('selects a custom section by token and reports it to analytics as "custom"', async () => {
    const track = vi.spyOn(analytics, 'track');
    const user = userEvent.setup();
    renderEditor('/?section=work');

    await user.click(within(rail()).getByRole('button', { name: /Conferences/ }));

    expect(sectionParam()).toBe(FIXTURE_TOKEN);
    expect(document.querySelector(`[data-editor-section="${FIXTURE_TOKEN}"]`)).toBeTruthy();
    expect(track).toHaveBeenCalledWith(ANALYTICS_EVENTS.EDITOR_SECTION_SELECTED, {
      section: 'custom',
    });
    const sent = JSON.stringify(track.mock.calls);
    expect(sent).not.toContain(FIXTURE_ID);
    expect(sent).not.toContain('Conferences');
  });

  it('creates a section from Add, opens it, and selects its title for typing', async () => {
    const user = userEvent.setup();
    renderEditor('/?section=work');

    await user.click(
      within(rail()).getByRole('button', { name: label('editor.custom_sections.add') }),
    );

    expect(customSections()).toHaveLength(2);
    const created = customSections()[1];
    expect(created.title).toBe(label('editor.custom_sections.default_title'));
    await waitFor(() => expect(sectionParam()).toBe(`custom:${created.id}`));
    await waitFor(() => expect(document.activeElement).toBe(titleInput()));
    const input = titleInput();
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(input.value.length);
  });

  it('offers the same group and Add row on the phone list', async () => {
    const user = userEvent.setup();
    renderEditor('/', 375);

    expect(screen.getByRole('button', { name: /Conferences/ })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: label('editor.custom_sections.add') }));

    expect(customSections()).toHaveLength(2);
    await waitFor(() => expect(document.activeElement).toBe(titleInput()));
  });
});

describe('?section=custom:<id>', () => {
  it('routes to the custom section form, headed by its title', () => {
    renderEditor(`/?section=${FIXTURE_TOKEN}`);

    expect(document.querySelector(`[data-editor-section="${FIXTURE_TOKEN}"]`)).toBeTruthy();
    expect(heading()?.textContent).toBe('Conferences');
    expect(titleInput().value).toBe('Conferences');
    expect(screen.getByText('Solo conference')).toBeTruthy();
    // `LayoutList`, rendered rather than compared to an import (testing.md).
    const panelHeader = heading()?.closest('header');
    expect(panelHeader?.querySelector('svg.lucide-layout-list')).toBeTruthy();
    const row = within(rail()).getByRole('button', { name: /Conferences/ });
    expect(row.querySelector('svg.lucide-layout-list')).toBeTruthy();
  });

  it('falls back to Basics for a token whose section does not exist', () => {
    renderEditor('/?section=custom:00000000-0000-0000-0000-000000000000');

    expect(document.querySelector('[data-editor-section="basics"]')).toBeTruthy();
  });

  it('offers Improve on the section, named by its heading, and on its entries', () => {
    // An entry's AI trigger needs a `_vId`, which every stored entry carries;
    // without one this assertion would hold for any section.
    useResumeStore.setState((state) => {
      const [section] = state.resume.customSections;
      const items = section.items.map((item) => ({ ...item, _vId: 'v-custom-1' }));
      return { resume: { ...state.resume, customSections: [{ ...section, items }] } };
    });
    renderEditor(`/?section=${FIXTURE_TOKEN}`);

    const { title } = useResumeStore.getState().resume.customSections[0];
    expect(
      screen.getByRole('button', {
        name: label('ai.optimize_section').replace('{{section}}', title),
      }),
    ).toBeTruthy();
    // Never the token: the uuid is not a name a user has seen.
    expect(screen.queryByRole('button', { name: new RegExp(FIXTURE_ID) })).toBeNull();
    // Entries are named by their own label (`ai.suggest_named`).
    const [before, after] = label('ai.suggest_named')
      .split('{{name}}')
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    expect(
      screen.getAllByRole('button', { name: new RegExp(`^${before}.+${after}$`) }).length,
    ).toBeGreaterThan(0);
  });

  it("counts a custom section's AI proposals on its rail row", () => {
    useResumeStore.setState((state) => {
      const [section] = state.resume.customSections;
      const items = section.items.map((item) => ({ ...item, _vId: 'v-custom-1' }));
      return {
        resume: { ...state.resume, customSections: [{ ...section, items }] },
        ai: {
          ...state.ai,
          suggestions: {
            [`item:${FIXTURE_TOKEN}:v-custom-1`]: {
              originalValue: { summary: 'a' },
              improvedValue: { summary: 'b' },
              timestamp: 0,
            },
          },
        },
      };
    });
    renderEditor('/?section=basics');

    const row = within(rail()).getByRole('button', { name: /Conferences/ });
    expect(row.textContent).toContain(label('editor.rail.proposals_waiting_one'));
  });

  it('marks summary and highlights main-column-only, as the volunteer layout drops them in a sidebar', () => {
    renderEditor(`/?section=${FIXTURE_TOKEN}`);
    for (const button of [...document.querySelectorAll('button[aria-expanded="false"]')]) {
      act(() => (button as HTMLButtonElement).click());
    }
    // One entry in the fixture: its summary and highlights fields.
    expect(screen.getAllByRole('button', { name: 'main' })).toHaveLength(2);
  });

  it('shows the custom empty state for a section with no entries', () => {
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        customSections: [{ ...state.resume.customSections[0], items: [] }],
      },
    }));
    renderEditor(`/?section=${FIXTURE_TOKEN}`);

    expect(screen.getByText(label('editor.custom_sections.add_first'))).toBeTruthy();
    expect(screen.getByText(label('editor.custom_sections.empty'))).toBeTruthy();
  });
});

describe('the title input', () => {
  it('renames live, so the heading and the rail follow the typing', async () => {
    const user = userEvent.setup();
    renderEditor(`/?section=${FIXTURE_TOKEN}`);

    await user.clear(titleInput());
    await user.type(titleInput(), 'Talks');

    expect(customSections()[0].title).toBe('Talks');
    expect(heading()?.textContent).toBe('Talks');
    expect(within(rail()).getByRole('button', { name: /Talks/ })).toBeTruthy();
  });

  it('reverts a title left blank to the last non-empty one on blur', async () => {
    const user = userEvent.setup();
    renderEditor(`/?section=${FIXTURE_TOKEN}`);

    await user.clear(titleInput());
    expect(heading()?.textContent).toBe(label('common.untitled'));

    await user.tab();

    expect(customSections()[0].title).toBe('Conferences');
    expect(titleInput().value).toBe('Conferences');
    expect(heading()?.textContent).toBe('Conferences');
  });
});

describe('deleting a custom section', () => {
  const lastBuiltInRow = RAIL_SECTION_ORDER[RAIL_SECTION_ORDER.length - 1];

  it('confirms when it has entries, then lands on the previous row’s heading', async () => {
    const user = userEvent.setup();
    renderEditor(`/?section=${FIXTURE_TOKEN}`);

    await pressWithKeyboard(user, deleteButton());

    await waitFor(() => expect(useConfirmStore.getState().isOpen).toBe(true));
    const options = useConfirmStore.getState().options;
    expect(options.variant).toBe('destructive');
    expect(options.title).toBe(
      label('editor.custom_sections.delete_confirm_title').replace('{{title}}', 'Conferences'),
    );
    expect(customSections()).toHaveLength(1);

    act(() => useConfirmStore.getState().onConfirm());

    await waitFor(() => expect(customSections()).toHaveLength(0));
    expect(sectionParam()).toBe(lastBuiltInRow);
    expect(document.querySelector(`[data-editor-section="${lastBuiltInRow}"]`)).toBeTruthy();
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toBe(heading());
  });

  it('keeps the section when the confirm is cancelled', async () => {
    const user = userEvent.setup();
    renderEditor(`/?section=${FIXTURE_TOKEN}`);

    await pressWithKeyboard(user, deleteButton());
    await waitFor(() => expect(useConfirmStore.getState().isOpen).toBe(true));
    act(() => useConfirmStore.getState().onCancel());

    await act(async () => {});
    expect(customSections()).toHaveLength(1);
    expect(sectionParam()).toBe(FIXTURE_TOKEN);
  });

  it('deletes an empty section without a confirm and hands focus to the custom row above', async () => {
    const empty = { id: '6f1d1a2e-0000-4000-8000-000000000002', title: 'Empty', items: [] };
    useResumeStore.setState((state) => ({
      resume: { ...state.resume, customSections: [...state.resume.customSections, empty] },
    }));
    const user = userEvent.setup();
    renderEditor(`/?section=custom:${empty.id}`);

    await pressWithKeyboard(user, deleteButton());

    expect(useConfirmStore.getState().isOpen).toBe(false);
    await waitFor(() => expect(customSections()).toHaveLength(1));
    expect(sectionParam()).toBe(FIXTURE_TOKEN);
    expect(heading()?.textContent).toBe('Conferences');
    expect(document.activeElement).toBe(heading());
  });
});
