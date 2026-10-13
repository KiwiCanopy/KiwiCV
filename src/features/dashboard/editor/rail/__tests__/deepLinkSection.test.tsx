// @vitest-environment jsdom
import { MemoryRouter, useSearchParams } from 'react-router-dom';

import { EditorTab } from '@/features/dashboard/editor/EditorTab';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * `?section=` was already the editor's deep-link contract — the Design tab jumps
 * to a section with it from three call sites. The rail reads and writes the same
 * parameter rather than owning its own selection state, so those jumps keep
 * working with no call-site change and a rail click stays shareable.
 *
 * ⚠️ `?section=privateProjects` is the case worth pinning. It used to be folded
 * onto `projects` by a `normalizedTargetSection` fudge in `EditorTab`, because
 * one component mounted both lists; the rail gives it a row and a panel of its
 * own, and that fudge is gone.
 */

const ParamProbe = () => {
  const [params] = useSearchParams();

  return <output data-testid="section-param">{params.get('section') ?? ''}</output>;
};

const renderEditor = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <EditorTab workspaceLayout="split" workspaceWidth={1400} editorPaneWidth={900} />
      <ParamProbe />
    </MemoryRouter>,
  );

beforeEach(() => {
  useResumeStore.setState({ resume: buildSingleItemResume('lunar') });
  useUIStore.setState({ editorRailCollapsed: false });
});

describe('the editor rail and ?section=', () => {
  it('mounts the deep-linked section', () => {
    renderEditor('/?section=work');
    expect(document.querySelector('[data-editor-section="work"]')).toBeTruthy();
    expect(document.querySelector('[data-editor-section="education"]')).toBeNull();
  });

  it('mounts Private Projects on its own, not the public list', () => {
    renderEditor('/?section=privateProjects');
    expect(document.querySelector('[data-editor-section="privateProjects"]')).toBeTruthy();
    expect(document.querySelector('[data-editor-section="projects"]')).toBeNull();
  });

  it('falls back to Basics when no section is named', () => {
    renderEditor('/');
    expect(document.querySelector('[data-editor-section="basics"]')).toBeTruthy();
  });

  it('ignores a section name that is not a rail row', () => {
    renderEditor('/?section=meta');
    expect(document.querySelector('[data-editor-section="basics"]')).toBeTruthy();
  });

  it('writes the parameter when a row is clicked', async () => {
    const user = userEvent.setup();
    renderEditor('/?section=work');

    await user.click(screen.getByRole('button', { name: /Education/ }));

    expect(screen.getByTestId('section-param').textContent).toBe('education');
    expect(document.querySelector('[data-editor-section="education"]')).toBeTruthy();
  });

  it('gives Social Profiles a row of its own, separate from Basics', async () => {
    const user = userEvent.setup();
    renderEditor('/?section=basics');

    await user.click(screen.getByRole('button', { name: /Social Profiles/ }));

    expect(screen.getByTestId('section-param').textContent).toBe('profiles');
    expect(document.querySelector('[data-editor-section="profiles"]')).toBeTruthy();
    expect(document.querySelector('[data-editor-section="basics"]')).toBeNull();
  });
});
