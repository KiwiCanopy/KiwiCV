// @vitest-environment jsdom
import { ResumeLanguageSelector } from '@/components/editor/ResumeLanguageSelector';
import { locales } from '@/locales';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/analytics', () => ({
  ANALYTICS_EVENTS: { RESUME_LANGUAGE_CHANGED: 'resume_language_changed' },
  analytics: { track: vi.fn() },
}));

const checkAndRestoreLocale = vi.fn();
const inviteToTranslate = vi.fn(async () => {});

vi.mock('@/hooks/useCloudRestorePrompt', () => ({
  useCloudRestorePrompt: () => ({ checkAndRestoreLocale }),
}));

vi.mock('@/hooks/useTranslationInvite', () => ({
  useTranslationInvite: () => ({ inviteToTranslate, modals: null }),
}));

/** A promise the test resolves by hand, so the check's duration is the variable. */
function deferred<T>() {
  let settle!: (value: T) => void;
  const promise = new Promise<T>((resolve) => {
    settle = resolve;
  });
  return { promise, settle };
}

const NOTHING_FOUND = { imported: false, warnings: [] };

/**
 * The switch is direct manipulation, so the locale changes at once and the
 * cloud discovery that follows is what the user waits on. These pin the wait's
 * presentation: it gets the blocking confirm dialog only once it is long enough
 * to notice, it never displaces a prompt discovery itself raised, and it never
 * closes a dialog it did not open.
 */
describe('resume language switch, while the cloud check runs', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    checkAndRestoreLocale.mockReset();
    inviteToTranslate.mockClear();
    useConfirmStore.setState({ isOpen: false, resolve: null });
    useUIStore.setState({ appLanguage: 'en' });
    useResumeStore.getState().updateMeta({
      theme: { ...useResumeStore.getState().resume.meta.theme, locale: 'en' },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // `compact` is what the dashboard header renders; the handler is shared with
  // the other variants.
  const switchToGerman = () => {
    render(<ResumeLanguageSelector variant="compact" />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'de' } });
  };

  it('changes the language immediately, before the check has answered', () => {
    checkAndRestoreLocale.mockReturnValue(deferred<typeof NOTHING_FOUND>().promise);

    switchToGerman();

    expect(useResumeStore.getState().resume.meta.theme?.locale).toBe('de');
  });

  it('shows no dialog when the check answers inside the grace period', async () => {
    // Two things make this non-vacuous. The check has to consume real time
    // rather than a microtask, or it clears the timer before that timer could
    // ever fire; and the assertion has to land while the check is still
    // running, or the dismissal at the end hides a dialog that did appear.
    const answered = deferred<typeof NOTHING_FOUND>();
    checkAndRestoreLocale.mockReturnValue(answered.promise);

    switchToGerman();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(399);
    });

    expect(useConfirmStore.getState().isOpen).toBe(false);

    await act(async () => {
      answered.settle(NOTHING_FOUND);
      await answered.promise;
    });
  });

  it('holds the screen with a loading dialog once the check outruns it', async () => {
    const pending = deferred<typeof NOTHING_FOUND>();
    checkAndRestoreLocale.mockReturnValue(pending.promise);

    switchToGerman();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    const { isOpen, options } = useConfirmStore.getState();
    expect(isOpen).toBe(true);
    expect(options.isLoading).toBe(true);
    // Blocking: no way to answer or dismiss it while the check runs.
    expect(options.confirmText).toBe('');
    expect(options.showCloseButton).toBe(false);
  });

  it('writes the dialog in the app language, not the CV language', async () => {
    // The dialog is product chrome, so it follows the interface language even
    // though the thing being switched is the document's. Reading it off the CV
    // translator would put the dialog into the language the user just picked.
    useUIStore.setState({ appLanguage: 'de' });
    const pending = deferred<typeof NOTHING_FOUND>();
    checkAndRestoreLocale.mockReturnValue(pending.promise);

    switchToGerman();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(useConfirmStore.getState().options.title).toBe(locales.de.sync.checking);
    expect(useConfirmStore.getState().options.title).not.toBe(locales.en.sync.checking);
  });

  it('leaves a prompt the discovery raised first alone', async () => {
    // Discovery found a backup in 100ms and is asking about it. The grace timer
    // still fires at 400ms and must not overwrite the question with a spinner.
    const answered = deferred<typeof NOTHING_FOUND>();
    checkAndRestoreLocale.mockImplementation(async () => {
      useConfirmStore.getState().confirm({ title: 'Backup Found!', message: 'Restore it?' });
      return answered.promise;
    });

    switchToGerman();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(useConfirmStore.getState().options.title).toBe('Backup Found!');
    expect(useConfirmStore.getState().options.isLoading).toBe(false);
  });

  it('closes its own dialog once the check answers', async () => {
    const pending = deferred<typeof NOTHING_FOUND>();
    checkAndRestoreLocale.mockReturnValue(pending.promise);

    switchToGerman();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(useConfirmStore.getState().isOpen).toBe(true);

    await act(async () => {
      pending.settle(NOTHING_FOUND);
      await pending.promise;
    });

    expect(useConfirmStore.getState().isOpen).toBe(false);
  });

  it('leaves the restore result dialog standing', async () => {
    // A restore ends on its own success dialog. Closing that as if it were the
    // spinner would swallow the only confirmation the user gets.
    const pending = deferred<{ imported: boolean; warnings: [] }>();
    checkAndRestoreLocale.mockReturnValue(pending.promise);

    switchToGerman();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    await act(async () => {
      useConfirmStore.setState({
        isOpen: true,
        resolve: null,
        options: { title: 'Success', message: 'Restored.', isLoading: false },
      });
      pending.settle({ imported: true, warnings: [] });
      await pending.promise;
    });

    expect(useConfirmStore.getState().isOpen).toBe(true);
    expect(useConfirmStore.getState().options.title).toBe('Success');
  });
});
