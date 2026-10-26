// @vitest-environment jsdom
import { useTranslationInvite } from '@/hooks/useTranslationInvite';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key, uiLanguage: 'en' }),
}));

vi.mock('@/hooks/useAIEntryGuard', () => ({
  useAIEntryGuard: () => ({ allowRun: () => true, modals: null }),
}));

const openTranslationModal = vi.fn();

function Host() {
  const { inviteToTranslate, modals } = useTranslationInvite();
  return (
    <>
      <button type="button" onClick={() => void inviteToTranslate('fr')}>
        invite
      </button>
      {modals}
    </>
  );
}

beforeEach(() => {
  openTranslationModal.mockClear();
  useResumeStore.setState({ openTranslationModal });
  useFlowStore.getState().resetPrompt();
});

/** Restructure is on by default (#57); a translate-only run must not regroup skills unasked. */
describe('the translate-only invite', () => {
  it('opens its run with Restructure Skills unticked', async () => {
    expect(useFlowStore.getState().prompt.allowReorg).toBe(true);
    render(<Host />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'invite' }));
    });
    fireEvent.click(screen.getByRole('button', { name: 'ai.translation_invite_confirm' }));

    expect(openTranslationModal).toHaveBeenCalledWith('fr');
    expect(useFlowStore.getState().prompt.allowReorg).toBe(false);
  });
});
