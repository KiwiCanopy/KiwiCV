// @vitest-environment jsdom
import { GITHUB_LAST_SYNC_HASH_KEY } from '@/services/storage/githubStorage';
import { expect, it, vi } from 'vitest';

vi.mock('@/bootstrap', () => ({}));
vi.mock('@/services/pwaInstall', () => ({ initPwaInstall: () => {} }));
vi.mock('@/utils/staleChunkReload', () => ({ installStaleChunkReload: () => {} }));

it('app startup discards a sync hash left as a base64 copy of the resume', async () => {
  localStorage.setItem(GITHUB_LAST_SYNC_HASH_KEY, btoa(JSON.stringify({ basics: {} })));

  await import('@/main');

  expect(localStorage.getItem(GITHUB_LAST_SYNC_HASH_KEY)).toBeNull();
});
