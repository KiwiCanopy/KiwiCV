// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { AIComposerBar } from '@/features/dashboard/editor/composer/AIComposerBar';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Signed in with an active Pass and an unspent allowance, so `run()` reaches
 * the hand-off instead of stopping at the sign-in prompt or the paywall.
 *
 * ⚠️ A Pass is now the *only* way to reach the hand-off — AI has no free tier
 * and no per-request top-up — so `useAIUsage` will fetch, and its fetch is
 * stubbed below to keep the test off the network. Before the credits removal
 * this mock was deliberately non-premium with a credit balance, which kept it
 * off the network for free; that route no longer exists.
 */
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    profile: { ai_requests_today: 0 },
    session: { access_token: 'token' },
    isPremium: true,
    refreshProfile: async () => {},
  }),
}));

vi.mock('@/utils/ai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/ai')>()),
  fetchAIUsageStatus: vi.fn(async () => ({ proRequestsToday: 0, isDailyLimitReached: false })),
}));

const render = (ui: React.ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  // ⚠️ The band starts COLLAPSED for a first visit, so its controls are not in
  // the DOM until it is opened. These cases are about what the expanded band
  // hands to the runner, not about the resting state — so open it here rather
  // than teaching every assertion to expand first.
  useUIStore.setState({ aiComposerCollapsed: false });
  useFlowStore.getState().resetPrompt();
  useResumeStore.getState().closeAIModal();
});

const restructure = () => screen.getByRole('checkbox', { name: 'Restructure Skills' });

/**
 * The regression this guards is not "is the checkbox on screen" — it is that the
 * checkbox reaches the runner. The composer skips `AIConfigView` entirely
 * (`openAIModal('cv', { autoRun: true })`), and `useAIRunner` reads the flag
 * straight off `useFlowStore.prompt.allowReorg`, so that store field *is* the
 * hand-off. Before this, a whole-CV run from the bar could never restructure
 * skills and there was no way to ask for it.
 */
describe('the composer Restructure Skills opt-in', () => {
  it('is offered for a whole-CV run', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    // The add-ons appear once the mode can run; `professional` needs no draft.
    fireEvent.click(screen.getByRole('button', { name: 'Professional' }));

    expect(restructure()).toBeTruthy();
    expect((restructure() as HTMLInputElement).checked).toBe(false);
  });

  it('reaches the runner as true when ticked', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fireEvent.click(screen.getByRole('button', { name: 'Professional' }));

    fireEvent.click(restructure());
    fireEvent.click(screen.getByRole('button', { name: 'Improve my CV' }));

    expect(useResumeStore.getState().ai.isModalOpen).toBe(true);
    expect(useFlowStore.getState().prompt.allowReorg).toBe(true);
  });

  it('reaches the runner as false when left alone', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    fireEvent.click(screen.getByRole('button', { name: 'Professional' }));
    fireEvent.click(screen.getByRole('button', { name: 'Improve my CV' }));

    expect(useResumeStore.getState().ai.isModalOpen).toBe(true);
    expect(useFlowStore.getState().prompt.allowReorg).toBe(false);
  });

  /**
   * ⚠️ The composer never reads the store back — the modal calls `resetPrompt()`
   * on close, including after a section-level Improve the bar knows nothing
   * about, so reading back would silently untick the user's choice. It mirrors
   * on change and re-asserts on run instead.
   */
  it('survives the modal resetting the shared prompt draft', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fireEvent.click(screen.getByRole('button', { name: 'Professional' }));

    fireEvent.click(restructure());
    useFlowStore.getState().resetPrompt();
    expect(useFlowStore.getState().prompt.allowReorg).toBe(false);

    expect((restructure() as HTMLInputElement).checked).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Improve my CV' }));

    expect(useFlowStore.getState().prompt.allowReorg).toBe(true);
  });
});
