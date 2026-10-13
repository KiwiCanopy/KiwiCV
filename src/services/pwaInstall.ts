/** Chromium's install event; not in lib.dom. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * `available` — the browser handed us its install prompt.
 * `installed` — running as the installed app, or installed this session.
 * `ios` — iOS has no install API; the user adds KiwiCV from the Share sheet.
 * `unsupported` — no prompt (Firefox, desktop Safari, or Chrome after a recent dismissal).
 */
export type PwaInstallStatus = 'available' | 'installed' | 'ios' | 'unsupported';

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installedThisSession = false;
let initialised = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

// iPadOS reports itself as a Mac, so a touch-capable "Mac" counts as iOS.
const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/**
 * Starts listening for the install prompt. Called from `main.tsx` before the app
 * chunk loads: Chromium can fire `beforeinstallprompt` before that finishes.
 * Keep this module free of React so it stays in the entry chunk.
 */
export function initPwaInstall() {
  if (initialised || typeof window === 'undefined') return;
  initialised = true;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installedThisSession = true;
    emit();
  });
}

export function getPwaInstallStatus(): PwaInstallStatus {
  if (installedThisSession || isStandalone()) return 'installed';
  if (deferredPrompt) return 'available';
  if (isIos()) return 'ios';
  return 'unsupported';
}

/** Opens the browser's install dialog. A prompt can be shown once, so it is spent either way. */
export async function promptPwaInstall() {
  const prompt = deferredPrompt;
  if (!prompt) return;
  deferredPrompt = null;
  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  // `appinstalled` can trail acceptance; do not show "unsupported" in between.
  if (outcome === 'accepted') installedThisSession = true;
  emit();
}

export function subscribePwaInstall(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
