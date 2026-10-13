// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { AIComposerBar } from '@/features/dashboard/editor/composer/AIComposerBar';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { act, fireEvent, render as rtlRender, screen } from '@testing-library/react';
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

const tickTranslate = () =>
  fireEvent.click(screen.getByRole('checkbox', { name: 'Also translate my CV' }));

// The field is a plain textarea now — there is no summary button to open first.
const pasteJobAd = (text: string) => {
  fireEvent.change(screen.getByRole('textbox', { name: /Job Description/ }), {
    target: { value: text },
  });
};

/**
 * ⚠️ Translation is an **add-on to the selected mode**, not a fourth mode.
 *
 * It used to force `mode = 'translate_close'` and hand off to
 * `openTranslationModal`, which threw away the mode and the pasted ad and ran
 * the translate-only prompt. The backend has a branch written for the combined
 * case (`netlify/functions/lib/ai/prompts.js`), the dialog it detoured through
 * only re-asked for the language the bar had already collected, and the failure
 * was silent — nothing surfaced that the job ad had been dropped.
 */
describe('the composer translate add-on', () => {
  it('keeps the selected mode and the job ad, and names the language', () => {
    const openTranslationModal = vi.spyOn(useResumeStore.getState(), 'openTranslationModal');
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    pasteJobAd('Senior React engineer, remote');
    tickTranslate();
    // ⚠️ NOT 'de'. That is the seeded default now, so asserting it would pass
    // with `onValueChange` deleted.
    fireEvent.change(screen.getByRole('combobox', { name: 'Also translate my CV' }), {
      target: { value: 'fr' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Improve my CV' }));

    const prompt = useFlowStore.getState().prompt;
    expect(prompt.mode).toBe('job_description');
    expect(prompt.jobDescription).toBe('Senior React engineer, remote');

    const ai = useResumeStore.getState().ai;
    expect(ai.isModalOpen).toBe(true);
    expect(ai.autoRun).toBe(true);
    expect(ai.translationTargetLang).toBe('fr');

    // ⚠️ The regression. `isTranslationMode` is the translate-*only* invite; a
    // combined run must not claim to be one, and must not detour through the
    // dialog that would have replaced the mode.
    expect(ai.isTranslationMode).toBe(false);
    expect(openTranslationModal).not.toHaveBeenCalled();
  });

  /**
   * ⚠️ The silent no-op: seeding the target to `cvLanguage` — a value the picker
   * excludes — sent `targetLang === currentLang`, which both ends read as "not a
   * translation", so a ticked box tailored the CV and left it in English.
   */
  it('defaults the target to a language the CV is not already in', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    pasteJobAd('Senior React engineer, remote');
    tickTranslate();
    fireEvent.click(screen.getByRole('button', { name: 'Improve my CV' }));

    const targetLang = useResumeStore.getState().ai.translationTargetLang;
    expect(targetLang).not.toBeNull();
    expect(targetLang).not.toBe(useResumeStore.getState().resume.meta.theme.locale ?? 'en');
  });

  // The derived half of the guard: a pick the option list no longer offers must
  // fall back rather than ride through as `targetLang === currentLang`.
  it('drops a picked target once the CV itself switches into that language', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    pasteJobAd('Senior React engineer, remote');
    tickTranslate();
    fireEvent.change(screen.getByRole('combobox', { name: 'Also translate my CV' }), {
      target: { value: 'fr' },
    });

    // `act` so the store write reaches the render the click then reads from.
    act(() => {
      const { resume, updateMeta } = useResumeStore.getState();
      updateMeta({ theme: { ...resume.meta.theme, locale: 'fr' } });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Improve my CV' }));

    expect(useResumeStore.getState().ai.translationTargetLang).not.toBe('fr');
  });

  it('names no language when the add-on is left alone', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    fireEvent.click(screen.getByRole('button', { name: 'Professional' }));
    fireEvent.click(screen.getByRole('button', { name: 'Improve my CV' }));

    expect(useFlowStore.getState().prompt.mode).toBe('professional');
    expect(useResumeStore.getState().ai.translationTargetLang).toBeNull();
  });
});
