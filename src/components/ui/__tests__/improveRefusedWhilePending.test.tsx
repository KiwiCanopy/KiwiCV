// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { AccordionItem } from '@/components/ui/Accordion';
import { Section } from '@/components/ui/Section';
import { useResumeStore } from '@/store/resume/useResumeStore';
import {
  expectLive,
  expectRefused,
  improve,
  job,
  openAIModal,
  seedWork,
} from '@/test/improveRefusal';
import { type ResumeData } from '@/types/resume';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * One proposal per entry at a time: a second run would turn the first
 * proposal into the user's side. Refused like an empty entry, with its own reason.
 */

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: {}, profile: {}, isPremium: true, session: {} }),
}));

beforeEach(() => {
  openAIModal.mockReset();
  seedWork([]);
});

describe('entry Improve while a proposal is pending', () => {
  const pendingJob = { ...job, _vId: 'v1' } as ResumeData['work'][number];
  const seedPending = () =>
    useResumeStore.setState((state) => ({
      resume: { ...state.resume, work: [pendingJob] },
      ai: {
        ...state.ai,
        suggestions: {
          'item:work:v1': {
            originalValue: { position: 'Engineer' },
            improvedValue: { position: 'Senior Engineer' },
            timestamp: 1,
          },
        },
      },
    }));
  const renderEntry = () =>
    render(
      <MemoryRouter>
        <AccordionItem title="Acme" aiTarget={{ target: 'item:work:v1', isEmpty: false }}>
          <p>fields</p>
        </AccordionItem>
      </MemoryRouter>,
    );

  it('is refused, saying the proposal comes first', async () => {
    seedPending();
    renderEntry();
    await expectRefused(/Review the AI proposals for this entry first/);
  });

  it.each([
    ['accepted', () => useResumeStore.getState().acceptAISuggestion('item:work:v1')],
    ['rejected', () => useResumeStore.getState().declineAISuggestion('item:work:v1')],
  ])('is live again once the proposal is %s', async (_, decide) => {
    seedPending();
    renderEntry();
    expect(improve().getAttribute('aria-disabled')).toBe('true');
    act(decide);
    await expectLive();
  });

  /**
   * The section header cannot start a run over it either: the entry's proposal
   * turns that button into Accept all, so no section run reaches `recordProposal`.
   */
  it('turns the section header into Accept all, not Improve', () => {
    seedPending();
    render(
      <MemoryRouter>
        <Section title="Work" sectionId="work" variant="page">
          <p>body</p>
        </Section>
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /Accept all changes/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Optimize|Improve/i })).toBeNull();
  });
});
