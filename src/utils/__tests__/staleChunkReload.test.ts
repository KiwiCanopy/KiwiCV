// @vitest-environment jsdom
import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { installStaleChunkReload } from '@/utils/staleChunkReload';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const firePreloadError = () => {
  const event = new Event('vite:preloadError', { cancelable: true });
  window.dispatchEvent(event);
  return event;
};

describe('installStaleChunkReload', () => {
  const reload = vi.fn();
  let controller: AbortController;

  beforeEach(() => {
    // A fresh listener per test stands in for a fresh page load.
    controller = new AbortController();
    const add = window.addEventListener.bind(window);
    vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) =>
      add(type, listener, {
        ...(typeof options === 'object' ? options : {}),
        signal: controller.signal,
      }),
    );
    installStaleChunkReload(reload);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    controller.abort();
    reload.mockClear();
    sessionStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('reloads once and swallows the error', () => {
    const event = firePreloadError();
    expect(reload).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
    expect(sessionStorage.getItem(BRAND_STORAGE_KEYS.chunkReloadAt)).not.toBeNull();
  });

  it('swallows further failures on the page that is already reloading', () => {
    firePreloadError();
    const second = firePreloadError();
    expect(reload).toHaveBeenCalledOnce();
    expect(second.defaultPrevented).toBe(true);
  });

  it('lets a failure right after a reload surface', () => {
    sessionStorage.setItem(BRAND_STORAGE_KEYS.chunkReloadAt, String(Date.now()));
    const event = firePreloadError();
    expect(reload).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('recovers again once the window has passed', () => {
    sessionStorage.setItem(BRAND_STORAGE_KEYS.chunkReloadAt, String(Date.now() - 10_001));
    firePreloadError();
    expect(reload).toHaveBeenCalledOnce();
  });

  it('does not reload while offline', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const event = firePreloadError();
    expect(reload).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
