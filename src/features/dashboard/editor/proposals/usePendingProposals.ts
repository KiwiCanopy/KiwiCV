import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { asRailSectionKey, editorRailOrder } from '@/features/dashboard/editor/rail/railSections';
import { type EditorSectionKey } from '@/features/dashboard/editor/rail/types';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { getAISuggestionCount } from '@/utils/ai';
import { isAITargetKey, isItemTarget } from '@/utils/aiTarget';
import { focusIfPossible, sectionHeadingAnchor } from '@/utils/focus';
import { isCustomSectionToken } from '@/utils/layout/customSections';

/**
 * Every pending AI proposal in the CV, grouped by rail row.
 *
 * ⚠️ One derivation, two consumers. The rail's per-row pill and the pending bar's
 * headline used to be two calls to `getAISuggestionCount` with different scopes;
 * a row could then read "2" while the bar said the CV was clean. Both read this.
 */
export function usePendingProposals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const resume = useResumeStore((state) => state.resume);
  const suggestions = useResumeStore((state) => state.ai.suggestions);
  const reorgSuggestion = useResumeStore((state) => state.ai.reorgSuggestion);
  const acceptAllSuggestions = useResumeStore((state) => state.acceptAllSuggestions);
  const declineAISuggestion = useResumeStore((state) => state.declineAISuggestion);
  const declineReorg = useResumeStore((state) => state.declineReorg);

  /** Every row the rail shows, in its order: the built-ins, then each custom section. */
  const railOrder = useMemo(() => editorRailOrder(resume), [resume]);

  const countsBySection = useMemo(
    () =>
      railOrder.reduce(
        (acc, key) => {
          acc[key] = getAISuggestionCount(suggestions, [key], reorgSuggestion, resume);
          return acc;
        },
        {} as Record<EditorSectionKey, number>,
      ),
    [railOrder, suggestions, reorgSuggestion, resume],
  );

  /** In rail order, so "next" steps the way the user reads. */
  const sectionKeys = useMemo(
    () => railOrder.filter((key) => countsBySection[key] > 0),
    [railOrder, countsBySection],
  );

  const total = useMemo(
    () => sectionKeys.reduce((sum, key) => sum + countsBySection[key], 0),
    [countsBySection, sectionKeys],
  );

  const activeSection = asRailSectionKey(searchParams.get('section'), resume);

  /**
   * The next row with work, wrapping at the end of the rail.
   *
   * ⚠️ Starts *after* the current row, so pressing Review next twice moves twice.
   *
   * ⚠️ **Returns `null` when the only remaining row is the one you are on**,
   * reversing an earlier decision to wrap to self so the button "stays honest
   * about there being work". It did the opposite: a control labelled *Review
   * next* that navigates to the section already open is a dead button, and the
   * work it was being honest about is visible directly beneath it. Third
   * instance of that shape in one day.
   */
  const next = useMemo<EditorSectionKey | null>(() => {
    if (sectionKeys.length === 0) return null;
    if (activeSection && sectionKeys.length === 1 && sectionKeys[0] === activeSection) return null;
    const size = railOrder.length;
    const start = activeSection ? railOrder.indexOf(activeSection) : -1;
    for (let step = 1; step <= size; step++) {
      const candidate = railOrder[(start + step + size) % size];
      if (countsBySection[candidate] > 0) return candidate;
    }
    return null;
  }, [activeSection, countsBySection, railOrder, sectionKeys]);

  /**
   * ⚠️ Focus follows the navigation, and it has to. Stepping to the last section
   * with work makes `next` null, which disables the button the user is standing
   * on — and a disabled control drops focus to `<body>`, re-entering the focus
   * bug one keystroke past its fix. The heading names the section just arrived at, which
   * is what a keyboard or screen-reader user needs said.
   */
  const pendingSectionFocus = useRef(false);
  useLayoutEffect(() => {
    if (!pendingSectionFocus.current) return;
    pendingSectionFocus.current = false;
    // ⚠️ Through `focusIfPossible`, not a bare `.focus()`: it refuses a node
    // that cannot take focus and confirms the move actually landed.
    focusIfPossible(sectionHeadingAnchor());
  }, [activeSection]);

  const reviewNext = useCallback(() => {
    if (!next) return;
    analytics.track(ANALYTICS_EVENTS.AI_REVIEW_NEXT, {
      section: isCustomSectionToken(next) ? 'custom' : next,
      remaining: total,
    });
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'editor');
    nextParams.set('section', next);
    pendingSectionFocus.current = true;
    setSearchParams(nextParams, { replace: true });
  }, [next, searchParams, setSearchParams, total]);

  const acceptAll = useCallback(() => acceptAllSuggestions('cv'), [acceptAllSuggestions]);

  /**
   * ⚠️ Not `acceptAllSuggestions`' mirror image. Accepting is a delete; discarding
   * has to *restore* the original wording, and only `declineAISuggestion` on an
   * `item:` target does that. Declining each item also prunes the `section:`/`cv`
   * container keys as it goes, so the second pass only sees containers that never
   * had items — a section-level run that changed nothing per entry.
   */
  const discardAll = useCallback(() => {
    const itemTargets = Object.keys(useResumeStore.getState().ai.suggestions).filter(isItemTarget);
    itemTargets.forEach((target) => declineAISuggestion(target));

    Object.keys(useResumeStore.getState().ai.suggestions)
      .filter(isAITargetKey)
      .forEach((target) => declineAISuggestion(target));

    declineReorg();
  }, [declineAISuggestion, declineReorg]);

  return {
    total,
    countsBySection,
    sectionKeys,
    next,
    reviewNext,
    acceptAll,
    discardAll,
  };
}
