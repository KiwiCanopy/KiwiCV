// A thrown error's message can carry provider bodies, row data or quoted CV text, so
// production logs read only the leading error code the workers throw.
const ERROR_CODE = /^([A-Z][A-Z0-9_]*)(?::|$)/;
export const UNCLASSIFIED_ERROR = 'UNCLASSIFIED_ERROR';

/**
 * Content-free summary of any thrown error, safe for production logs.
 * `code` is the message's leading `CODE` or `CODE: …` token only, else `UNCLASSIFIED_ERROR`.
 * @param {unknown} err
 * @returns {{ name: string, code: string, status?: number }}
 */
export function describeError(err) {
  const message = typeof err?.message === 'string' ? err.message : '';
  const status = err?.status;
  return {
    name: typeof err?.name === 'string' ? err.name : 'Error',
    code: ERROR_CODE.exec(message)?.[1] ?? UNCLASSIFIED_ERROR,
    ...(Number.isInteger(status) ? { status } : {}),
  };
}

/**
 * A PostgREST `{ error }` without `details`/`hint`, which can quote the failing row
 * ("Failing row contains (…)") and so the payload or result being written.
 * @param {unknown} error
 * @returns {{ code: string | null, message: string | null }}
 */
export function describeDbError(error) {
  return {
    code: typeof error?.code === 'string' ? error.code : null,
    message: typeof error?.message === 'string' ? error.message : null,
  };
}
