// Node 24's `JSON.parse` messages can quote the input (`Unexpected token 'J', "Jane Doe s"...`),
// so a parse error must never be logged whole when the input is CV-derived.
const TRAILING_POSITION = /at position (\d+)(?: \(line \d+ column \d+\))?$/;

/**
 * Content-free summary of a `JSON.parse` failure, safe for production logs.
 * `position` is read only from messages that end in V8's position suffix, which never quote input.
 * @param {unknown} error
 * @param {unknown} input the string that failed to parse; only its length is read
 * @returns {{ name: string, inputLength: number | null, position: number | null }}
 */
export function describeJsonParseError(error, input) {
  const message = typeof error?.message === 'string' ? error.message : '';
  const position = TRAILING_POSITION.exec(message)?.[1];
  return {
    name: typeof error?.name === 'string' ? error.name : 'Error',
    inputLength: typeof input === 'string' ? input.length : null,
    position: position === undefined ? null : Number(position),
  };
}
