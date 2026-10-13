import { googleDriveService } from '@/services/google-drive';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * AuthProvider discards the stored Drive credential on INSUFFICIENT_SCOPE and
 * INVALID_GRANT only, so the handshake must surface exactly those two codes
 * from google-drive-sync and keep every other refusal as UNAUTHORIZED.
 */
const respond = (status: number, body: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));

const failureOf = (promise: Promise<unknown>) =>
  promise.then(
    () => 'resolved',
    (error: Error) => error.message,
  );

afterEach(() => {
  vi.restoreAllMocks();
});

describe('googleDriveService.handshake', () => {
  it('surfaces INSUFFICIENT_SCOPE from a refused handshake body', async () => {
    respond(200, { success: false, error: 'INSUFFICIENT_SCOPE' });

    expect(await failureOf(googleDriveService.handshake('t'))).toBe('INSUFFICIENT_SCOPE');
  });

  it('surfaces INVALID_GRANT from the function’s 400', async () => {
    respond(400, { success: false, error: 'INVALID_GRANT' });

    expect(await failureOf(googleDriveService.handshake('t'))).toBe('INVALID_GRANT');
  });

  it('keeps a generic refusal body as UNAUTHORIZED', async () => {
    respond(200, { success: false, error: 'UNAUTHORIZED' });

    expect(await failureOf(googleDriveService.handshake('t'))).toBe('UNAUTHORIZED');
  });

  // A function-level 401/403 is not Google's verdict on the token, whatever it carries.
  it.each([401, 403])('keeps a %s from the function as UNAUTHORIZED', async (status) => {
    respond(status, { error: 'INVALID_GRANT' });

    expect(await failureOf(googleDriveService.handshake('t'))).toBe('UNAUTHORIZED');
  });
});
