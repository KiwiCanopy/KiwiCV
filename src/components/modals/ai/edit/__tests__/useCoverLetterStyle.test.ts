// @vitest-environment jsdom
/**
 * The writing sample has to survive a reload, because the field IS the
 * preference: a value that quietly does not persist looks identical to
 * one that does until the user comes back a week later.
 */
import { useCoverLetterStyle } from '@/components/modals/ai/edit/useCoverLetterStyle';
import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { COVER_LETTER_STYLE_MAX } from '@/constants/ai';
import {
  clearStoredCoverLetterStyle,
  readCoverLetterStyle,
} from '@/services/storage/coverLetterStyleStorage';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const KEY = BRAND_STORAGE_KEYS.coverLetterStyle;

describe('useCoverLetterStyle', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    localStorage.clear();
  });

  it('a sample survives a reload', () => {
    const first = renderHook(() => useCoverLetterStyle());
    act(() => first.result.current.setSample('I write in short, direct sentences.'));
    act(() => void vi.advanceTimersByTime(1000));

    // A second hook instance reads from storage exactly as a fresh page load does.
    const second = renderHook(() => useCoverLetterStyle());
    expect(second.result.current.sample).toBe('I write in short, direct sentences.');
  });

  /**
   * ⚠️ The half that would make the test vacuous if it were missing: a hook that
   * only ever returned its own in-memory state would pass "survives a reload"
   * above, since `renderHook` twice in one process shares no state but the
   * assertion could be satisfied by a module-level variable.
   */
  it('writes through to its own storage key, not to memory', () => {
    const { result } = renderHook(() => useCoverLetterStyle());
    act(() => result.current.setSample('Warm and plain.'));
    act(() => void vi.advanceTimersByTime(1000));

    expect(JSON.parse(localStorage.getItem(KEY) as string)).toEqual({
      v: 1,
      sample: 'Warm and plain.',
    });
  });

  it('clearing sticks, and takes the stored entry with it', () => {
    const { result } = renderHook(() => useCoverLetterStyle());
    act(() => result.current.setSample('Something to forget.'));
    act(() => void vi.advanceTimersByTime(1000));

    act(() => result.current.clear());

    expect(result.current.sample).toBe('');
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(renderHook(() => useCoverLetterStyle()).result.current.sample).toBe('');
  });

  /**
   * ⚠️ Per keystroke this rewrites up to 5,000 characters on every letter typed
   * — the cost that ruled `useUIStore`'s `partialize` out for this value.
   */
  it('does not write on every keystroke', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => useCoverLetterStyle());

    act(() => result.current.setSample('I'));
    act(() => result.current.setSample('I w'));
    act(() => result.current.setSample('I write'));
    expect(setItem).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1000));
    expect(setItem).toHaveBeenCalledTimes(1);
    setItem.mockRestore();
  });

  /**
   * ⚠️ The edit a debounce alone loses. Closing the modal with Escape unmounts
   * the field, so no blur ever fires and the last keystrokes are still pending.
   */
  it('flushes a pending write when the field unmounts', () => {
    const { result, unmount } = renderHook(() => useCoverLetterStyle());
    act(() => result.current.setSample('Typed, then Escape.'));

    unmount();

    expect(readCoverLetterStyle()).toBe('Typed, then Escape.');
  });

  /**
   * ⚠️ `clear` must cancel the pending write, not merely outrun it. Without the
   * cancellation the debounce fires afterwards and restores the sample the user
   * just deleted — and the field, already re-rendered as empty, never shows it.
   */
  it('clearing cancels a write that has not landed yet', () => {
    const { result } = renderHook(() => useCoverLetterStyle());

    act(() => result.current.setSample('Typed, then immediately cleared.'));
    act(() => result.current.clear());
    act(() => void vi.advanceTimersByTime(1000));

    expect(localStorage.getItem(KEY)).toBeNull();
    expect(readCoverLetterStyle()).toBe('');
  });

  /** A full or blocked storage (Safari private mode) must not take the modal down. */
  it('survives a storage that refuses to write', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    const { result } = renderHook(() => useCoverLetterStyle());

    act(() => result.current.setSample('Never lands.'));
    expect(() => act(() => void vi.advanceTimersByTime(1000))).not.toThrow();
    expect(result.current.sample).toBe('Never lands.');

    setItem.mockRestore();
  });

  /**
   * ⚠️ React runs no cleanup when iOS discards a backgrounded tab, so the
   * unmount flush alone loses a sample pasted and then switched away from.
   */
  it('flushes a pending write when the page is hidden', () => {
    const { result } = renderHook(() => useCoverLetterStyle());
    act(() => result.current.setSample('Pasted, then switched apps.'));

    act(() => void window.dispatchEvent(new Event('pagehide')));

    expect(readCoverLetterStyle()).toBe('Pasted, then switched apps.');
  });

  /**
   * ⚠️ The app mounts this hook TWICE — the AI modal owns the field, the composer
   * band shows a one-line summary of it. Without the notification the band goes
   * on describing the sample the user just replaced in the modal, and the only
   * way to see the new one is a reload.
   */
  it('a write in one mount reaches the other', () => {
    const modal = renderHook(() => useCoverLetterStyle());
    const band = renderHook(() => useCoverLetterStyle());

    act(() => modal.result.current.setSample('Plain, and to the point.'));
    // Nothing has been written yet, so the other mount cannot know.
    expect(band.result.current.sample).toBe('');

    act(() => void vi.advanceTimersByTime(1000));
    expect(band.result.current.sample).toBe('Plain, and to the point.');

    act(() => modal.result.current.clear());
    expect(band.result.current.sample).toBe('');
  });

  /**
   * ⚠️ Asserted through the READ the listener performs, not through a warning.
   * React 19 no longer complains about `setState` on an unmounted component, so
   * "does not throw" is green whether or not the listener was ever removed —
   * the vacuous shape `.claude/rules/testing.md` names.
   *
   * ⚠️ **Both halves, and the first one is the point.** Counting storage reads
   * only means something if a LIVE listener moves the counter — without the
   * positive control, replacing the re-read with a module-level cache (the one
   * thing `writeCoverLetterStyle`'s docblock forbids) leaves this file green
   * and permanently vacuous, because zero reads is then always true.
   */
  it('notifies a live mount and stops at an unmounted one', () => {
    const modal = renderHook(() => useCoverLetterStyle());
    const band = renderHook(() => useCoverLetterStyle());
    const getItem = vi.spyOn(Storage.prototype, 'getItem');

    act(() => modal.result.current.setSample('While the band is alive.'));
    act(() => void vi.advanceTimersByTime(1000));
    // The metric is sensitive: a live listener re-reads storage.
    expect(getItem).toHaveBeenCalled();

    band.unmount();
    getItem.mockClear();

    act(() => modal.result.current.setSample('After the band unmounted.'));
    act(() => void vi.advanceTimersByTime(1000));
    // …and it moved to zero. The writer skips its own echo, so nothing reads.
    expect(getItem).not.toHaveBeenCalled();

    getItem.mockRestore();
  });

  it('clamps a hand-edited entry to the cap, and survives a corrupt one', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ v: 1, sample: 'x'.repeat(COVER_LETTER_STYLE_MAX + 500) }),
    );
    expect(readCoverLetterStyle()).toHaveLength(COVER_LETTER_STYLE_MAX);

    localStorage.setItem(KEY, 'not json at all');
    expect(readCoverLetterStyle()).toBe('');

    localStorage.setItem(KEY, JSON.stringify({ v: 99, sample: 'from a newer shape' }));
    expect(readCoverLetterStyle()).toBe('');
  });

  /**
   * ⚠️ Sign-out clears from outside React. A mount with an edit still
   * debounced must drop it, or the write lands afterwards and restores the
   * sample sign-out just removed.
   */
  it('an external clear empties every mount and cancels its pending write', () => {
    const { result } = renderHook(() => useCoverLetterStyle());
    act(() => result.current.setSample('Saved before sign-out.'));
    act(() => void vi.advanceTimersByTime(1000));
    act(() => result.current.setSample('Typed just before sign-out.'));

    act(() => clearStoredCoverLetterStyle());
    act(() => void vi.advanceTimersByTime(1000));

    expect(result.current.sample).toBe('');
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
