// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { CustomSectionForm } from '@/components/editor/CustomSectionForm';
import { PendingProposalsBar } from '@/features/dashboard/editor/proposals/PendingProposalsBar';
import { en } from '@/locales/en/index';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, profile: null, isPremium: false, session: null }),
}));

/**
 * A custom section's heading proposal (`item:custom:<uuid>`, from a translation)
 * is reviewed in place like any entry: a diff panel above the title, the
 * title locked while it is pending, and every bulk accept covering it.
 */

const TOKEN = 'custom:talks';
const TARGET = `item:${TOKEN}`;
const LABEL = en.editor.custom_sections.title_label;
const REASON = en.ai.diff_field_locked;

/** A custom section holding one entry, with no proposal pending. */
const seedSection = () =>
  useResumeStore.setState((state) => ({
    resume: {
      ...state.resume,
      customSections: [
        {
          id: 'talks',
          title: 'Talks',
          items: [{ _vId: 'e1', name: 'Keynote', summary: 'A talk' }],
        },
      ],
    } as never,
    ai: { ...state.ai, reorgSuggestion: null, suggestions: {} },
  }));

/**
 * Records the heading proposal through the real writer — the section apply a
 * custom section's `{ title, items }` response takes — so the key the form reads
 * is the one the store writes, never a spelling copied into this file.
 */
const seedPending = (items: Record<string, unknown>[] = []) => {
  seedSection();
  act(() =>
    useResumeStore.getState().applyAISuggestion(`section:${TOKEN}`, { title: 'Vorträge', items }),
  );
};

const renderSection = () =>
  render(
    <MemoryRouter initialEntries={[`/?section=${TOKEN}`]}>
      <PendingProposalsBar />
      <CustomSectionForm token={TOKEN} onDelete={() => {}} defaultCollapsed={false} />
    </MemoryRouter>,
  );

const liveTitle = () => useResumeStore.getState().resume.customSections[0].title;
const titleField = () => screen.getByLabelText<HTMLInputElement>(LABEL);
const panel = () => screen.queryByRole('region', { name: /the AI rewrote/ });

const describedText = (element: HTMLElement) =>
  (element.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ');

const announced = () =>
  screen
    .queryAllByRole('status')
    .map((node) => node.textContent ?? '')
    .filter(Boolean);

/** Answers the next `confirm()` with yes, as the user pressing Apply would. */
const confirmNext = () =>
  waitFor(() => {
    const { resolve } = useConfirmStore.getState();
    expect(resolve).toBeTruthy();
    act(() => resolve?.(true));
  });

beforeEach(() => useConfirmStore.setState({ isOpen: false, resolve: null }));

afterEach(() => {
  cleanup();
  useResumeStore.setState((state) => ({ ai: { ...state.ai, suggestions: {} } }));
});

describe('a custom section title proposal', () => {
  it('shows the diff panel at the title, naming both versions', () => {
    seedPending();
    renderSection();

    const region = panel();
    expect(region).not.toBeNull();
    const scope = within(region as HTMLElement);
    expect(scope.getByText(LABEL)).toBeTruthy();
    expect(scope.getByText('Talks')).toBeTruthy();
    // The proposal's row, and the section's live name in the panel's accessible name.
    expect(scope.getAllByText('Vorträge')).toHaveLength(2);
    // Above the field it decides.
    expect(
      (region as HTMLElement).compareDocumentPosition(titleField()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('locks the title while pending and leaves the entries editable', async () => {
    const user = userEvent.setup();
    seedPending();
    renderSection();
    const field = titleField();

    expect(field.getAttribute('aria-disabled')).toBe('true');
    expect(field.hasAttribute('readonly')).toBe(true);
    expect(describedText(field)).toContain(REASON);

    await user.click(field);
    await user.keyboard('X');
    await user.tab();
    expect(liveTitle()).toBe('Vorträge');
  });

  it('restores the original title on Keep mine and unlocks it in place', async () => {
    const user = userEvent.setup();
    seedPending();
    renderSection();
    const field = titleField();

    await user.click(screen.getByRole('button', { name: en.ai.diff_keep_mine }));

    expect(liveTitle()).toBe('Talks');
    expect(useResumeStore.getState().ai.suggestions).toEqual({});
    expect(panel()).toBeNull();
    expect(titleField()).toBe(field);
    expect(field.hasAttribute('aria-disabled')).toBe(false);
    expect(announced()).toEqual([
      `Kept your wording for ${LABEL}. No AI proposals left to review.`,
    ]);
  });

  it('keeps the proposed title on Use the proposal', async () => {
    const user = userEvent.setup();
    seedPending();
    renderSection();

    await user.click(screen.getByRole('button', { name: en.ai.diff_replace_field }));

    expect(liveTitle()).toBe('Vorträge');
    expect(useResumeStore.getState().ai.suggestions).toEqual({});
    expect(titleField().hasAttribute('aria-disabled')).toBe(false);
    expect(announced()).toEqual([
      `Used the proposal for ${LABEL}. No AI proposals left to review.`,
    ]);
  });

  it('is counted and accepted by the section header pill', async () => {
    const user = userEvent.setup();
    seedPending();
    renderSection();
    expect(titleField().getAttribute('aria-disabled')).toBe('true');

    await user.click(
      screen.getByRole('button', {
        name: en.ai.accept_all_named.replace('{{name}}', 'Vorträge'),
      }),
    );
    await confirmNext();

    expect(useResumeStore.getState().ai.suggestions).toEqual({});
    expect(liveTitle()).toBe('Vorträge');
    expect(titleField().hasAttribute('aria-disabled')).toBe(false);
  });

  it('is accepted by the pending bar with the rest of the CV', async () => {
    const user = userEvent.setup();
    seedPending([{ _vId: 'e1', improvedFields: { summary: 'A keynote talk' } }]);
    expect(Object.keys(useResumeStore.getState().ai.suggestions).sort()).toEqual([
      TARGET,
      `${TARGET}:e1`,
    ]);
    renderSection();
    expect(titleField().getAttribute('aria-disabled')).toBe('true');

    const bar = screen.getByRole('button', { name: en.ai.accept_all_changes });
    await user.click(bar);
    await confirmNext();

    expect(useResumeStore.getState().ai.suggestions).toEqual({});
    expect(panel()).toBeNull();
    expect(titleField().hasAttribute('aria-disabled')).toBe(false);
  });
});
