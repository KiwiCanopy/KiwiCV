// @vitest-environment jsdom
import { MemoryRouter, useSearchParams } from 'react-router-dom';

import { usePendingProposals } from '@/features/dashboard/editor/proposals/usePendingProposals';
import { RAIL_SECTION_ORDER } from '@/features/dashboard/editor/rail/railSections';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

const suggestion = () => ({
  originalValue: { summary: 'before' },
  improvedValue: { summary: 'after' },
  timestamp: 1,
});

function seed(targets: string[]) {
  useResumeStore.setState((state) => ({
    ai: {
      ...state.ai,
      reorgSuggestion: null,
      suggestions: Object.fromEntries(targets.map((target) => [target, suggestion()])),
    },
  }));
}

/**
 * The URL is half the behaviour under test, so the probe returns the live
 * `?section=` alongside the hook rather than asserting on a rendered string.
 */
const mount = (initialSection?: string) =>
  renderHook(
    () => {
      const proposals = usePendingProposals();
      const [searchParams] = useSearchParams();
      return { ...proposals, currentSection: searchParams.get('section') };
    },
    {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={[initialSection ? `/?section=${initialSection}` : '/']}>
          {children}
        </MemoryRouter>
      ),
    },
  );

beforeEach(() => {
  useResumeStore.setState((state) => ({
    ai: { ...state.ai, suggestions: {}, reorgSuggestion: null },
  }));
});

describe('the Review next stepper', () => {
  it('no-ops when nothing is pending', () => {
    const { result } = mount('work');
    expect(result.current.total).toBe(0);
    expect(result.current.next).toBeNull();

    act(() => result.current.reviewNext());
    expect(result.current.currentSection).toBe('work');
  });

  it('counts every proposal and groups them by rail row', () => {
    seed(['item:work:a', 'item:work:b', 'item:education:c']);
    const { result } = mount();

    expect(result.current.total).toBe(3);
    expect(result.current.sectionKeys).toEqual(['work', 'education']);
  });

  /**
   * ⚠️ Rail order, not `Object.keys(suggestions)` order. The store is keyed by
   * target, so its insertion order is whatever the model answered in — stepping
   * that way sends the user up and down the CV at random.
   */
  it('steps in rail order regardless of the order the proposals arrived in', () => {
    seed(['item:interests:c', 'item:work:a']);
    const { result } = mount();

    expect(RAIL_SECTION_ORDER.indexOf('work')).toBeLessThan(
      RAIL_SECTION_ORDER.indexOf('interests'),
    );
    expect(result.current.next).toBe('work');
  });

  it('starts after the current section, so pressing it twice moves twice', () => {
    seed(['item:work:a', 'item:education:b']);
    const { result } = mount('work');

    expect(result.current.next).toBe('education');
    act(() => result.current.reviewNext());
    expect(result.current.currentSection).toBe('education');
  });

  it('wraps at the end of the rail', () => {
    seed(['item:work:a', 'item:education:b']);
    const { result } = mount('interests');

    // `interests` is the last content row, so the next pending section is the
    // first one again.
    expect(result.current.next).toBe('work');
  });

  /**
   * ⚠️ Reversed. This used to assert the opposite — a single remaining section
   * wrapped to itself so the button stayed enabled "while there is still work
   * on screen". That made *Review next* navigate to the section already open,
   * which is a dead control; the remaining work is visible beneath the bar and
   * does not need a button that goes nowhere to advertise it.
   */
  it('goes null when the only remaining section is the one already open', () => {
    seed(['item:work:a']);
    const { result } = mount('work');

    expect(result.current.next).toBeNull();
  });

  // The reversal must not disable the button whenever the current section has
  // work — only when it is the LAST one. Two pending sections still step.
  it('still offers the other section when the open one is not the last', () => {
    seed(['item:work:a', 'item:education:b']);
    const { result } = mount('work');

    expect(result.current.next).toBe('education');
  });

  it('discards every proposal and restores the original wording', () => {
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        basics: { ...state.resume.basics, summary: 'after' },
      },
    }));
    seed(['item:basics']);
    const { result } = mount();

    act(() => result.current.discardAll());

    expect(useResumeStore.getState().resume.basics.summary).toBe('before');
    expect(useResumeStore.getState().ai.suggestions).toEqual({});
  });

  it('accepts every proposal by clearing the pending set, keeping the new wording', () => {
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        basics: { ...state.resume.basics, summary: 'after' },
      },
    }));
    seed(['item:basics']);
    const { result } = mount();

    act(() => result.current.acceptAll());

    expect(useResumeStore.getState().resume.basics.summary).toBe('after');
    expect(useResumeStore.getState().ai.suggestions).toEqual({});
  });
});
