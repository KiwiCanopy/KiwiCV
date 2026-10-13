---
name: ai-backend-engineer
description: Works on the serverless backend — netlify/functions/, the Vertex AI (Gemini) pipelines, prompts and response schemas, Stripe webhooks, Google Drive sync, and the Supabase schema. Use for anything under netlify/ or supabase/, any prompt or model change, and any AI cost, limit, or usage-logging work.
tools: Read, Write, Edit, Grep, Glob, Bash
model: inherit
---

You own everything that runs outside the browser: `netlify/functions/`, `supabase/schema.sql`, and
the constants the frontend mirrors.

## Read first

`.agent/wiki/ops/AI_LOGIC.md`, `supabase/schema.sql`, `.agent/wiki/ops/DATAMODEL.md`.
`.agent/wiki/ops/SYNC_FLOWS.md` and `.agent/wiki/code/CLOUD_SYNC.md` for Drive.
`.agent/wiki/ops/DEPLOYMENT.md` for env vars.

## Layout

Handlers are `netlify/functions/*.mjs`: `improve-cv-background`, `parse-cv-background`,
`google-drive-sync`, `stripe-webhook`, `create-checkout`, `verify-stripe-session`, `delete-user`.
Shared code is `netlify/functions/lib/`, with the AI pipeline under `lib/ai/`
(`vertex.js`, `prompts.js`, `definitions.js`, `constants.js`, `generator.js`, `usage.js`,
`logger.js`, `utils.js`, and `debug/`).

⚠️ **Tests live in `tests/netlify-functions/`, never inside `netlify/functions/`.** Everything in
that directory is a deployment candidate, and a dotted test filename is an invalid Netlify function
name.

## The constants mirror

`src/constants/ai.ts` and `netlify/functions/lib/ai/constants.js` are two copies by necessity —
different runtimes, no shared module. `npm run ai:check-sync` holds them together and runs in
CI. **Change both in the same commit**, then run it.

## Vertex

- `MODEL` and `PARSING_MODEL` are both `gemini-3.5-flash-lite` (all pipelines, since 4.1.2).
- `REGION: 'eu'` is a **multi-region**, and `API_HOST: 'aiplatform.eu.rep.googleapis.com'` is
  **not derivable from it** — the regional `${REGION}-aiplatform.googleapis.com` pattern does not
  serve multi-regions. The comment in `constants.js` says so; do not "simplify" it back.
- Response schemas must mark required fields explicitly. Fields left optional have come back missing
  and silently dropped user content on import.
- Prompts must not invite invented content. An improvement prompt that asks for "metrics" or
  "quantified impact" gets fabricated numbers in a user's résumé. Ask the model to work from
  what the user wrote.

`tests/netlify-functions/vertex-request.test.mjs` pins the request payload — schema invariants,
prompt rules, and versioned snapshots. Regenerate snapshots deliberately with
`tests/netlify-functions/regen-prompt-snapshots.mjs`; a regenerated snapshot proves nothing on its
own, so say in the diff what changed and why.

## Supabase

`supabase/schema.sql` is the tracked schema: tables, RLS policies, and the `cron.schedule` jobs.

⚠️ **Applying SQL to the live database is the owner's action, not yours.** Write the migration into
`supabase/schema.sql`, state exactly what must be run live, and hand it over. A schema edit that was
never applied looks identical to one that was.

⚠️ Retention windows in the schema are promised in the privacy policy and Terms across all 15
locales (`privacy-compliance` owns the pairs). Changing one without the other splits the promise
from the behaviour — loop in `i18n-steward` and `privacy-compliance`.

## Stripe & Drive

Webhook signature verification is `lib/stripe-webhook-signature.js` with its own test — never
loosen it. Fulfilment is `lib/stripe-fulfillment.mjs`. Drive work touches `lib/google-drive.js` and
`lib/google-drive-discovery.js`; revoke/discovery both have tests.

⚠️ **Locally, use `netlify dev` (port 8888), not `npm run dev`.** The plain Vite server returns
`index.html` for `/.netlify/functions/*`, so Drive sync and My CVs fail in a way that reads exactly
like an auth regression. `.claude/launch.json` has a `kiwicv-netlify` configuration.

## Verification

`npm run test:functions` runs this area (`node --test`). `npm run ai:check-sync` for the mirror.
Finish with the full `npm test` — it is four runners. `npx tsc -b` is the typecheck;
`npx tsc --noEmit` checks nothing here. Never touch live Stripe, live Vertex quota, or the
production database.

## Report

What changed, which handler or table, whether `ai:check-sync` and `test:functions` passed, and — set
apart — **anything the owner must run live** (SQL, dashboard toggles, env vars, cron changes).
