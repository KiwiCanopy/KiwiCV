import { useCallback, useEffect, useRef, useState } from 'react';

import { COVER_LETTER_STYLE_MAX } from '@/constants/ai';
import {
  EXTERNAL_CLEAR,
  readCoverLetterStyle,
  subscribeCoverLetterStyle,
  writeCoverLetterStyle,
} from '@/services/storage/coverLetterStyleStorage';

/** One write per paste-and-pause; the flushes cover the tail. */
const WRITE_DELAY_MS = 500;

/**
 * Device-local memory of the voice the user writes in.
 *
 * ⚠️ Writes are debounced, and flushed on unmount AND on `pagehide`. All three
 * are load-bearing: per keystroke this rewrites up to 5,000 characters, React
 * runs no cleanup when iOS discards a backgrounded tab, and no blur fires when
 * the modal closes on Escape.
 */
export function useCoverLetterStyle() {
  const [sample, setSampleState] = useState<string>(readCoverLetterStyle);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<string | null>(null);
  // Identity of this mount, so it ignores the echo of its own write. `useState`
  // rather than a ref: the value is read while rendering the callbacks below,
  // which `react-hooks/refs` rightly refuses for a ref.
  const [self] = useState(() => Symbol('coverLetterStyle'));

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (pending.current !== null) {
      writeCoverLetterStyle(pending.current, self);
      pending.current = null;
    }
  }, [self]);

  useEffect(() => {
    // `pagehide` rather than `beforeunload`: the latter does not fire on iOS,
    // which is the platform that discards the tab without unmounting anything.
    const onHide = () => flush();
    window.addEventListener('pagehide', onHide);

    // ⚠️ Re-read from storage rather than take the written value: a mount that
    // is only *displaying* the sample must show what a reload would show, and a
    // write that storage refused did not change that.
    const onWrite = (origin: symbol) => {
      if (origin === self) return;
      if (origin === EXTERNAL_CLEAR) {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        pending.current = null;
      }
      setSampleState(readCoverLetterStyle());
    };
    const unsubscribe = subscribeCoverLetterStyle(onWrite);

    return () => {
      window.removeEventListener('pagehide', onHide);
      unsubscribe();
      flush();
    };
  }, [flush, self]);

  const setSample = useCallback(
    (value: string) => {
      const next = value.slice(0, COVER_LETTER_STYLE_MAX);
      setSampleState(next);
      pending.current = next;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        if (pending.current !== null) {
          writeCoverLetterStyle(pending.current, self);
          pending.current = null;
        }
      }, WRITE_DELAY_MS);
    },
    [self],
  );

  /** Immediate, never debounced: a clear the user cannot see land is not a clear. */
  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    pending.current = null;
    setSampleState('');
    writeCoverLetterStyle('', self);
  }, [self]);

  return { sample, setSample, clear };
}
