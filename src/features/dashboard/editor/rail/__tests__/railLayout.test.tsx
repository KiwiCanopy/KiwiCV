// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { EditorTab } from '@/features/dashboard/editor/EditorTab';
import {
  EDITOR_RAIL_COLLAPSED_WIDTH,
  EDITOR_RAIL_EXPANDED_MIN_WIDTH,
  EDITOR_RAIL_WIDTH,
} from '@/features/dashboard/layout/constants';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

const tree = (
  workspaceWidth: number,
  workspaceLayout: 'phone' | 'workspace' | 'split',
  editorPaneWidth: number,
) => (
  <MemoryRouter initialEntries={['/']}>
    <EditorTab
      workspaceLayout={workspaceLayout}
      workspaceWidth={workspaceWidth}
      editorPaneWidth={editorPaneWidth}
    />
  </MemoryRouter>
);

const renderEditor = (
  workspaceWidth: number,
  workspaceLayout: 'phone' | 'workspace' | 'split',
  // Defaults to the workspace width, which is what an unsplit pane actually
  // gets. Split cases pass the pane explicitly — that is the whole point of
  // these tests.
  editorPaneWidth: number = workspaceWidth,
) => render(tree(workspaceWidth, workspaceLayout, editorPaneWidth));

// ⚠️ Not `nav[aria-label="Sections"]` — the phone list is a `nav` with the same
// name, so that selector reports "there is a rail" on a phone.
const rail = () => document.querySelector('nav[data-editor-rail]');

beforeEach(() => {
  useResumeStore.setState({ resume: buildSingleItemResume('lunar') });
  useUIStore.setState({ editorRailCollapsed: null });
});

/**
 * ⚠️ The default is read off the **editor pane** width — the box the rail and
 * the entry column divide up — not the workspace and not the entry column.
 *
 * Not the workspace: at split the pane is only part of it, so a workspace wide
 * enough for a rail says nothing about whether the *pane* is.
 *
 * Not the entry column: the column is a sibling of the rail and is already net
 * of it, so asking it "is there room for a rail" reasons in a circle. The pane
 * is set by the divider and does not change when the rail collapses.
 */
describe('the rail default width', () => {
  it('starts collapsed when the pane cannot hold a rail and a standard column', () => {
    renderEditor(1600, 'split', EDITOR_RAIL_EXPANDED_MIN_WIDTH - 1);
    expect(rail()).toHaveProperty('style.width', `${EDITOR_RAIL_COLLAPSED_WIDTH}px`);
  });

  it('starts expanded once the pane has room for both', () => {
    renderEditor(1600, 'split', EDITOR_RAIL_EXPANDED_MIN_WIDTH);
    expect(rail()).toHaveProperty('style.width', `${EDITOR_RAIL_WIDTH}px`);
  });

  // The regression this threshold change exists for: a 1440 viewport measured a
  // 1372 workspace (over the old 1300) but only a 704px pane, so the rail
  // expanded and left the form 457px.
  it('stays collapsed on a wide workspace whose editor pane is narrow', () => {
    renderEditor(1372, 'split', 704);
    expect(rail()).toHaveProperty('style.width', `${EDITOR_RAIL_COLLAPSED_WIDTH}px`);
  });

  it('expands on an unsplit workspace, where the pane is the whole width', () => {
    renderEditor(1112, 'workspace');
    expect(rail()).toHaveProperty('style.width', `${EDITOR_RAIL_WIDTH}px`);
  });

  it('lets an explicit toggle pin the state against the measured default', async () => {
    const user = userEvent.setup();
    renderEditor(1600, 'split', EDITOR_RAIL_EXPANDED_MIN_WIDTH + 400);

    await user.click(screen.getByRole('button', { name: 'Collapse section list' }));

    expect(useUIStore.getState().editorRailCollapsed).toBe(true);
    expect(rail()).toHaveProperty('style.width', `${EDITOR_RAIL_COLLAPSED_WIDTH}px`);
  });
});

/**
 * The pin is the only thing that can turn the measured default off, and nothing
 * else ever writes `null` — so without a way back, one toggle disabled the
 * default for good. It drops itself at the moment it stops doing any work.
 */
describe('the rail pin returning to auto', () => {
  const WIDE = EDITOR_RAIL_EXPANDED_MIN_WIDTH + 200;
  const NARROW = EDITOR_RAIL_EXPANDED_MIN_WIDTH - 1;

  it('drops the pin once the pane narrows to where the measurement agrees', async () => {
    useUIStore.setState({ editorRailCollapsed: true });
    const view = renderEditor(1600, 'split', WIDE);

    // Still doing work: the pane is wide enough that the default would expand.
    expect(useUIStore.getState().editorRailCollapsed).toBe(true);

    view.rerender(tree(1600, 'split', NARROW));

    await waitFor(() => expect(useUIStore.getState().editorRailCollapsed).toBeNull());
    // Nothing moved — pin and measurement wanted the same thing.
    expect(rail()).toHaveProperty('style.width', `${EDITOR_RAIL_COLLAPSED_WIDTH}px`);
  });

  it('follows the layout again after the pin has dropped', async () => {
    useUIStore.setState({ editorRailCollapsed: true });
    const view = renderEditor(1600, 'split', WIDE);
    view.rerender(tree(1600, 'split', NARROW));
    await waitFor(() => expect(useUIStore.getState().editorRailCollapsed).toBeNull());

    view.rerender(tree(1600, 'split', WIDE));

    expect(rail()).toHaveProperty('style.width', `${EDITOR_RAIL_WIDTH}px`);
  });

  it('returns to auto in one click when the toggle lands on what the layout wants', async () => {
    const user = userEvent.setup();
    useUIStore.setState({ editorRailCollapsed: true });
    renderEditor(1600, 'split', WIDE);

    await user.click(screen.getByRole('button', { name: 'Expand section list' }));

    await waitFor(() => expect(useUIStore.getState().editorRailCollapsed).toBeNull());
    expect(rail()).toHaveProperty('style.width', `${EDITOR_RAIL_WIDTH}px`);
  });

  it('keeps a pin while the pane is still unmeasured', async () => {
    // ⚠️ An unmeasured pane reports 0, which reads as "collapsed". Clearing
    // against that would discard a pinned collapse on every load.
    useUIStore.setState({ editorRailCollapsed: true });
    renderEditor(0, 'split', 0);

    await Promise.resolve();
    expect(useUIStore.getState().editorRailCollapsed).toBe(true);
  });
});

describe('the phone editor', () => {
  it('shows the section list instead of a rail, and no section panel', () => {
    renderEditor(390, 'phone');
    expect(rail()).toBeNull();
    expect(screen.getByRole('navigation', { name: 'Sections' })).toBeTruthy();
    expect(document.querySelector('[data-editor-section]')).toBeNull();
  });

  it('replaces the list with the section, and offers a way back', async () => {
    const user = userEvent.setup();
    renderEditor(390, 'phone');

    await user.click(screen.getByRole('button', { name: /Work Experience/ }));

    expect(document.querySelector('[data-editor-section="work"]')).toBeTruthy();
    const back = screen.getByRole('button', { name: 'All sections' });

    await user.click(back);
    expect(document.querySelector('[data-editor-section]')).toBeNull();
  });
});
