import { COVER_LETTER_DEFAULT_TONE, COVER_LETTER_TONES } from '@/constants/ai';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * The tone keys are a contract across a process boundary, and nothing typechecks
 * a string that crosses one.
 *
 * `getCoverLetterPrompt` throws `UNKNOWN_LETTER_TONE` for a key
 * `COVER_LETTER_TONES` does not carry, which the worker turns into
 * `LETTER_BAD_REQUEST` — one of the two failures `coverLetterRetryable` says a
 * retry cannot clear. So a tone the picker offers and the prompt does not is a
 * dead option that costs the user a run and reports a letter that "did not come
 * through".
 *
 * ⚠️ `npm run ai:check-sync` cannot cover this. It pairs *named numeric
 * constants* by name; here the frontend holds a key array and the backend an
 * object of behavioural sentences, which is not a shape it can compare.
 *
 * ⚠️ The backend file is read as **text**, not imported — the same reasoning as
 * `aiImprovableSections.test.ts`: it is ESM shipped to Netlify, outside the
 * app's tsconfig, and importing it would make this a test of the bundler.
 */

const BACKEND_PROMPTS = fileURLToPath(
  new URL('../../../netlify/functions/lib/ai/prompts.js', import.meta.url),
);

function backendToneKeys(): string[] {
  const source = readFileSync(BACKEND_PROMPTS, 'utf8');
  const start = source.indexOf('export const COVER_LETTER_TONES = {');
  if (start === -1) throw new Error('COVER_LETTER_TONES not found in the backend prompts');

  const end = source.indexOf('\n};', start);
  if (end === -1) throw new Error('COVER_LETTER_TONES block is not terminated');

  return [...source.slice(start, end).matchAll(/^ {2}(\w+):/gm)].map((match) => match[1]);
}

describe('cover-letter tones', () => {
  it('finds the backend table at all', () => {
    // Without this the two assertions below pass vacuously the day the backend
    // constant is renamed — an empty list is a subset of everything.
    expect(backendToneKeys().length).toBeGreaterThan(0);
  });

  it('offers exactly the tones the prompt defines', () => {
    expect([...COVER_LETTER_TONES].sort()).toEqual(backendToneKeys().sort());
  });

  it('defaults to a tone the prompt defines', () => {
    expect(backendToneKeys()).toContain(COVER_LETTER_DEFAULT_TONE);
  });
});
