// @vitest-environment jsdom
import { CV_LIBRARY_LIST_ID } from '@/constants/focusAnchors';
import type { CvVersion } from '@/features/cv-library/types';
import { useCvLibrary } from '@/features/cv-library/useCvLibrary';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The call site, which `versionDeleteFocus.test.tsx` cannot reach: that one
 * mirrors `handleDelete` in its own harness, so dropping the anchor anywhere in
 * `remove` → `handleDelete` → `confirm` would leave it green.
 */
vi.mock('@/hooks/sync/useSyncAuthGateway', () => ({
  useSyncAuthGateway: () => ({ isCloudActive: false }),
}));

vi.mock('@/hooks/cloud/useCloudDiscovery', () => ({
  useCloudDiscovery: () => ({ discoverBackups: vi.fn(), hydrateGitHubPostingUrls: vi.fn() }),
}));

vi.mock('@/hooks/cloud/useCloudRestoreAction', () => ({
  useCloudRestoreAction: () => ({ performRestore: vi.fn() }),
}));

const version: CvVersion = {
  key: 'en:github:Beta.json',
  locale: 'en',
  source: 'github',
  isMaster: false,
  file: { name: 'Beta.json', label: 'Beta', updatedAt: '2026-03-04T10:00:00Z', theme: 'lunar' },
};

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('useCvLibrary.remove', () => {
  it('hands the confirm dialog the anchor for the row that takes this one place', async () => {
    document.body.innerHTML = `
      <button data-entry-delete="${CV_LIBRARY_LIST_ID}" id="row-0"></button>
      <button data-entry-delete="${CV_LIBRARY_LIST_ID}" id="row-1"></button>
    `;

    const confirm = vi.fn().mockResolvedValue(false);
    useConfirmStore.setState({ confirm });

    const { result } = renderHook(() => useCvLibrary());
    await result.current.remove(version, 1);

    const options = confirm.mock.calls[0][0];
    // Resolved after the row is gone, so the index reads positionally into
    // whatever survives — here, the second enrolled control.
    expect(options.restoreFocusTo?.()).toBe(document.getElementById('row-1'));
  });
});
