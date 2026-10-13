---
description: Run KiwiCV's full verification gate — typecheck, the four test runners, lint, and the i18n and constant checks (AGENTS.md §6). Use before any commit, push, or PR, and before describing anything as typechecked, tested, or verified.
argument-hint: "[optional: 'quick' to skip the build-adjacent checks]"
---

Run KiwiCV's verification gate — the §6 commands AGENTS.md keeps
saying are overlooked — in order, and report each step's real
result. Stop and surface a failure the moment one appears; do not
paper over it or continue as if it passed.

**Report what you ran, what passed, and what you did not run.**
"Verified" with a step skipped is the failure this skill exists to
prevent.

## The four traps

Every one of these has shipped breakage. They are why the commands
below are not the obvious ones.

1. **`npx tsc --noEmit` typechecks nothing.** The root
   `tsconfig.json` is a solution file (`"files": []` plus two
   `references`), so it resolves zero inputs and exits 0 no matter
   what is broken. Confirm with
   `npx tsc --noEmit --listFiles | wc -l` → `0`.
   **The typecheck is `npx tsc -b`**, plus `--force` when a stale
   `.tsbuildinfo` could hide an error.
2. **`npm test` is four runners**, not one: `vitest`,
   `test:functions`, `test:i18n`, `test:lint-baseline`.
   `npx vitest run` is a _partial_ run — confident green while
   skipping locale integrity and the lint baseline entirely.
3. **`npm test` does not typecheck.** Vitest strips types rather
   than checking them. A type error can survive a green `npm test`
   _and_ a green `npx tsc --noEmit` and surface only at build.
4. **`npm run build` rewrites `public/sitemap.xml`**, which is
   committed. Running it dirties the tree; stage it deliberately or
   restore it.

## The gate

1. `npx tsc -b` — the typecheck of record. Add `--force` after
   branch switches, rebases, or when a previous run failed.
2. `npm test` — all four runners, one command.
3. `npm run lint`
4. `npm run i18n:check` — **and run it before the locale change
   too, not only after.** It is the only check that catches a live
   file borrowing a key from an unrelated subtree; file-level dead
   code analysis cannot see that, and has already deleted a key
   still in use.
5. `npm run ai:check-sync` — pairs `src/constants/ai.ts` against
   `netlify/functions/lib/ai/constants.js`. CI's `Lint & Test` runs
   it, so a failure here is a red PR.
6. `npm run brand:check`

Steps 4–6 are cheap. Do not drop them for being unfamiliar; each
covers a class the first three cannot see.

## What the diff earns on top

- **Any new user-visible string** → `npm run i18n:literals`.
  `i18n:check` cannot see a string that never calls `t()`.
  `tests/lint/bare-literals.test.mjs` runs inside `npm test` and
  fails on anything not frozen in `bare-literal-baseline.js`, so
  this mostly tells you _which_ string before the suite does.
- **A locale key added, renamed or removed** → after the change,
  `npm run i18n:handoff:import -- --check`. A key with no row in
  `scripts/i18n/handoff-catalog.cjs` is never offered for
  translation and never reported missing.
- **A deleted component** → deleting the file is not enough. It
  orphans locale keys, analytics source strings, and often an entry
  in `eslint.config.js`, `eslint-legacy-baseline.js` or
  `bare-literal-baseline.js`. Sweep them in the same change set.
- **A previewable UI change** → run it in the browser. The suite
  cannot see a control that is focusable inside an `aria-hidden`
  subtree, or a headline that wraps a line too far.

## ⚠️ Do not run the suite against a busy machine

`npm test` alongside a dev server, a concurrent `tsc -b --force`,
or another agent's test run produces **timeout failures that look
like real ones** — `Test timed out in 5000ms` in the editor-form
and Typst-compile suites, which are the slowest. Stop the dev
server and let other runs finish first. A red suite from contention
wastes more time than the wait.

## Reporting

State the gate you ran and the outcome of each step. If a step was
skipped, say which and why. If a subagent claims it already ran the
gate, run it yourself anyway — a subagent's verification claim is
not verification.
