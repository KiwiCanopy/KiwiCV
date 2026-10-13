# Testing Guide

> **Last Updated: 2026-10-06**

## Overview

KiwiCV uses **Vitest** for unit and logic testing. We prioritize testing data integrity, migrations, and complex shared utilities.

## Core Setup

- **Framework**: Vitest (Node environment for logic, JSDOM available for components).
- **The suites**, in the order `npm run test` chains them:
  1. `vitest run` — unit and logic tests under `src/`.
  2. `npm run test:functions` — Netlify handlers and libraries.
  3. `npm run test:i18n` — translation and locale integrity.
  4. `npm run test:lint-baseline` — lint/policy guardrails: the legacy ESLint
     baseline plus checks such as bare literals, font info, sitemap `noindex`,
     pricing analytics, and the citations in `.claude/rules`.
- `npm run test:watch` is interactive Vitest.

> [!IMPORTANT]
> How the chain gates, where each suite's files must live, and what a prompt
> edit obliges you to bump are in `.claude/rules/testing.md`, which loads when
> you edit a test. Not restated here — this page is the map, that file is the
> contract.

## Testing Priorities

### 🚨 Critical: Schema & Migration

We must ensure that every version of KiwiCV can still import data from older versions.

- **Location**: `src/utils/__tests__/validation.test.ts`
- **What to test**:
  - `sanitizeResumeData` output against `examples/*.json`.
  - Verification that legacy keys (e.g., `sectionOrder`, `ui`) are correctly migrated or stripped.
  - Automatic `_vId` generation for array items.

### High Priority

- **Shared Utilities**: Date formatting, visibility logic, and currency handling.
- **State Logic**: Critical Zustand slices (e.g., `dataSlice` logic).

### AI request payloads (added 2026-08-02)

`tests/netlify-functions/vertex-request.test.mjs` tests what is actually SENT to
Vertex — without any network call — through the pure `buildVertexRequest` seam
in `netlify/functions/lib/ai/vertex.js`:

- schema invariant: every OBJECT in the parsing schema `require`s all its
  properties, recursively (Gemini silently omits non-required ones)
- model routing (parse → `PARSING_MODEL`, improve → `MODEL`), temperature
  (0.1 for parsing only), parts shape per input type
- prompt-rule pins: no condensing rules in the parse prompt, "never invent
  a number" in improvement prompts
- snapshots coupled to `PROMPT_VERSION`, declared in `prompt-snapshot-configs.mjs`:
  the system prompts (`SNAPSHOT_CONFIGS`) and the response schemas
  (`SCHEMA_SNAPSHOT_CONFIGS`: the parsing schema, the cover-letter schema, and
  `getVertexResponseSchema` for one representative config per branch — whole
  CV, translating CV, item, list section, singleton section, custom section,
  and both `allowReorg` paths). A changed prompt or schema under an unchanged
  version reds the test, and `regen-prompt-snapshots.mjs` exits 1 rather than
  overwrite it. ⚠️ The set is representative, not exhaustive: a new schema
  builder or branch is not covered until a config is added for it, and adding
  that config belongs to the same change

## A guard's name can assert coverage it does not have

**A test name has to be false when the thing it claims is false.** It is read far
more often than its body, and a name broader than its assertion is what makes the
uncovered half look covered — nobody re-reads the loop to check.

`tests/lint/entry-delete-anchor.test.mjs` was the case that proved it.
"every entry-delete flow hands the dialog a focus anchor" passed for a whole release
while `useArrayForm`'s **second** route out of `deleteItem` — an empty entry,
which skips the confirm entirely and so has no dialog to hand anything to — was
dropping focus to `<body>`. The flow the name pointed at did pass an anchor. The
name is now "every **confirm-gated** entry-delete flow".

⚠️ **Renaming closes the claim, not the hole.** The narrower name was true the
moment it was written, and the route it stopped over-claiming was still unfixed.
Say what the guard covers _and_ what now covers the rest, or the next reader
reads the rename as the repair.

## A source scan walks through the shared helper

A scan that walks fewer files than intended does not fail — it passes, having
looked at less. So every source scan, under both runners, lists files through
`src/test/sourceFiles.ts`, with `extensions` and `skip` required at the call
site. The `node --test` suites in `tests/lint/` import it as
`../../src/test/sourceFiles.ts` — Node 24 strips the types — so it may not use
`@/` imports. `src/test/__tests__/sourceFiles.test.ts` fails on any other file
under `src/` that lists a directory recursively: `readdirSync(` with
`isDirectory()`, `readdirSync` with `recursive: true`, or `globSync(`. It does
not see `tests/` or `scripts/`.

## Paths in tests

- **The repository root comes from a file, never `process.cwd()`** — the
  latter is right only while the runner happens to start at the root. Use
  `REPO_ROOT` from `src/test/sourceFiles.ts`.
- **A package is found by module resolution, never by `ROOT/node_modules/...`**
  (`createRequire(import.meta.url).resolve(...)`, or a bare specifier). An
  agent's nested worktree (`.claude/worktrees/<name>`) has no `node_modules` of
  its own and resolves the checkout's one above it, so a fixed path fails there
  with `ENOENT`.

## Render tests and the 5 s timeout

- **A walk that opens every disclosure clicks with `fireEvent`, not `user.click`.**
  user-event's pointer sequence cost ~2x per click on the editor forms, and a
  15-click walk hit 5.5 s at load average ~11 and failed pre-push. Keep
  `userEvent` for tests about the interaction itself (keyboard, focus).
- **Expand only what hides the subject.** A card walk skips `[aria-haspopup]`
  triggers unless the popup is under test; each calendar it opens is a full render.
- Make a slow case cheaper before raising its timeout; a raised timeout is
  per-file or per-test, with the measured cost beside it, never a global `testTimeout`.

## Best Practices

1. **Schema-First**: When adding a new field to `ResumeData`, always add a corresponding test case in `validation.test.ts` to ensure it's not stripped during import.
2. **Untrusted Data**: Use `unknown` and `Record<string, unknown>` when testing raw imports to mimic real-world "dirty" JSON.
3. **Regression Focus**: Keep legacy example files (e.g., `resume_200.json`) in the `examples/` directory and keep them in the test suite to prevent migration regressions.

---
