const assert = require('node:assert/strict');
const test = require('node:test');

const { checkLocales } = require('../../scripts/i18n/check-locales.cjs');
const { checkUsage } = require('../../scripts/i18n/check-usage.cjs');

/**
 * `scripts/check-i18n.cjs` composes three checks — `checkLocales`,
 * `checkUsage`, `checkScripts` — and ran in exactly one place: the
 * `'src/locales/**\/*.ts'` rule in `.lintstagedrc.cjs`. So it fired only when a
 * LOCALE FILE was staged. A commit touching only a `t()` call site never
 * triggered it, and neither `.husky/pre-push` nor either GitHub workflow ran it.
 *
 * `checkUsage` is the only thing in the repo that validates a **call site** —
 * that a literal key exists in English, and that a non-literal call is
 * registered in `scripts/i18n/config.cjs`. Measured on a review pass:
 * swapping two arguments so a composed key became
 * `themes.palettes.default.lunar` — a raw key rendered in the design tab in all
 * fifteen locales — passed `tsc -b --force`, the full suite and lint. Only
 * `i18n:check` caught it, and nothing ran `i18n:check` for a change like that.
 *
 * ⚠️ **The house pattern for this was already in the repo, one file over, and it
 * already covered a third of the problem.** `script-contamination.test.cjs`
 * wraps `checkScripts()` as a `node:test` with a comment stating the same
 * intent — *"`i18n:check` runs this via lint-staged on any locale edit; this
 * test keeps it in `npm test` too, so a change that skips the hook still gets
 * caught."* `tests/lint/bare-literals.test.mjs` does the same for
 * `find-bare-literals.cjs`. This file is the other two thirds; nothing in
 * `package.json` needs to change, and the existing `test:i18n` glob picks it up.
 *
 * A first draft prepended `npm run i18n:check` to the `test` script
 * instead. An architect pass caught two things that makes worse: `checkScripts`
 * would run **twice** per `npm test`, and `&&` at the *head* of the chain is the
 * maximally destructive position — one stale key and you see zero vitest
 * results, zero function tests, zero lint-baseline results, so a contributor
 * refactoring forty components iterates blind until they fix the key. Two named
 * assertions here fail on their own and leave the rest of the suite reporting.
 *
 * ⚠️ Several test files justify English-only assertions with "`checkLocales`
 * enforces key-for-key parity" (`paletteResolution.test.tsx`,
 * `typstCompile.test.ts`, `locales/en/themes.ts`). Until this file, that
 * enforcement ran only in a pre-commit hook on locale edits. Those comments are
 * now true.
 *
 * Verified by mutation: renaming one `t()` key at a call site with no locale
 * file touched — `common.confirm_delete_title` → `common.confirm_delete_titel`
 * in `useArrayForm.ts` — passed the whole suite before and fails
 * `every t() call site names a key that exists` by name after.
 */

test('every locale has the same key structure as English', () => {
  assert.deepEqual(
    checkLocales(),
    [],
    'A locale is missing, has an extra, or disagrees on the shape of a key. ' +
      'Repair the locale file rather than the assertion — every other suite in ' +
      'this repo asserts against English alone on the strength of this check.',
  );
});

test('every t() call site names a key that exists', () => {
  assert.deepEqual(
    checkUsage(),
    [],
    'A t() call references a key English does not have, or builds a key ' +
      'dynamically without being registered in scripts/i18n/config.cjs. The ' +
      'user sees the raw key, in every locale.',
  );
});
