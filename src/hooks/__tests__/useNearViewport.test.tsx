// @vitest-environment jsdom
import { useRef } from 'react';

import { scrollParent, useNearViewport } from '@/hooks/useNearViewport';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** An observer the test fires by hand; jsdom has none and does no layout. */
const observers: Array<{
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  targets: Element[];
  disconnected: boolean;
}> = [];
class ControlledObserver {
  record: (typeof observers)[number];
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.record = { callback, options, targets: [], disconnected: false };
    observers.push(this.record);
  }
  observe(target: Element) {
    this.record.targets.push(target);
  }
  disconnect() {
    this.record.disconnected = true;
  }
}

const fire = (isIntersecting: boolean) =>
  act(() => {
    for (const { callback, disconnected } of observers) {
      if (!disconnected) {
        callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
      }
    }
  });

/** jsdom does no layout: a box whose content is `scroll` tall inside `client`. */
const box = (overflowY: string, scroll = 2000, client = 800) => {
  const el = document.createElement('div');
  el.style.overflowY = overflowY;
  Object.defineProperty(el, 'scrollHeight', { value: scroll });
  Object.defineProperty(el, 'clientHeight', { value: client });
  return el;
};

function Probe({ margin, once, id }: { margin?: string; once?: boolean; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref, { margin, once });
  return (
    <div key={id} ref={ref}>
      {near ? 'near' : 'far'}
    </div>
  );
}

beforeEach(() => {
  observers.length = 0;
  vi.stubGlobal('IntersectionObserver', ControlledObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe('scrollParent', () => {
  it('returns the nearest ancestor that scrolls and overflows', () => {
    const outer = box('auto');
    const inner = box('scroll');
    const child = document.createElement('div');
    outer.append(inner);
    inner.append(child);
    document.body.append(outer);
    expect(scrollParent(child)).toBe(inner);
  });

  it('skips a scrollable ancestor whose content fits, and a non-scrolling one', () => {
    const outer = box('auto');
    const fits = box('auto', 500, 500);
    const hidden = box('hidden');
    const child = document.createElement('div');
    outer.append(fits);
    fits.append(hidden);
    hidden.append(child);
    document.body.append(outer);
    expect(scrollParent(child)).toBe(outer);
  });

  it('returns null when nothing scrolls, leaving the viewport as root', () => {
    const child = document.createElement('div');
    document.body.append(child);
    expect(scrollParent(child)).toBeNull();
  });
});

describe('useNearViewport', () => {
  it('roots the observer on the scrolling ancestor with the given margin', () => {
    const scroller = box('auto');
    document.body.append(scroller);
    render(<Probe margin="600px 0px" />, { container: scroller });

    const [observer] = observers;
    expect(observer?.options?.root).toBe(scroller);
    expect(observer?.options?.rootMargin).toBe('600px 0px');
    expect(observer?.targets).toEqual([scroller.firstElementChild]);
  });

  it('defaults to a zero margin', () => {
    render(<Probe />);
    expect(observers[0]?.options?.rootMargin).toBe('0px');
  });

  it('follows the target in and out of range', () => {
    render(<Probe />);
    expect(screen.getByText('far')).toBeTruthy();
    fire(true);
    expect(screen.getByText('near')).toBeTruthy();
    fire(false);
    expect(screen.getByText('far')).toBeTruthy();
  });

  it('with `once`, latches on the first approach and stops observing', () => {
    render(<Probe once />);
    fire(false);
    expect(screen.getByText('far')).toBeTruthy();
    fire(true);
    expect(screen.getByText('near')).toBeTruthy();
    expect(observers[0]?.disconnected).toBe(true);
    fire(false);
    expect(screen.getByText('near')).toBeTruthy();
  });

  it('stays false without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<Probe />);
    expect(screen.getByText('far')).toBeTruthy();
  });

  it('disconnects on unmount', () => {
    const { unmount } = render(<Probe />);
    unmount();
    expect(observers[0]?.disconnected).toBe(true);
  });

  it('re-observes when the ref moves to a new node, and resets for it', () => {
    const scroller = box('auto');
    document.body.append(scroller);
    const { rerender } = render(<Probe once margin="600px 0px" id="a" />, { container: scroller });
    fire(true);
    expect(screen.getByText('near')).toBeTruthy();

    rerender(<Probe once margin="600px 0px" id="b" />);
    expect(screen.getByText('far')).toBeTruthy();
    const live = observers.filter((o) => !o.disconnected);
    expect(live).toHaveLength(1);
    expect(live[0]?.options?.root).toBe(scroller);
    expect(live[0]?.options?.rootMargin).toBe('600px 0px');
    expect(live[0]?.targets).toEqual([scroller.firstElementChild]);

    fire(true);
    expect(screen.getByText('near')).toBeTruthy();
  });
});
