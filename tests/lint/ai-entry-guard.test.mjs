import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { PRODUCT_SOURCE_SKIP, sourceFiles as listSourceFiles } from '../../src/test/sourceFiles.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Every AI entry point owes two checks before starting a run: signed in, then
 * holding a pass. `useAIEntryGuard` owns both, and three of the five
 * sites hand-rolled them anyway for a whole release.
 *
 * ⚠️ **A two-spelling regression pin, NOT the acceptance
 * criterion.** That criterion — "a sixth entry point should be unable to ship
 * unguarded" — is not reachable by a source scan, and an earlier cut of this
 * file claimed it was. Three ways past it, all measured:
 *
 * - `hasAIAccess` is the identity function (`utils/ai.ts`), so the natural
 *   hand-rolled check is `if (!isPremium)`, which carries no token to scan for;
 * - `import { hasAIAccess as hasPass }` defeats the name match outright;
 * - `openGoogleLogin`'s `source` is optional **and sticky** — the store writes
 *   it only `if (options?.source)` — so a surface that omits it contains no
 *   source literal and silently inherits whatever the previous flow left in the
 *   store. That is precisely what `useAIComposer` did before this change, i.e.
 *   the shape this census cannot catch is the one it was written against.
 *
 * What catches a rewired entry point is `hooks/__tests__/aiEntryGuardAdoption.test.tsx`,
 * which drives each surface signed out and as a signed-in Free user. This file
 * pins the two spellings that exist today so they cannot come back quietly.
 */

const sourceFiles = listSourceFiles(path.join(ROOT, 'src'), {
  extensions: ['.ts', '.tsx'],
  skip: PRODUCT_SOURCE_SKIP,
});
const GUARD = 'src/hooks/useAIEntryGuard.tsx';
const read = (file) => fs.readFileSync(file, 'utf8');

test('the named pass predicate is called only by the shared guard', () => {
  const callers = sourceFiles
    .filter((file) => /\bhasAIAccess\s*\(/.test(read(file)))
    .map((file) => path.relative(ROOT, file))
    // Declares it; does not decide with it.
    .filter((file) => file !== 'src/utils/ai.ts')
    .sort();

  assert.deepEqual(
    callers,
    [GUARD],
    'A surface is calling the pass predicate itself. Route the press through `useAIEntryGuard`, ' +
      'which also hands back the paywall JSX so the answer cannot be computed against a modal ' +
      'nobody renders. (This catches the named spelling only — see this file’s header.)',
  );
});

/**
 * ⚠️ The conjunction, not the literal. Banning the bare `'ai_suggest'` string
 * made `useAIEntryGuard('ai_suggest')` — the *explicit* call, which is the safer
 * shape — fail this test, so the guard structurally required the default it
 * exists to make safe.
 */
test('no surface outside the guard opens the sign-in wall under an AI source', () => {
  const callers = sourceFiles
    .filter((file) => {
      const source = read(file);
      return (
        source.includes('openGoogleLogin(') &&
        (source.includes("'ai_suggest'") || source.includes("'translation_invite'"))
      );
    })
    .map((file) => path.relative(ROOT, file))
    .sort();

  assert.deepEqual(
    callers,
    [GUARD],
    'A surface is raising the AI sign-in wall itself. Route it through `useAIEntryGuard` — ' +
      'three sites doing this by hand drifted apart, and one passed no source at all, which ' +
      'the store leaves pointing at whatever flow ran last.',
  );
});
