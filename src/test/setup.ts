import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom implements no matchMedia, so every useMediaQuery consumer — InfoBox and
// everything that renders one — throws on mount without this.
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// jsdom implements no ResizeObserver either, and jsdom does no layout, so the
// honest stub is one that observes nothing. Every consumer keeps its initial
// state; a test that needs real numbers stubs a controllable one of its own
// (see `layout/__tests__/editorLayoutMeasurement.test.tsx`).
// ⚠️ On `globalThis`, not only on `window`: consumers reference the bare
// `ResizeObserver` binding, and vitest's jsdom environment keeps `window` as a
// separate object from the global one.
if (typeof window !== 'undefined' && !('ResizeObserver' in globalThis)) {
  const NoopResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: NoopResizeObserver,
  });
  Object.defineProperty(window, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: NoopResizeObserver,
  });
}

if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: () => null,
  });
}

afterEach(() => {
  cleanup();
});
