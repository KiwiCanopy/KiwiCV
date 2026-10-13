// @vitest-environment jsdom
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { useLandingActions } from '@/pages/LandingPage/useLandingActions';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/analytics', () => ({
  ANALYTICS_EVENTS: { PAGE_VIEWED: 'page_viewed', CV_STARTED_BLANK: 'cv_started_blank' },
  analytics: { track: vi.fn() },
}));

const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

describe('useLandingActions', () => {
  let initialState: ReturnType<typeof useResumeStore.getState>;

  beforeEach(() => {
    initialState = useResumeStore.getState();
    vi.mocked(analytics.track).mockClear();
  });

  afterEach(() => {
    useResumeStore.setState(initialState, true);
  });

  const blankStarts = () =>
    vi
      .mocked(analytics.track)
      .mock.calls.filter(([event]) => event === ANALYTICS_EVENTS.CV_STARTED_BLANK).length;

  it('treats an empty CV as a blank start', () => {
    const { result } = renderHook(() => useLandingActions(), { wrapper });

    expect(result.current.hasCv).toBe(false);
    act(() => result.current.goToEditor('hero'));
    expect(blankStarts()).toBe(1);
  });

  // The button label (hasCv) and the blank-start event must agree.
  it('treats a CV with a name as one to continue', () => {
    useResumeStore.setState({
      resume: { ...initialState.resume, basics: { ...initialState.resume.basics, name: 'Ada' } },
    });
    const { result } = renderHook(() => useLandingActions(), { wrapper });

    expect(result.current.hasCv).toBe(true);
    act(() => result.current.goToEditor('closing_cta'));
    expect(blankStarts()).toBe(0);
  });
});
