// @vitest-environment jsdom
import { OptimizedMedia } from '@/pages/Blog/components/OptimizedMedia';
import { act, render } from '@testing-library/react';
import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

/** An observer the test fires by hand; jsdom has none and does no layout. */
const observers: Array<{
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  disconnected: boolean;
}> = [];
class ControlledObserver {
  record: (typeof observers)[number];
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.record = { callback, options, disconnected: false };
    observers.push(this.record);
  }
  observe() {}
  disconnect() {
    this.record.disconnected = true;
  }
}

const PRELOAD = '600px 0px';
const VISIBLE = '0px';

/** Fire the live observer with `rootMargin`, as if the clip crossed that edge. */
const cross = (rootMargin: string, isIntersecting: boolean) =>
  act(() => {
    const observer = observers.find((o) => o.options?.rootMargin === rootMargin && !o.disconnected);
    observer?.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });

let play: MockInstance<HTMLMediaElement['play']>;
let pause: MockInstance<HTMLMediaElement['pause']>;

beforeEach(() => {
  observers.length = 0;
  vi.stubGlobal('IntersectionObserver', ControlledObserver);
  play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

/** Renders a clip inside a stand-in for the shell's `<main>`, taller inside than out. */
const renderInScroller = (autoPlay = true) => {
  const scroller = document.createElement('div');
  scroller.style.overflowY = 'auto';
  Object.defineProperty(scroller, 'scrollHeight', { value: 2000 });
  Object.defineProperty(scroller, 'clientHeight', { value: 800 });
  document.body.append(scroller);
  render(<OptimizedMedia src="/clip.mp4" alt="Clip" autoPlay={autoPlay} />, {
    container: scroller,
  });
  return { scroller, video: scroller.querySelector('video')! };
};

describe('OptimizedMedia', () => {
  it('roots both observers on the scrolling ancestor: preload ahead, playback on sight', () => {
    const { scroller } = renderInScroller();
    expect(observers.map((o) => [o.options?.root, o.options?.rootMargin])).toEqual([
      [scroller, PRELOAD],
      [scroller, VISIBLE],
    ]);
  });

  it('starts buffering on approach without playing off-screen', () => {
    const { video } = renderInScroller();
    expect(video.getAttribute('preload')).toBe('metadata');
    pause.mockClear();

    cross(PRELOAD, true);
    expect(video.getAttribute('preload')).toBe('auto');
    expect(play).not.toHaveBeenCalled();
  });

  it('plays when visible, pauses when scrolled past, and resumes on return', () => {
    renderInScroller();
    cross(PRELOAD, true);

    cross(VISIBLE, true);
    expect(play).toHaveBeenCalledTimes(1);

    pause.mockClear();
    cross(VISIBLE, false);
    expect(pause).toHaveBeenCalledTimes(1);

    cross(VISIBLE, true);
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('never plays when autoPlay is off', () => {
    renderInScroller(false);
    cross(PRELOAD, true);
    cross(VISIBLE, true);
    expect(play).not.toHaveBeenCalled();
  });
});
