---
paths:
  - 'tests/**'
  - 'src/**/__tests__/**'
---

# Tests

`ops/TESTING.md` is the reference — the priorities, what each suite covers, and
why schema tests come first. This is what binds when you add or change one.

## `npm run test` is four suites, chained with `&&`

```
vitest run && npm run test:functions && npm run test:i18n && npm run test:lint-baseline
```

They run under **two different runners**: `vitest run` first, then three
`node --test` suites. A red link stops the chain, so a failure in `vitest run`
means the other three **never executed**.

**Never report a halted run as "tests pass".** Say which link failed and that
the rest did not run. The distinction is the whole value of the report: "3,142
passing" from a chain that stopped at link one describes a quarter of the gate.

The three Node suites have no `expect`, no `vi`, no `describe` — they are
`node:test` and `node:assert/strict`. Vitest idioms in `tests/i18n/`,
`tests/lint/` or `tests/netlify-functions/` do not fail as unsupported; they
fail as undefined at import time, which reads like a broken path.

## A Netlify function's test never lives beside the function

It goes in `tests/netlify-functions/`. Everything under `netlify/functions/` is
a **deployment candidate** — Netlify tries to publish each file as a function,
and a dotted filename is not a valid function name.

Only `*.test.mjs` is executed there (`node --test tests/netlify-functions/*.test.mjs`).
That is load-bearing in both directions:

- helpers are named so they **do not** match — `prompt-snapshot-configs.mjs`
  and `tests/netlify-functions/regen-prompt-snapshots.mjs` are imported by
  suites, not run as suites;
- a suite named anything else is silently excluded. It will not fail. It will
  not run, and the count will look normal.

`tests/i18n/` is `*.test.cjs`, `tests/lint/` is `*.test.mjs`. A suite in the
right directory with the wrong extension is invisible.

## Editing a prompt means bumping `PROMPT_VERSION`

System prompts and response schemas are snapshotted under
`tests/netlify-functions/__snapshots__/` and coupled to `PROMPT_VERSION` in
`netlify/functions/lib/ai/constants.js`. Both sets are declared in
`prompt-snapshot-configs.mjs` — `SNAPSHOT_CONFIGS` for prompts,
`SCHEMA_SNAPSHOT_CONFIGS` for schemas (`*.json.txt`, `JSON.stringify` in the
builders' insertion order, which is the order Vertex receives). Change either
and `vertex-request.test.mjs` fails until you bump the version and regenerate
with `node tests/netlify-functions/regen-prompt-snapshots.mjs`.

⚠️ **The configs are representative, not exhaustive.** They pin one config per
schema branch and prompt path that exists today. A new schema builder, branch or
prompt path is invisible to the guard until it has a config, and adding that
config belongs to the change that adds the branch.

The regen script **refuses** to overwrite a changed prompt or schema under an unchanged
version — it exits 1 rather than writing. That refusal is not friction to route
around: `usage_logs.details.prompt_version` is what attributes a bad generation
to a prompt, and a silent overwrite makes that column lie about output already
in the database.

**A response-schema change on a billed run bumps it too**, with the prompts
untouched (2026-09-08). The schema is part of what Vertex gets, and it
moves the output: dropping `_vId` from `section:basics` changed the opening of
every summary in a five-run sweep without changing a prompt byte. The column
exists to attribute that. A `FIELD_DEFS` description is prompt text living
inside the schema, so the schema snapshots red on it exactly as the prompt
snapshots red on a prompt edit.

## A new `ResumeData` field needs a case in `validation.test.ts`

`src/utils/__tests__/validation.test.ts` runs `sanitizeResumeData` over the
frozen exports in `examples/`. A field with no case is not partially covered —
it is stripped on import, and every suite still passes, because the thing that
would have complained is the test you did not write.

Keep the old `examples/*.json` in the suite. They are the only evidence that a
CV exported by an older version still opens.

## Prove a new guard reds

Break the thing it protects, watch the suite fail **for the reason you claim**,
restore. Then say in the commit what you mutated.

A guard is the one kind of code whose success tells you nothing — it passes
identically when it is working and when it asserts nothing at all. Shipped from
this repo in a single day: a landing-pricing assertion that matched a string
appearing twice in the source, and a glob check whose fallback resolved to the
repo root for every possible input. Both green, both vacuous, both written by
someone who believed they had just tightened the net.

Assertions to distrust in particular: an `||` fallback, a `.some()` over a list
that could be empty, and `toContain` on a literal that also appears in unrelated
copy.

⚠️ **A guard that compares two copies says nothing about the third.** One test pinned
the cover-letter glyph with `expect(RAIL_ICONS.coverLetter).toBe(ScrollText)`,
where `ScrollText` was imported **in the test file** — so the component's own
choice appeared in neither side of the assertion, and swapping it stayed green.
The test was written by someone who had just quoted the callee/call-site trap.
Assert the **rendered** output, or delete the copy so there is nothing to
compare: that one became a single `COVER_LETTER_ICON` both call sites read.

## The call site needs its own test

A guard that pins a callee does not bind the caller. One change shipped a button that
spent a daily request to report "No changes" every time, through a green `tsc`,
3,169 tests, `lint`, `i18n:check` and `ai:check-sync` — every piece existed and
nothing wired them together.

⚠️ **An OPTIONAL prop is an unbound call site.** One change passed `runStage`,
`coverLetterOutcome` and `onCoverLetterRetry` from `AIEditModal`; all three are
optional, so deleting those three lines typechecked and left every suite green
while the feature silently reverted to its previous behaviour. The component's
own tests render it directly and the hook's tests mock one layer below the JSX —
neither sees the modal. Render the composed thing, and mutate **each** prop
away to confirm the test reds for each.

## Named rules

Comments across the suite cite these by name. Each is a lesson this repo paid
for at least once.

- **both-halves rule** — A guard asserts both directions of its property: the
  case it exists to reject, and the neighbouring case that must keep working (for
  an inventory, a bogus member _and_ a missing one). The half that already passed
  is the one a fix breaks without anyone noticing.
- **render-then-scan rule** — Cover the sites that exist by rendering them;
  a source scan is only the forward guard for the site written next. A scan pins
  nothing about today, and a render says nothing about tomorrow.
- **delete-dead-branches rule** — A branch that cannot run, or a copy that
  restates a check already made, is deleted rather than hardened or kept as
  "defensive". Dead code that reads as live is what the next reader trusts.
- **pin-the-set rule** — Pin the set a walk found, with `toEqual`, never a count
  of what it opened. A count stays true while the one site it existed to catch
  walks past it.
- **adjacent-string rule** — Two adjacent parameters of the same primitive type
  are interchangeable by definition, and a swap compiles. Take the object that
  holds both instead.
- **required-not-documented rule** — A parameter a caller must not omit is
  required, not optional with a doc comment, so that an omission is `TS2554`
  rather than a silent default.
- **mention-is-not-a-call rule** — A source scan proves a mention, not a call. A
  regex keyed on a call shape is defeated by an alias, a nested call, a spread or
  a literal, and a file with no match looks exactly like one that never calls the
  function — so scan for the mention, or walk the AST, and prove the call
  behaviourally.
- **scope-by-property rule** — Scope a scan by the property it protects, not by a
  path, a name or a syntax. Too narrow, and the next instance sits outside it; too
  wide, and it grows an allowlist that is then routed around.
