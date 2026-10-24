// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { CoverLetterForm } from '@/components/editor/CoverLetterForm/CoverLetterForm';
import { AISuggestButton } from '@/components/ui/AISuggestButton';
import { AIComposerBar } from '@/features/dashboard/editor/composer/AIComposerBar';
import { useTranslationInvite } from '@/hooks/useTranslationInvite';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { sectionTarget } from '@/utils/aiTarget';
import { act, renderHook, render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Every AI entry point owes the same two checks before starting a run, and
 * `useAIEntryGuard` extracts them because a duplicated chain is how one
 * entry point ends up unguarded. Three of five hand-rolled it anyway.
 *
 * ⚠️ **The suites around these surfaces mock `useAuth` as premium**, which is
 * exactly why none of them could see the copies drift: they never reach either
 * guarded branch. These drive both — signed out, and signed in without a pass.
 *
 * ⚠️ **Both branches, because they fail differently.** Signed out routes to the
 * wall; signed in without a pass opens the paywall, and that half is only
 * reachable if the consumer actually mounted `modals`. An earlier cut of this
 * file tested the signed-out branch alone, so deleting the paywall mount left
 * every case green while a Free user's press became a silent no-op — the exact
 * failure the hook's docstring says returning `modals` exists to prevent.
 *
 * ⚠️ **Real surfaces, not the hook.** `renderHook(() => useAIComposer())` is one
 * rung above the button and never presses the bar's run button; the earlier
 * cut of this file claimed otherwise in a comment while doing exactly that.
 */
const auth = vi.hoisted(() => ({
  current: {
    user: null as { id: string } | null,
    profile: null as Record<string, unknown> | null,
    session: null as { access_token: string } | null,
    isPremium: false,
    loading: false,
    refreshProfile: async () => {},
  },
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => auth.current }));

vi.mock('@/utils/ai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/ai')>()),
  fetchAIUsageStatus: vi.fn(async () => ({ proRequestsToday: 0, isDailyLimitReached: false })),
}));

const SIGNED_OUT = { ...auth.current };
const SIGNED_IN_NO_PASS = {
  ...auth.current,
  user: { id: 'u1' },
  session: { access_token: 't' },
  isPremium: false,
};

/** These surfaces read the router; `composerBar.test.tsx` wraps the same way. */
const render = (ui: React.ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

const authState = () => useFlowStore.getState().auth;

/** `run()` returns early on `!canRun`, so seed the draft before the bar mounts. */
function giveTheComposerSomethingToRun() {
  // Open: closed, a job-ad run shows only the entry button (#27).
  useUIStore.setState({ aiComposerCollapsed: false });
  useFlowStore.getState().setPromptMode('job_description');
  useFlowStore.getState().setJobDescription('Senior Frontend Engineer, React, TypeScript.');
}

const composerRun = () => screen.getByRole('button', { name: /^Improve my CV$/ });

beforeEach(() => {
  auth.current = { ...SIGNED_OUT };
  useFlowStore.getState().resetAuth();
  useFlowStore.getState().resetPrompt();
});

afterEach(() => {
  useFlowStore.getState().resetAuth();
  useFlowStore.getState().resetPrompt();
});

describe('a signed-out press at each AI entry point', () => {
  it('routes the composer run to the sign-in wall instead of starting a run', async () => {
    const user = userEvent.setup();
    giveTheComposerSomethingToRun();
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    await user.click(composerRun());

    expect(authState().authSurface).toBe('google');
    expect(authState().source).toBe('ai_suggest');
  });

  it('routes a section AI control to the sign-in wall', async () => {
    const user = userEvent.setup();
    render(<AISuggestButton target={sectionTarget('work')} />);

    await user.click(screen.getByRole('button'));

    expect(authState().authSurface).toBe('google');
  });

  /** The entry point the guard was written for. */
  it('routes the cover letter empty state to the sign-in wall', async () => {
    const user = userEvent.setup();
    render(<CoverLetterForm />);

    const trigger = screen.getAllByRole('button').find((b) => /ai|ki/i.test(b.textContent ?? ''));
    if (trigger) await user.click(trigger);

    expect(authState().authSurface).toBe('google');
  });

  it('routes the translation invite to the sign-in wall, under its own source', () => {
    const { result, rerender } = renderHook(() => useTranslationInvite());

    act(() => void result.current.inviteToTranslate('de'));
    rerender();
    render(<>{result.current.modals}</>);
    act(() => {
      screen.getByRole('button', { name: /let.s do it/i }).click();
    });

    expect(authState().authSurface).toBe('google');
    // Not `ai_suggest`: this surface's own funnel.
    expect(authState().source).toBe('translation_invite');
  });

  /** One wall for all of them, and it is the AI one (owner, 2026-09-07). */
  it('raises the AI sign-in wall, not the Drive one', async () => {
    const user = userEvent.setup();
    giveTheComposerSomethingToRun();
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    await user.click(composerRun());

    expect(authState().description).toBe('To use AI features, please sign in with Google first.');
  });
});

describe('a signed-in press without a pass', () => {
  beforeEach(() => {
    auth.current = { ...SIGNED_IN_NO_PASS };
  });

  /**
   * ⚠️ The mount, not the decision. `allowRun` returning false is useless if the
   * consumer never rendered `modals` — the press becomes a button that does
   * nothing at all, which is what the hook returns JSX to prevent.
   */
  it('opens the paywall the composer mounts, rather than doing nothing', async () => {
    const user = userEvent.setup();
    giveTheComposerSomethingToRun();
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    await user.click(composerRun());

    expect(authState().authSurface).not.toBe('google');
    expect(await screen.findByRole('dialog')).toBeTruthy();
  });
});
