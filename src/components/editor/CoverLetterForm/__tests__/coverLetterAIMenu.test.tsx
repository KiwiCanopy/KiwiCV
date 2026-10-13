// @vitest-environment jsdom
import { CoverLetterAIMenu } from '@/components/editor/CoverLetterForm/CoverLetterAIMenu';
import { startCoverLetterDraft } from '@/components/editor/CoverLetterForm/coverLetterDraft';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

/** Signed in and holding a pass — the guards are covered by their own suite. */
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: {}, profile: {}, isPremium: true, session: {} }),
}));

const openMenu = async (user: UserEvent) => {
  const trigger = screen.getByRole('button', { name: 'ai.optimize_section' });
  trigger.focus();
  await user.keyboard('{Enter}');
  return trigger;
};

const rows = () => ({
  write: screen.queryByRole('button', { name: 'ai.cover_letter_write_from_ad' }),
  improve: screen.queryByRole('button', { name: 'ai.cover_letter_improve_this' }),
});

beforeEach(() => {
  useFlowStore.setState((state) => ({
    prompt: { ...state.prompt, mode: null, draftCoverLetter: false },
  }));
  useResumeStore.getState().closeAIModal();
});

afterEach(() => {
  useResumeStore.setState((state) => ({ ai: { ...state.ai, suggestions: {} } }));
});

describe('the cover letter’s AI chooser', () => {
  it('offers both routes, whether or not there is a letter', async () => {
    const user = userEvent.setup();
    render(<CoverLetterAIMenu letterHasText sectionLabel="Cover Letter" />);

    await openMenu(user);

    await waitFor(() => expect(rows().write).toBeTruthy());
    expect(rows().improve).toBeTruthy();
  });

  /**
   * ⚠️ Disabled, never absent. A menu that changes shape between two and one row
   * teaches the user nothing about why, and `Button` keeps an `aria-disabled`
   * control in the accessibility tree with its reason attached.
   */
  it('keeps Improve visible and refused while the letter is empty', async () => {
    const user = userEvent.setup();
    render(<CoverLetterAIMenu letterHasText={false} sectionLabel="Cover Letter" />);

    await openMenu(user);

    await waitFor(() => expect(rows().improve).toBeTruthy());
    expect(rows().improve!.getAttribute('aria-disabled')).toBe('true');
    expect(rows().write!.getAttribute('aria-disabled')).toBeNull();
    expect(screen.getByText('ai.cover_letter_improve_blocked')).toBeTruthy();
  });

  it('opens the composer already asking for a letter', async () => {
    const user = userEvent.setup();
    render(<CoverLetterAIMenu letterHasText={false} sectionLabel="Cover Letter" />);

    await openMenu(user);
    await waitFor(() => expect(rows().write).toBeTruthy());
    await user.click(rows().write!);

    const { prompt } = useFlowStore.getState();
    // ⚠️ Mode as well as the tick: `coverLetterBlocker` checks mode FIRST, so
    // without it the control opens a composer that refuses the thing it
    // promised.
    expect(prompt.mode).toBe('job_description');
    expect(prompt.draftCoverLetter).toBe(true);
    expect(useResumeStore.getState().ai.isModalOpen).toBe(true);
  });

  /**
   * ⚠️ Binds the ORDER of the branches, which is the regression that is easy to
   * introduce: hoisting `onIdleActivate` above the accept-all check turns
   * **Accept all changes** — which applies proposals irreversibly — into "open
   * a menu". Verified failing on exactly that mutation.
   */
  it('accepts pending proposals instead of opening, once there are any', async () => {
    const user = userEvent.setup();
    useResumeStore.setState((state) => ({
      ai: {
        ...state.ai,
        suggestions: {
          'section:coverLetter': {
            originalValue: { subject: 'Application' },
            improvedValue: { subject: 'Application for the payments role' },
            timestamp: Date.now(),
          },
        },
      },
    }));

    render(<CoverLetterAIMenu letterHasText sectionLabel="Cover Letter" />);

    const trigger = screen.getByRole('button', { name: /accept_all_named/i });
    trigger.focus();
    await user.keyboard('{Enter}');

    expect(rows().write).toBeNull();
    expect(rows().improve).toBeNull();
  });
});

/**
 * ⚠️ `useFlowStore` persists to `sessionStorage`, and `resetPrompt` deliberately
 * leaves `draftCoverLetter` alone so the composer band and the modal keep one
 * source of truth. That is about a tick the USER set. A tick KiwiCV
 * pre-set must not outlive its own dialog, or the next composer opened for
 * something else arrives already ticked.
 *
 * ⚠️ The intent rides on the resume store's `ai` slice, which `partialize`
 * excludes, rather than on the persisted prompt — a reload must not resurrect a
 * preset for a dialog that no longer exists (`aiModalPersistence.test.ts` makes
 * the same argument for `autoRun`).
 */
describe('the pre-set tick', () => {
  it('is recorded as this dialog’s intent, not as persisted data', () => {
    startCoverLetterDraft();

    expect(useResumeStore.getState().ai.presetCoverLetter).toBe(true);
    expect(useFlowStore.getState().prompt.draftCoverLetter).toBe(true);
  });

  it('is dropped when the dialog closes', () => {
    startCoverLetterDraft();
    useResumeStore.getState().closeAIModal();

    expect(useResumeStore.getState().ai.presetCoverLetter).toBe(false);
  });

  it('does not mark a tick the user set themselves', () => {
    useFlowStore.getState().setDraftCoverLetter(true);

    expect(useResumeStore.getState().ai.presetCoverLetter).toBe(false);
  });

  /**
   * ⚠️ **This control must not rewrite the CV.** It lives on the Cover Letter
   * section and promises a letter; before 2026-09-08 it opened an ordinary
   * whole-CV run, so pressing it tailored the entire CV, offered to translate
   * it, offered to regroup the skills, and billed two requests. The target
   * stays `'cv'` — the worker needs that granularity to allow the letter call
   * at all — so this flag is the only thing that says call 1 is skipped.
   */
  it('asks for the letter alone, without leaving the whole-CV target', () => {
    startCoverLetterDraft();

    expect(useResumeStore.getState().ai.coverLetterOnly).toBe(true);
    expect(useResumeStore.getState().ai.activeTarget).toBe('cv');
  });

  it('drops the letter-only intent when the dialog closes', () => {
    startCoverLetterDraft();
    useResumeStore.getState().closeAIModal();

    expect(useResumeStore.getState().ai.coverLetterOnly).toBe(false);
  });

  /**
   * ⚠️ Cleared on every open, not merely on close. A dialog opened from the
   * composer bar after this one is a whole-CV run, and inheriting the flag
   * would silently skip the tailoring the user asked for.
   */
  it('is absent when any other surface opens the dialog', () => {
    startCoverLetterDraft();
    useResumeStore.getState().openAIModal('cv');

    expect(useResumeStore.getState().ai.coverLetterOnly).toBe(false);
  });
});

describe('the chooser as a disclosure', () => {
  /**
   * ⚠️ Radix cannot supply this. The menu ANCHORS to the button rather than
   * triggering from it (`handleClick` calls `stopPropagation`, so a trigger
   * never sees the click), and `PopoverAnchor` adds no disclosure semantics —
   * so without this the button never says it opens a menu (WCAG 4.1.2).
   */
  it('says it opens a menu, and whether it is open', async () => {
    const user = userEvent.setup();
    render(<CoverLetterAIMenu letterHasText sectionLabel="Cover Letter" />);

    const trigger = screen.getByRole('button', { name: 'ai.optimize_section' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    trigger.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('true'));
  });

  /**
   * ⚠️ Radix restores focus through `triggerRef`, which an anchor never sets, so
   * closing would drop focus to `<body>` — the same WCAG 2.4.3 defect already fixed
   * for dialogs, reached through a different primitive.
   */
  it('gives focus back to the control that opened it', async () => {
    const user = userEvent.setup();
    render(<CoverLetterAIMenu letterHasText sectionLabel="Cover Letter" />);

    const trigger = screen.getByRole('button', { name: 'ai.optimize_section' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(rows().write).toBeTruthy());

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement).toBe(trigger);
    });
  });
});
