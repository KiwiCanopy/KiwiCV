// @vitest-environment jsdom
/**
 * The Drive disconnect confirm stays open and uncancellable while the revoke
 * runs, so a stalled request has to end as a failure.
 */
import { REVOKE_TIMEOUT_MS, googleDriveService } from '@/services/google-drive';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('googleDriveService.revoke', () => {
  it('gives up with false when the request never answers', async () => {
    vi.useFakeTimers();
    // Never resolves on its own; settles only if the caller's signal aborts, as fetch does.
    const neverAnswers = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(init.signal?.reason));
        }),
    );
    vi.stubGlobal('fetch', neverAnswers);

    let settled: boolean | undefined;
    void googleDriveService.revoke('refresh-secret').then((value) => (settled = value));

    await vi.advanceTimersByTimeAsync(REVOKE_TIMEOUT_MS - 1);
    expect(settled).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    expect(settled).toBe(false);
  });
});
