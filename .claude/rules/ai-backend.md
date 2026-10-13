---
paths:
  - 'netlify/functions/lib/ai/**'
  - 'netlify/functions/improve-cv-background.mjs'
  - 'netlify/functions/parse-cv-background.mjs'
  - 'src/constants/ai.ts'
  - 'scripts/check-ai-constants-sync.cjs'
---

# AI backend

`ops/AI_LOGIC.md` is the reference — the four pillars, the import sequence, the
debug logger, the Vertex endpoint. This is what binds when you change it.

## A background function returns HTTP 200 even when it fails

`vertex.js` has **no retry loop** by design. A failed call throws, the `ai_jobs`
row is marked `failed`, and the function still returns 200 — because a non-2xx
makes Netlify re-fire the background function, and a retried AI call is a second
charge for a request the user already gave up on.

**So never signal failure with a status code here.** Failure is a row state the
client polls, not an HTTP result.

## Bulk travels through the database, never the request body

Netlify caps a background function's request payload at **256 KB**. An uploaded
PDF or DOCX exceeds that as base64, so the client writes it to `ai_jobs.payload`
and POSTs the job id alone; the worker reads it back and clears it on completion.

⚠️ Adding anything sizeable to that POST body reintroduces the failure this
pattern exists for, and it fails _before_ the function runs — so the worker logs
nothing and the client polls a row that never changes. That shipped once as "CV
Import loading forever".

⚠️ **Every `ai_jobs` read and write names the caller: `.eq('user_id', user.id)`
beside `.eq('id', jobId)`**. The workers use the service-role client,
which RLS does not restrict, so a job id alone let one user's request read
another's uploaded file or overwrite their result. An unauthenticated failure
writes nothing. So an expired token surfaces through the client's poll timeout
(≥60 s improve, 180 s import), not a failed row — the price of closing the hole. `parse-job-ownership.test.mjs` and the improve boundary test pin it.

## Constants duplicated across the process boundary are pinned

`src/constants/ai.ts` and `netlify/functions/lib/ai/constants.js` both declare
the shared numbers, and `npm run ai:check-sync` compares them by name.

- Adding a constant to **both** files means adding it to `constantsToSync` in
  `scripts/check-ai-constants-sync.cjs`, or it is silently unguarded.
- **Retiring one means removing it from that list too.** The script hard-exits
  when a listed name cannot be read from either file, and CI's `Lint & Test`
  trusts that exit code — so a half-removed constant reds every PR.

## The section inventory is pinned across the boundary too

`src/constants/__tests__/aiImprovableSections.test.ts` reads
`netlify/functions/lib/ai/definitions.js` **as text** and asserts its
`SECTION_COMPOSITION` keys equal what the editor rail offers Improve for. Text,
not an import, because that file is ESM shipped to Netlify and outside the app's
tsconfig — importing it would test the bundler instead.

So adding a section to the rail without adding it to `SECTION_COMPOSITION` is a
red test, not a runtime surprise. Keep it that way when you touch either side.

## Object-shaped sections have one inventory

`SINGLETON_SECTIONS` in `definitions.js` is the backend's only answer to "is
this section one object?" — read its members there, not from a doc. A member
gets `buildSingletonSchema`, with no `_vId`, on the `section:` and the whole-CV
path alike; the parsing schema builds an object node for it.

`WHOLE_CV_SECTIONS` beside it is the only answer to "is this section part of a
whole-CV run?" — the letter is not, because it gets its own call. The worker's
targets, `requiredSectionsFor` and the user turn (`projectForWholeCv`) read it,
and the cv loop throws on anything else; a `required` name the cv schema does
not carry throws too, so it cannot reach the wire.

⚠️ **Never let a name test pick a shape ahead of the list in
`getVertexResponseSchema`.** That is how `basics` stayed on the item shape while
the list said otherwise. `vertex-request.test.mjs` walks every composition key
and every whole-CV slot against the list, and `aiImprovableSections.test.ts`
pins the list to the store's shape.

⚠️ **Moving a section between shapes changes a billed run.** It is a measurement lane (AGENTS.md §3):
measure before editing — the sweep and what it decided are on
[ops/AI_LOGIC.md](../../.agent/wiki/ops/AI_LOGIC.md) § Three response shapes,
and it is why `PROMPT_VERSION` bumps on a schema change too.

## Adding a key to `SECTION_COMPOSITION` is not adding a section

`generator.js` builds three response shapes and each is a contract with a
different branch of the frontend's apply path — the table is in
[ops/AI_LOGIC.md](../../.agent/wiki/ops/AI_LOGIC.md), which this file does not
restate.

⚠️ Adding the key alone once shipped a feature that spent a daily request to
report "No changes" every time: the fields were not in `FIELD_DEFS`, so the
schema carried untyped nodes — which Vertex does not reject: measured on
2026-09-05, it accepts them and lets the model pick the shape, so the failure is
silent; the item shape asked for a `_vId` a
letter has none of; `applySectionSuggestion` had no branch that could write it
back; and `hasActualChanges` graded every response as a no-op. `tsc`, 3,169
tests, lint, `i18n:check` and `ai:check-sync` were all green.

So a new section is four coordinated changes **plus a run of the pipeline**.
`src/store/resume/slices/ai/suggestions/__tests__/coverLetterImprove.test.ts` is
that run — it spawns node to build the real schema, derives the response from
it, and drives it into the real store. Copy that file rather than asserting that
a key is present.

## A prompt cannot return a field the schema does not carry

`generator.js` builds `responseSchema` from the compositions in
`definitions.js`; `vertex.js` sends it as `generationConfig.response_schema`.
Structured output means the model returns **only** what the schema declares.

Asking for something new in `prompts.js` without adding it to the matching
composition produces a confident answer with the field silently absent.

## The cover-letter call has its own prompt, schema and request bound

`getCoverLetterPrompt` assembles the letter's system prompt and
`generateCoverLetter` hands it to `buildVertexRequest` together with the user
turn — **both or neither**, or it throws `INCOMPLETE_PROMPT_PAIR`. The schema is
`getCoverLetterSchema()`, standalone. And `COVER_LETTER_COMPOSITION` is the one
composition that bounds the **request**, not the response: the CV reaches that
call only through `projectForCoverLetter`.

⚠️ **`getSystemPrompt` does NOT throw on `mode: 'cover_letter'`, and this file
said it did until 2026-09-05.** The letter's role is deliberately absent from
`BASE_ROLE_PROMPTS`, and that function falls back to `professional` for any mode
it does not know — so a letter call that let the request derive its own prompts
would ship the resume-writer role, carrying `GLOBAL_FORMATTING_RULES` rule 2,
which forbids the new prose a letter is, and nothing would fail. The seam is what
prevents it. Never route the letter through `mode`.

⚠️ **The formulas are pinned, the norms are not.** `COVER_LETTER_FORMULAS`
carries the salutation and closing per letter language, and a test asserts the
prompt quotes them. Whether the German letter came back with German restraint
is delegated to the model and cannot be tested — an accepted trade.

⚠️ **The length phrasing was measured, not written.** Three phrasings were
swept against Vertex and the one that ships was the only one that neither ran
far short nor spilled onto a second page. The figures and the rejected variants
are on `ops/AI_LOGIC.md` § The cover-letter call; do not re-word
`coverLetterLengthRules` without re-running that sweep.

## A letter failure is a notice, and only a success is billed

Call 2 is a second Vertex call in the same background job, and each call
reserves its own `usage_logs` row before it runs (`createUsageHold` in
`lib/ai/usage.js`), settles it after its own success and releases it
otherwise: 2 slots when both succeed, **1** when the letter fails, 0 when the
CV call does. One function, `ai_usage_count_today`, counts the rows for both
the client and the reservation, so that is the whole billing rule. Why the reservation and not an
insert after the call: `.claude/rules/database.md` § The daily AI allowance.

⚠️ **Never let a letter failure reach the `catch`.** The tailoring the user came
for is already done and already paid for, so `generateCoverLetter` returns a
`COVER_LETTER_FAILURES` code rather than throwing, and the job completes with
`ai_jobs.result.coverLetterError` beside the CV result. A class list, the year
check and the retry are on
[ops/AI_LOGIC.md](../../.agent/wiki/ops/AI_LOGIC.md) § The second call.

⚠️ **One reservation pays for one call.** Anything that adds a third call
reserves its own slot before it runs, or the job bills past
`AI_PRO_DAILY_LIMIT` on the day it matters. Every reservation the job still
holds when it reaches the `catch` is released there by `hold.releaseAll()`,
so a failed job keeps no slot. A reservation that fails or is refused for a follow-on call is a notice
(`LETTER_CALL_FAILED`, `LETTER_ALLOWANCE_SPENT`), never a thrown error.

⚠️ **The `catch` is reachable from the accounting, not only from the call.**
`hold.settle` throws on a write error, so an unwrapped settle for a
follow-on call fails the whole job and discards a result the user already paid
for. An unsettled row keeps holding its slot until the reservation expires; a
lost result is the run. Call 1's settle stays unwrapped on purpose — a job that
cannot account for the request it just made is a job that failed, and the
`catch` gives its slot back.

## `mock: true` does not exercise the free tier

The mock path runs the full accounting logic — reservation, settle, allowance
count — which is what it is for. But it also satisfies `isPro`, so it walks past
the `PREMIUM_REQUIRED` rejection entirely.

**A mock run therefore proves nothing about the paywall.** There is no frontend
mock path at all. ⚠️ Because a mock counts as Pro, the workers honour it **only
under `NETLIFY_DEV=true` or `AI_ALLOW_MOCK=true`** (`mockAllowed()` in
`lib/ai/request.js`) — a production request body cannot switch it on. Drive
it locally by POSTing `mock: true` under `netlify dev`, or set `AI_ALLOW_MOCK` in a
test (`cover-letter-billing.test.mjs` does).

## The allowance is a row count on a Berlin day

`get_ai_usage_status` counts `usage_logs` rows for the current
`Europe/Berlin` date where `package_used IN ('pro','trial')`. It sums no column.

⚠️ The client cannot compute this from a profile. `hasAIAccess` in
`src/utils/ai.ts` checks the pass and **deliberately not** the allowance, because
the only source for the count is that RPC — an earlier version read a
`profile.ai_requests_today` field that `public.profiles` has never had, so its
allowance half was permanently `0 < 200` while reading as a real check.

Surfaces that must tell "no pass" from "allowance spent" read `isDailyLimitReached`
from `useAIRunner`. Surfaces that only gate an attempt use `hasAIAccess` and let
the backend answer `LIMIT_REACHED`.

## Error codes are a contract with the frontend

Only two codes are branched on by the frontend: `PREMIUM_REQUIRED` and
`LIMIT_REACHED`. They live as `AI_PAYWALL_CODES` in `lib/ai/constants.js` and
`src/constants/ai.ts`, paired by `npm run ai:check-sync`; `useAIJobRun` sends a
row failed with either to the dialog's `onRefused`, which opens the paywall.
Throw them through the constant, never a literal: a code the client does not
recognise silently becomes a generic "something went wrong".

The improve worker's request guards (`lib/ai/request.js`) throw more:
`MISSING_PARAMS`, `INSTRUCTIONS_TOO_LONG`, `PAYLOAD_TOO_LARGE` and
`INVALID_TARGET` — `PAYLOAD_TOO_LARGE` also for a whole-CV translation past
`AI_TRANSLATION_MAX_CHARS`, which the dialog refuses first. The import worker throws `MISSING_PARAMS` and `PAYLOAD_TOO_LARGE` as well.
After a response arrives, `RESPONSE_FAILURES` (`lib/ai/responseChecks.js`) fail the job unbilled:
`AI_RESPONSE_TRUNCATED` (both workers, `finishReason: 'MAX_TOKENS'`) and `TRANSLATION_INCOMPLETE`
(a whole-CV translation that did not answer every entry it was sent). These
reach the job row's `error` and the client shows the generic error for every one
of them, so the app's own controls must never produce one. `REQUEST_REFUSALS`
in `request.js` lists the guard codes the worker warns on instead of logging as
faults, beside the two paywall codes. `MISSING_PARAMS` stays a fault.
