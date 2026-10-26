// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { AIComposerBar } from '@/features/dashboard/editor/composer/AIComposerBar';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    session: null,
    isPremium: false,
    refreshProfile: async () => {},
  }),
}));

// jsdom never wraps, so the drop cascade is driven by a row that always has.
vi.mock('@/features/dashboard/editor/composer/rowHasWrapped', () => ({
  rowHasWrapped: () => true,
}));

beforeEach(() => {
  useUIStore.setState({ aiComposerCollapsed: false });
  useFlowStore.getState().resetPrompt();
});

describe('a closed row with no room left', () => {
  it('counts the add-ons rather than dropping them, after the label and modes are gone', () => {
    render(
      <MemoryRouter>
        <AIComposerBar isPhone={false} workspaceWidth={800} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Professional' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Also translate my CV' }));
    fireEvent.click(screen.getByRole('button', { name: 'Improve with AI' }));

    // Restructure (on by default, #57) plus the translation.
    expect(document.querySelector('[data-composer-addons]')?.textContent).toBe('+2 options');
    expect(screen.getByRole('button', { name: 'Improve' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Professional' })).toBeNull();
  });
});
