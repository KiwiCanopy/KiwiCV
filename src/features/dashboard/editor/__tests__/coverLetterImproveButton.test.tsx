// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { EditorSectionPanel } from '@/features/dashboard/editor/EditorSectionPanel';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { createDefaultCoverLetter } from '@/types/resume';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * ⚠️ **Deleting the Improve button from the cover-letter panel used to leave
 * every suite green** — 165 files, 3,205 tests, all passing over a PR whose
 * entire user-facing half had been removed. That is the mirror image of an
 * earlier PR, where the BACKEND half was missing and a key-presence assertion signed it off.
 *
 * Nothing else can see it. `aiImprovableSections.test.ts` derives what the rail
 * *may* offer from `RAIL_SECTION_ORDER` minus `AI_EXCLUDED_SECTIONS`, which knows
 * nothing about buttons; its source scan lists buttons pointing at targets the
 * backend cannot serve, so a MISSING button is invisible to it by construction.
 * And `aiSuggestButtonName.test.tsx` enumerates the call sites that exist, so it
 * cannot see a deletion either.
 *
 * ⚠️ This pins the cover letter only. The other eleven sections get their button
 * from `Section`'s own AI-eligibility test, through `SectionHeaderActions`, whose
 * target is templated (`section:${sectionId}`) rather than written out — a
 * different mechanism, and not one a literal scan can check.
 */

vi.mock('@/hooks/useAuth', () => ({
  // Signed in and holding a pass: the guard chain has its own suite, and
  // without a session the control routes to the sign-in gate instead of the
  // menu these cases read.
  useAuth: () => ({ user: {}, profile: {}, isPremium: true, session: {} }),
}));

/** The form beneath the heading is not what this test is about. */
vi.mock('@/components/editor/CoverLetterForm', () => ({
  CoverLetterForm: () => <div data-testid="cover-letter-form" />,
}));

const seedLetter = (paragraphs: string[], subject = '') => {
  useResumeStore.setState((state) => ({
    resume: {
      ...state.resume,
      coverLetter: { ...createDefaultCoverLetter(), enabled: true, paragraphs, subject },
    },
    ai: { ...state.ai, suggestions: {} },
  }));
};

const renderPanel = () =>
  render(
    <MemoryRouter>
      <EditorSectionPanel section="coverLetter" onDeleteCustomSection={() => {}} />
    </MemoryRouter>,
  );

/** The button is icon-only, so its accessible name is the only handle on it. */
const improveButton = () =>
  screen.queryByRole('button', { name: /ai\.optimize_section|Optimize/i });

describe('the cover letter’s Improve button', () => {
  beforeEach(() => {
    seedLetter([]);
  });

  it('is offered once the letter has body text', () => {
    seedLetter(['Dear Hiring Team,', 'I would like to join you.']);
    renderPanel();

    expect(improveButton()).toBeTruthy();
  });

  it('names the cover letter, not just the action', () => {
    seedLetter(['Dear Hiring Team,']);
    renderPanel();

    const name = improveButton()!.getAttribute('aria-label')!;
    // Derived from the heading rather than compared to a literal: both come from
    // `RAIL_LABEL_KEYS.coverLetter`, so this holds when the wording changes and
    // fails when the button stops naming its target. Six of these render on one
    // screen, and a bare "Improve with AI" is a list nobody can navigate by
    // voice or by rotor.
    const heading = screen.getByRole('heading').textContent!;
    expect(heading.length).toBeGreaterThan(3);
    expect(name).toContain(heading);
    expect(improveButton()!.getAttribute('title')).toBe(name);
  });

  /**
   * ⚠️ **Presence and name are not aim.** Point the button at
   * `target="section:work"` and every suite stays green — the name is composed
   * from `RAIL_LABEL_KEYS.coverLetter` either way, and the source scan in
   * `aiImprovableSections.test.ts` only asks whether a scanned target is
   * servable, which `section:work` is. The user would press Improve on the cover
   * letter, spend one of 200 daily requests, and have Work Experience rewritten.
   *
   * The accept state is what binds it: `AISuggestButton` reads its proposal
   * count for its OWN target, so it only reaches that state when the target is
   * the one this section's proposal was recorded against.
   */
  it('aims at the cover letter, not at some other servable section', () => {
    seedLetter(['Dear Hiring Team,']);
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

    renderPanel();

    const name = screen
      .getByRole('button', { name: /Accept all changes/i })
      .getAttribute('aria-label')!;
    expect(name).toContain('Accept all changes');
    expect(name).toContain(screen.getByRole('heading').textContent!);
  });

  /**
   * ⚠️ These three once asserted `toBeNull()` — the control rendered only
   * once a letter existed, so an empty section had no AI affordance at all.
   * Inverting them to "is present" made them assert nothing: the control is now
   * present unconditionally, so `letterHasText` was left uncovered at its own
   * call site. They open the menu and read the Improve row instead, which is
   * what the panel's predicate actually decides.
   */
  // Real translations render in this suite, so match the shipped label as well
  // as the key, exactly as `improveButton` above does.
  const improveRow = () =>
    screen.queryByRole('button', { name: /cover_letter_improve_this|Improve this one/i });

  const openMenu = async (user: UserEvent) => {
    const trigger = improveButton()!;
    trigger.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(improveRow()).toBeTruthy());
  };

  it('offers Improve for real once the letter has body text', async () => {
    const user = userEvent.setup();
    seedLetter(['Dear Hiring Team,']);
    renderPanel();

    await openMenu(user);
    expect(improveRow()!.getAttribute('aria-disabled')).toBeNull();
  });

  /**
   * Unlike the other sections' Improve, this one is never refused on an empty
   * letter: its menu still offers writing one from the job ad. The refusal and
   * its reason live on the Improve row instead.
   */
  it('stays live on an empty letter, so the write path is reachable', async () => {
    const user = userEvent.setup();
    renderPanel();

    expect(improveButton()!.getAttribute('aria-disabled')).toBeNull();
    await openMenu(user);
    const row = improveRow()!;
    expect(row.getAttribute('aria-disabled')).toBe('true');
    const reason = document.getElementById(row.getAttribute('aria-describedby')!);
    expect(reason?.textContent).toMatch(/cover_letter_improve_blocked|no letter to improve/i);
  });

  it('refuses Improve on whitespace, which is not text to improve', async () => {
    const user = userEvent.setup();
    seedLetter(['   ', '\n']);
    renderPanel();

    await openMenu(user);
    expect(improveRow()!.getAttribute('aria-disabled')).toBe('true');
  });

  it('refuses Improve for a subject with no paragraphs — a header is not a letter', async () => {
    const user = userEvent.setup();
    seedLetter([], 'Application for Senior Engineer');
    renderPanel();

    await openMenu(user);
    expect(improveRow()!.getAttribute('aria-disabled')).toBe('true');
  });
});
