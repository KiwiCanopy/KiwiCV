// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { CoverLetterAIMenu } from '@/components/editor/CoverLetterForm/CoverLetterAIMenu';
import { AIEditModal } from '@/components/modals/ai/edit/AIEditModal';
import { AISuggestButton } from '@/components/ui/AISuggestButton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Section } from '@/components/ui/Section';
import { AIComposerBar } from '@/features/dashboard/editor/composer/AIComposerBar';
import { PendingProposalsBar } from '@/features/dashboard/editor/proposals/PendingProposalsBar';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Where keyboard focus lands when the AI dialog closes, for every control that
 * opens it and every way it closes (WCAG 2.4.3).
 *
 * ⚠️ Every opener is pressed from the keyboard after taking focus: a
 * `fireEvent.click` gives the control no focus, so there is none to lose and
 * the test passes on broken code (`code/UI_PATTERNS.md` § Focus Handoff).
 *
 * The run itself is driven by hand through a mocked `useAIEdit`; the openers,
 * the dialog, the pending bar and the section heading are the real ones, since
 * they are what focus moves between.
 */

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

/** The idle screens are not under test; the header still has to name the dialog. */
vi.mock('@/components/modals/ai/edit/AIEditHeader', async () => {
  const { DialogFrameTitle } = await import('@/components/ui/DialogFrame');
  return { AIEditHeader: () => <DialogFrameTitle>AI dialog</DialogFrameTitle> };
});
vi.mock('@/components/modals/ai/edit/AISelectionView', () => ({ AISelectionView: () => null }));
vi.mock('@/components/modals/ai/edit/AIConfigView', () => ({ AIConfigView: () => null }));

/** The run's status, outside React so the test can move it. */
const run = vi.hoisted(() => {
  let state: { status: string } = { status: 'idle' };
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (next: { status: string }) => {
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
});

vi.mock('@/components/modals/ai/edit/useAIEdit', async () => {
  const { useSyncExternalStore } = await import('react');
  const { useResumeStore: store } = await import('@/store/resume/useResumeStore');
  return {
    useAIEdit: () => {
      const { status } = useSyncExternalStore(run.subscribe, run.get);
      const autoRun = store((state) => state.ai.autoRun);
      const activeTarget = store((state) => state.ai.activeTarget);
      return {
        autoRun,
        activeTarget,
        mode: 'job_description',
        isLoading: false,
        status,
        setStatus: (next: string) => run.set({ status: next }),
        errorMessage: 'Something failed',
        isUpgradeModalOpen: false,
        setIsUpgradeModalOpen: () => {},
        monetizationMode: 'generic',
        closeAIModal: () => store.getState().closeAIModal(),
        resetState: () => run.set({ status: 'idle' }),
        handleGenerate: () => {
          store.getState().setAIGenerating(true);
          run.set({ status: 'processing' });
        },
        handleCoverLetterRetry: () => {},
        changeDetails: { itemsCount: 1, reorgCount: 0 },
        coverLetterOutcome: null,
        runStage: null,
      };
    },
  };
});

const WORK_TARGET = 'item:work:v1';

/** The run lands: generation stops and, on success, proposals arrive. */
const finishRun = (outcome: 'success' | 'error') => {
  act(() => {
    useResumeStore.setState((state) => ({
      ai: {
        ...state.ai,
        isGenerating: false,
        suggestions:
          outcome === 'success'
            ? {
                [WORK_TARGET]: {
                  improvedValue: { summary: 'Improved wording' },
                  originalValue: { summary: 'Original wording' },
                  timestamp: 1,
                },
              }
            : {},
      },
    }));
    run.set({ status: outcome });
  });
};

/** The editor's furniture around the dialog: every opener, the bar, the heading. */
const Harness = ({ url = '/' }: { url?: string }) => (
  <MemoryRouter initialEntries={[url]}>
    <PendingProposalsBar />
    <AIComposerBar isPhone={false} workspaceWidth={1400} />
    <Section title="Work experience" variant="page">
      <AISuggestButton target="section:work" ariaLabel="Optimize Work experience" />
      <CoverLetterAIMenu letterHasText sectionLabel="Cover Letter" />
    </Section>
    <AIEditModal />
    <ConfirmModal />
  </MemoryRouter>
);

/**
 * The focused element, named the way a failure should read: "body" rather than a
 * DOM dump. Compared as strings for that reason, alongside an identity check.
 */
const describeNode = (node: Element | null) =>
  !node || node === document.body
    ? 'body'
    : `${node.tagName.toLowerCase()}[${node.getAttribute('aria-label') ?? node.textContent?.trim()}]`;

const expectFocusOn = (expected: HTMLElement) => {
  expect(describeNode(document.activeElement)).toBe(describeNode(expected));
  expect(document.activeElement).toBe(expected);
};

async function pressWithKeyboard(user: UserEvent, control: HTMLElement) {
  control.focus();
  expectFocusOn(control);
  await user.keyboard('{Enter}');
}

const dialog = () => screen.findByRole('dialog');
const dialogClosed = () =>
  waitFor(() => expect(useResumeStore.getState().ai.isModalOpen).toBe(false));

const composerRun = () => screen.getByRole('button', { name: 'Improve my CV' });
const sectionImprove = () => screen.getByRole('button', { name: 'Optimize Work experience' });
const coverLetterButton = () => screen.getByRole('button', { name: 'Optimize Cover Letter' });
const heading = () => screen.getByRole('heading', { name: 'Work experience' });

type CloseWay = 'escape' | 'close-button' | 'continue';

const closeDialog = async (user: UserEvent, way: CloseWay) => {
  await dialog();
  if (way === 'escape') await user.keyboard('{Escape}');
  if (way === 'close-button')
    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
  if (way === 'continue') await user.click(screen.getByRole('button', { name: 'Continue' }));
  await dialogClosed();
};

beforeEach(() => {
  run.set({ status: 'idle' });
  useResumeStore.getState().closeAIModal();
  useResumeStore.setState((state) => ({
    ai: { ...state.ai, suggestions: {}, reorgSuggestion: null, isGenerating: false },
    resume: {
      ...state.resume,
      work: [{ _vId: 'v1', name: 'Acme', position: 'Engineer', summary: 'Original wording' }],
      coverLetter: { ...(state.resume as { coverLetter?: object }).coverLetter, body: 'Dear team' },
    } as never,
  }));
  useFlowStore.getState().resetPrompt();
  useUIStore.setState({ aiComposerCollapsed: false });
});

/** A run started from inside the dialog: generation begins, then lands. */
const runInDialog = (outcome: 'success' | 'error') => {
  act(() => {
    useResumeStore.getState().setAIGenerating(true);
    run.set({ status: 'processing' });
  });
  finishRun(outcome);
};

/** Types a job ad so the composer can run, and returns its run button. */
const readyComposer = () => {
  fireEvent.change(screen.getByRole('textbox', { name: /Job Description/ }), {
    target: { value: 'Senior React engineer, remote' },
  });
  return composerRun();
};

describe('focus after the AI dialog closes', () => {
  describe('opened from the composer’s run button', () => {
    it.each<CloseWay>(['continue', 'escape', 'close-button'])(
      'after a successful run, closed by %s, lands on the pending bar’s Next section',
      async (way) => {
        const user = userEvent.setup();
        render(<Harness />);
        await pressWithKeyboard(user, readyComposer());
        await dialog();

        finishRun('success');
        await closeDialog(user, way);

        expectFocusOn(screen.getByRole('button', { name: 'Next section' }));
      },
    );

    /** Next section is disabled when the open section holds all the work. */
    it('after a successful run on the only section with work, lands on its heading', async () => {
      const user = userEvent.setup();
      render(<Harness url="/?section=work" />);
      await pressWithKeyboard(user, readyComposer());
      await dialog();

      finishRun('success');
      await closeDialog(user, 'continue');

      expectFocusOn(heading());
    });

    it.each<CloseWay>(['escape', 'close-button'])(
      'after a failed run, closed by %s, lands on the composer’s run button',
      async (way) => {
        const user = userEvent.setup();
        render(<Harness />);
        await pressWithKeyboard(user, readyComposer());
        await dialog();

        finishRun('error');
        await closeDialog(user, way);

        expectFocusOn(composerRun());
      },
    );
  });

  describe('opened from a section’s Improve button', () => {
    it.each<CloseWay>(['escape', 'close-button'])(
      'cancelled by %s, returns to the button',
      async (way) => {
        const user = userEvent.setup();
        render(<Harness />);
        await pressWithKeyboard(user, sectionImprove());

        await closeDialog(user, way);

        expectFocusOn(sectionImprove());
      },
    );

    // The same node throughout; its name changes once proposals land.
    it('after a successful run, returns to the button, now offering accept-all', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      const button = sectionImprove();
      await pressWithKeyboard(user, button);
      await dialog();

      runInDialog('success');
      await closeDialog(user, 'continue');

      expectFocusOn(button);
    });
  });

  describe('opened from the cover letter’s AI menu', () => {
    it.each([
      ['Improve this one', 'escape'],
      ['Improve this one', 'close-button'],
      ['Write one from a job ad', 'escape'],
      ['Write one from a job ad', 'close-button'],
    ] as const)('"%s", closed by %s, returns to the section’s AI button', async (row, way) => {
      const user = userEvent.setup();
      render(<Harness />);
      await pressWithKeyboard(user, coverLetterButton());
      const item = await screen.findByRole('button', { name: row });
      await pressWithKeyboard(user, item);

      // Handing focus back to the button first must not leave it behind the dialog.
      const surface = await dialog();
      await waitFor(() => expect(surface.contains(document.activeElement)).toBe(true));

      await closeDialog(user, way);

      expectFocusOn(coverLetterButton());
    });

    /** The button is natively disabled for the run, and enabled again by close. */
    it('"Improve this one", after a successful run and Continue, returns to the button', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      const button = coverLetterButton();
      await pressWithKeyboard(user, button);
      await pressWithKeyboard(
        user,
        await screen.findByRole('button', { name: 'Improve this one' }),
      );
      await dialog();

      runInDialog('success');
      await closeDialog(user, 'continue');

      expectFocusOn(button);
    });
  });

  describe('opened from the phone band', () => {
    const PhoneHarness = () => (
      <MemoryRouter>
        <PendingProposalsBar />
        <AIComposerBar isPhone workspaceWidth={375} />
        <Section title="Work experience" variant="page">
          {null}
        </Section>
        <AIEditModal />
      </MemoryRouter>
    );
    const band = () => screen.getByRole('button', { name: 'Improve with AI' });

    it('cancelled, returns to the band', async () => {
      const user = userEvent.setup();
      render(<PhoneHarness />);
      const opener = band();
      await pressWithKeyboard(user, opener);

      await closeDialog(user, 'escape');

      expectFocusOn(opener);
    });

    /** The band returns `null` once proposals are pending, so the opener is gone. */
    it('after a successful run and Continue, lands on the pending bar’s Next section', async () => {
      const user = userEvent.setup();
      render(<PhoneHarness />);
      await pressWithKeyboard(user, band());
      await dialog();

      runInDialog('success');
      await closeDialog(user, 'continue');

      expectFocusOn(screen.getByRole('button', { name: 'Next section' }));
    });
  });
});
