// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const load = async () => {
  vi.resetModules();
  const mod = await import('@/services/pwaInstall');
  mod.initPwaInstall();
  return mod;
};

const fireInstallPrompt = (outcome: 'accepted' | 'dismissed' = 'dismissed') => {
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt: vi.fn(async () => {}),
    userChoice: Promise.resolve({ outcome }),
  });
  window.dispatchEvent(event);
  return event;
};

describe('pwaInstall', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (X11; Linux x86_64)');
  });

  it('is unsupported until the browser offers a prompt', async () => {
    const { getPwaInstallStatus } = await load();
    expect(getPwaInstallStatus()).toBe('unsupported');
  });

  it('offers the captured prompt once, then spends it', async () => {
    const { getPwaInstallStatus, promptPwaInstall } = await load();
    const event = fireInstallPrompt();

    expect(event.defaultPrevented).toBe(true);
    expect(getPwaInstallStatus()).toBe('available');

    await promptPwaInstall();
    expect(event.prompt).toHaveBeenCalledOnce();
    expect(getPwaInstallStatus()).toBe('unsupported');
  });

  it('reads installed as soon as the prompt is accepted', async () => {
    const { getPwaInstallStatus, promptPwaInstall } = await load();
    fireInstallPrompt('accepted');
    await promptPwaInstall();
    expect(getPwaInstallStatus()).toBe('installed');
  });

  it('reads installed when running standalone', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) => ({ matches: query === '(display-mode: standalone)' }) as MediaQueryList,
    );
    const { getPwaInstallStatus } = await load();
    expect(getPwaInstallStatus()).toBe('installed');
  });

  it('treats a touch-capable Mac as iPadOS', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    );
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
    // jsdom has no maxTouchPoints to spy on.
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 5, configurable: true });
    try {
      const { getPwaInstallStatus } = await load();
      expect(getPwaInstallStatus()).toBe('ios');
    } finally {
      delete (navigator as { maxTouchPoints?: number }).maxTouchPoints;
    }
  });

  it('reads installed after appinstalled', async () => {
    const { getPwaInstallStatus } = await load();
    fireInstallPrompt();
    window.dispatchEvent(new Event('appinstalled'));
    expect(getPwaInstallStatus()).toBe('installed');
  });

  it('points iOS to the Share sheet', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
    );
    const { getPwaInstallStatus } = await load();
    expect(getPwaInstallStatus()).toBe('ios');
  });
});
