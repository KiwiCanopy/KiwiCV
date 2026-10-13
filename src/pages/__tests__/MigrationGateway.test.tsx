// @vitest-environment jsdom
import { BRAND_CONFIG } from '@/config/brand';
import { MigrationGateway } from '@/pages/MigrationGateway';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    // Echoes the key, and appends any interpolation vars. The real `t`
    // substitutes them into the translated *value*, which a key-echoing mock
    // does not have — so without this a variable that never reaches the render
    // looks exactly like one that does.
    t: (key: string, vars?: Record<string, string | number>) =>
      vars ? `${key} ${Object.values(vars).join(' ')}` : key,
    formatUIDate: (iso?: string) => `formatted(${iso})`,
    uiLanguage: 'en',
  }),
}));

const track = vi.fn();
vi.mock('@/services/analytics', () => ({
  analytics: { track: (...args: unknown[]) => track(...args) },
  ANALYTICS_EVENTS: {
    MIGRATION_DOWNLOAD_CLICKED: 'migration_download',
    MIGRATION_LINK_CLICKED: 'migration_link',
  },
}));

vi.mock('@/store/ui/useUIStore', () => ({
  useUIStore: (selector: (state: { appTheme: string }) => unknown) =>
    selector({ appTheme: 'light' }),
}));

/** Captures what the anchor would have downloaded, without downloading it. */
let downloaded: string[] = [];

beforeEach(() => {
  downloaded = [];
  track.mockClear();
  localStorage.clear();

  // Blob.text() is async and the component revokes the URL immediately, so the
  // payload is captured from the constructor arguments below instead.
  URL.createObjectURL = vi.fn(() => 'blob:stub') as unknown as typeof URL.createObjectURL;
  URL.revokeObjectURL = vi.fn();

  const realBlob = globalThis.Blob;
  vi.stubGlobal(
    'Blob',
    class extends realBlob {
      constructor(parts: string[], options?: BlobPropertyBag) {
        super(parts, options);
        downloaded.push(parts.join(''));
      }
    },
  );

  // jsdom navigates on a real anchor click; the component only needs it to be a no-op.
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const withResume = () =>
  localStorage.setItem(
    'resume-storage',
    JSON.stringify({ state: { resume: { basics: { name: 'Ada' } } } }),
  );

describe('MigrationGateway', () => {
  it('offers only the continue action when there is nothing stored', () => {
    render(<MigrationGateway />);

    expect(screen.getByRole('button', { name: /migration\.link/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /migration\.button/ })).toBeNull();
  });

  it('acknowledges the download and promotes continuing, keeping the download reachable', async () => {
    const user = userEvent.setup();
    withResume();
    render(<MigrationGateway />);

    // Before: no acknowledgement.
    expect(screen.queryByText('common.success')).toBeNull();

    await user.click(screen.getByRole('button', { name: /migration\.button/ }));

    // After: acknowledged, in a polite live region, and both actions still present.
    const ack = screen.getByText('common.success');
    expect(ack.closest('[aria-live="polite"]')).toBeTruthy();
    expect(screen.getByRole('button', { name: /migration\.link/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /migration\.button/ })).toBeTruthy();
    expect(track).toHaveBeenCalledWith('migration_download');
  });

  // The gateway is the last screen on the old domain; a backup written here is
  // a file the user is told to upload to the new one.
  it('never writes provider credentials into the backup', async () => {
    const user = userEvent.setup();
    localStorage.setItem('github_pat', 'ghp_thisisasecret');
    localStorage.setItem('resume-storage', '{ truncated');
    render(<MigrationGateway />);

    await user.click(screen.getByRole('button', { name: /migration\.button/ }));

    expect(downloaded).toHaveLength(1);
    expect(downloaded[0]).not.toContain('ghp_thisisasecret');
    expect(downloaded[0]).not.toContain('github_pat');
  });

  it('states the retirement date in both the data and no-data variants', () => {
    // No stored data.
    const { unmount } = render(<MigrationGateway />);
    expect(
      screen.getByText(new RegExp(`formatted\\(${BRAND_CONFIG.legacyGatewayRetirementDate}\\)`)),
    ).toBeTruthy();
    unmount();

    // The notice requires the exact date, and a visitor with nothing stored still
    // needs to know the address dies — so it cannot be gated on `hasData`.
    localStorage.setItem('kiwicv-resume', JSON.stringify({ basics: { name: 'A' } }));
    render(<MigrationGateway />);
    expect(
      screen.getByText(new RegExp(`formatted\\(${BRAND_CONFIG.legacyGatewayRetirementDate}\\)`)),
    ).toBeTruthy();
  });

  it('gives the gateway a real document title', async () => {
    render(<MigrationGateway />);
    // Helmet writes on a microtask.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.title).toBe('migration.title');
    expect(document.title).not.toBe('');
  });
});
