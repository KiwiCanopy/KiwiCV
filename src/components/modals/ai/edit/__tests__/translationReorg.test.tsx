// @vitest-environment jsdom
import { AIEditModal } from '@/components/modals/ai/edit/AIEditModal';
import { AI_REORG_DEFAULT } from '@/constants/ai';
import { en } from '@/locales/en/index';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Restructure Skills starts ticked (#57), except in the translate-only dialog,
 * which keeps the CV's structure unless the user ticks it there. That choice is
 * per-open and never written to the shared, tab-persisted prompt draft.
 * Rendered through `AIEditModal` with only the network stubbed.
 */

const handleGenerate = vi.fn();

vi.mock('@/components/modals/ai/edit/useAIGeneration', () => ({
  useAIGeneration: () => ({
    isLoading: false,
    status: 'idle',
    setStatus: vi.fn(),
    errorMessage: '',
    changeDetails: undefined,
    coverLetterOutcome: null,
    runStage: null,
    handleGenerate,
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    profile: {},
    session: { access_token: 'token' },
    isPremium: true,
    refreshProfile: async () => {},
  }),
}));

vi.mock('@/utils/ai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/ai')>()),
  fetchAIUsageStatus: vi.fn(async () => ({ proRequestsToday: 0, isDailyLimitReached: false })),
}));

vi.mock('@/components/modals/InsufficientPremiumAccessModal', () => ({
  InsufficientPremiumAccessModal: () => null,
}));

const reorg = () => document.getElementById('allow-reorg') as HTMLInputElement;
const stored = () => useFlowStore.getState().prompt.allowReorg;

beforeEach(() => {
  handleGenerate.mockClear();
  useFlowStore.getState().resetPrompt();
  useFlowStore.getState().setPromptMode('professional');
  useResumeStore.getState().closeAIModal();
});

describe('Restructure Skills in the AI dialog', () => {
  it('starts ticked for a whole-CV run', async () => {
    useResumeStore.getState().openAIModal('cv');
    render(<AIEditModal />);
    await screen.findByRole('button', { name: en.ai.suggest });

    expect(reorg().checked).toBe(AI_REORG_DEFAULT);
  });

  it('starts unticked for a translate-only run, without touching the shared draft', async () => {
    useResumeStore.getState().openTranslationModal('fr');
    render(<AIEditModal />);
    await screen.findByRole('button', { name: en.ai.suggest });

    expect(reorg().checked).toBe(false);
    expect(stored()).toBe(AI_REORG_DEFAULT);

    fireEvent.click(screen.getByRole('button', { name: en.ai.suggest }));
    expect(handleGenerate.mock.calls[0]?.[0]).toMatchObject({ allowReorg: false });
  });

  it('lets a translate-only run opt in, still without writing the draft', async () => {
    useResumeStore.getState().openTranslationModal('fr');
    render(<AIEditModal />);
    await screen.findByRole('button', { name: en.ai.suggest });

    fireEvent.click(reorg());
    expect(reorg().checked).toBe(true);
    expect(stored()).toBe(AI_REORG_DEFAULT);

    fireEvent.click(screen.getByRole('button', { name: en.ai.suggest }));
    expect(handleGenerate.mock.calls[0]?.[0]).toMatchObject({ allowReorg: true });
  });
});
