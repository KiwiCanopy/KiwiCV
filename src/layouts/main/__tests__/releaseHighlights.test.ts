// @vitest-environment jsdom
import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { APP_VERSION } from '@/data/changelog';
import { useReleaseHighlights } from '@/layouts/main/useReleaseHighlights';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/store/ui/useUIStore', () => ({
  useUIStore: (selector: (s: { firstTimeLanguageSelected: boolean }) => unknown) =>
    selector({ firstTimeLanguageSelected: true }),
}));

const KEY = BRAND_STORAGE_KEYS.lastSeenVersion;

beforeEach(() => localStorage.clear());

/**
 * ⚠️ This pins a dead state, not a happy path.
 *
 * `lastSeenVersion` used to be written only by `closeUpdateModal`, which runs
 * only after the modal has opened. A visitor with neither that key nor the
 * legacy `has_visited_intro` got no modal, was never stamped, and so got no
 * modal on the next release either — permanently opted out of "What's New",
 * with no route back. A fresh browser or a cleared profile was enough to land
 * there, which is also why it went unnoticed: anyone whose storage had been
 * stamped years earlier could never reproduce it.
 */
describe('the What’s New stamp', () => {
  it('stamps a first-time visitor so the NEXT release reaches them', () => {
    expect(localStorage.getItem(KEY)).toBeNull();

    renderHook(() => useReleaseHighlights());

    expect(localStorage.getItem(KEY)).toBe(APP_VERSION);
  });

  it('shows a first-time visitor nothing right now', () => {
    const { result } = renderHook(() => useReleaseHighlights());

    // The stamp must not double as an excuse to open the modal: someone who has
    // never used KiwiCV missed nothing worth announcing.
    expect(result.current.isUpdateModalOpen).toBe(false);
    expect(result.current.missedVersions).toEqual([]);
  });

  it('leaves an existing stamp alone', () => {
    localStorage.setItem(KEY, '1.0.0');

    renderHook(() => useReleaseHighlights());

    expect(localStorage.getItem(KEY)).toBe('1.0.0');
  });

  /**
   * The legacy path resolves `effectiveLastSeen` from `has_visited_intro` and is
   * *supposed* to open the modal. Stamping there would suppress the very modal
   * that branch exists to show.
   */
  it('does not stamp a legacy visitor, whose modal is meant to open', () => {
    localStorage.setItem('has_visited_intro', 'true');

    renderHook(() => useReleaseHighlights());

    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
