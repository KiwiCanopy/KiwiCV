---
paths:
  - 'supabase/**'
  - 'netlify/functions/lib/supabase-admin.mjs'
---

# Database

`supabase/schema.sql` is the reference — it is checked in, idempotent, and
states every table, policy, trigger and cron job. This file does not restate it.
What follows is what binds when you change it.

## `schema.sql` is never applied by anything

It is a **destructive full-rebuild script**: it opens with `DROP TABLE … CASCADE`
and there is no `supabase/migrations/` directory. Nothing runs it against
production — not CI, not a deploy, not a release.

**So a change to `schema.sql` is not a change to the database.** Every edit here
either ships with the live statement that applies it, or it is a change that
exists only in the repo. Say which, in the PR, before merging.

⚠️ This has already bitten in both directions. `usage_logs.model_used` needed a
manual `ALTER … SET DEFAULT` that went unrun **twice** — 2026-07-29 and again on
2026-08-02 — each time because the tracked file was treated as the applied one.
And the 2026-09 credit removal needed a hand-run script for exactly this reason.

## Replace a function before dropping what it reads

A `SECURITY DEFINER` trigger that references a column must be replaced **before**
that column is dropped, in **one transaction**. `handle_new_user` writes to
`profiles` on every signup and `protect_premium_fields` reads `OLD`/`NEW` on
every profile UPDATE, so a drop that lands first breaks account creation and all
profile writes at once, for everyone, until the function catches up.

## A guard must mirror the constraint it protects

If you write a pre-flight check before a destructive statement, express it as the
**negation of the thing you are about to enforce**, and have it report the
offending values rather than a count.

⚠️ A 2026-09 guard protecting `CHECK (fulfillment_type IN ('timepass'))` counted
only rows where `fulfillment_type = 'credits'`. Every other value passed the
guard and broke the `ALTER` it was written to prevent. **A guard narrower than
its constraint is worse than none, because it reads as protection.**

## A new table is RLS-enabled, or the reason is written down

There is no exception today. The last one, `used_freebies`, was dropped with the
sign-up trial (2026-10-08). If a new table has no RLS, it needs its argument —
no `user_id`, no client-facing access path, touched only by a `SECURITY DEFINER`
function — written beside it in `schema.sql`, not an omission.

Note the shape of the other exception: `user_tracking` has RLS **on** with no
policies, which is how a table is made invisible to every client role rather
than merely unguarded.

## `protect_premium_fields` is the allow-list for entitlement fields

Any column a user must not set for themselves — tier, pass expiry, Stripe
identity, email — is reverted there for non-`service_role` writers. **Adding such
a column without adding it to that trigger grants every authenticated client
write access to it**, because the `profiles` RLS policy already allows the row.
The consent timestamps `accepted_terms_at` / `accepted_privacy_at` are part of
the same list: a client write never clears them and is stamped with the
server's `now()`, so a user can neither backdate nor future-date a consent.
Never echo `accepted_*_at` back in a profile update: any difference, even a
millisecond rounding, re-stamps the consent to the save time.

⚠️ The SQL editor runs as `postgres`, whose `role` setting is `none`, so the
trigger treats it as a client: a hand edit of tier, expiry or a consent date is
reverted or re-stamped. Run such corrections with `SET LOCAL role service_role;`.

## A `SECURITY DEFINER` function is public API until its EXECUTE is revoked

Postgres grants EXECUTE to `PUBLIC`, and Supabase's default privileges grant it
to `anon` and `authenticated`, so every function in `public` is callable over
`/rest/v1/rpc` — and a definer function runs past RLS. Each non-trigger one in
`schema.sql` is followed by the `REVOKE`/`GRANT` naming who may call it (a
trigger function cannot be called outside its trigger). A new one without
that pair is an open endpoint: `fulfill_stripe_order` and `add_timepass` were,
until 2026-10-13. A function that takes a user id from a client must ignore it
for anyone but `service_role` (see `get_ai_usage_status`).

## The daily AI allowance is a row count on `package_used`

`ai_usage_count_today` counts `usage_logs` rows where `package_used IN ('pro',
'trial')`, and both `get_ai_usage_status` and `reserve_ai_usage` call it. It sums
nothing. So adding a member to `package_type`, or changing
what the background functions write there, changes what the allowance counts —
and the index `idx_usage_logs_user_today_pro` carries the same predicate and must
move with it.

**The row is reserved before the call, not inserted after it.**
`reserve_ai_usage` takes a per-user `pg_advisory_xact_lock`, counts, and inserts
a row with `pending_until` set, in one transaction; the worker settles it
(`pending_until := NULL`, plus tokens, model, details) after the call succeeds,
or deletes it on failure. A count read first and a row written after the call
let every parallel job pass a count none of them had added to yet.

- **One function owns the predicate: `ai_usage_count_today`.** Change it
  there and the client's "limit reached" and the worker's refusal move
  together. It includes `pending_until IS NULL OR pending_until > now()`: an
  in-flight reservation holds its slot, and one whose worker died stops
  counting after 20 minutes (Netlify's background limit is 15). Keep the
  `package_used IN (...)` list literal so the planner can match
  `idx_usage_logs_user_today_pro`; the time terms are a filter on the rows the
  index finds.
- **Expired reservations are swept hourly** by the `cleanup_expired_usage_reservations`
  cron job. The `> now()` term covers the hour between expiry and sweep.
- `reserve_ai_usage` and `ai_usage_count_today` are **service-role only**. The
  helper needs no grant for its two callers, which run as their owner; its
  REVOKE closes the direct RPC route. The reservation writes
  `package_used = 'pro'` and NULL tokens and `model_used`, so a request count
  over `usage_logs` that should mean "billed" filters `pending_until IS NULL`.
- A reserve whose transaction commits but whose response is lost holds its slot
  with no id to release it; it can never overbill, and it frees itself at
  expiry and is swept within the hour.
- A pending row's `created_at` is the reservation time, so a call that starts
  before Berlin midnight and finishes after it counts for the earlier day.

⚠️ **Danger fact, repeated here because it is invisible from `schema.sql`:** the
live enum still carries a third value, `'credits'`, that this schema does not
declare. Postgres cannot drop an enum value in place. Nothing has written it
since 4.3.4, so the drift is accepted — but a `CREATE TYPE` comparison against
production will disagree, and that is expected rather than a bug.

## Reading `usage_logs.model_used` on old rows

The reservation inserts `model_used` NULL and the worker's settle writes the
model the call used, so the column DEFAULT is a fallback only, and a NULL marks
a reservation that was never settled. Past values, for anyone querying history:
rows before 2026-07-29 carry `gemini-2.5-flash`; up to 2026-08-01
`gemini-3.1-flash-lite`; briefly `gemini-3.5-flash` and a per-type split on
2026-08-02; `gemini-3.5-flash-lite` since.

## Retention windows are quoted in the privacy policy

`cleanup_old_ai_jobs` runs hourly on a **23-hour** predicate, so no row outlives the
"24 hours at the latest" in the Terms §1 and Privacy §8. A 24-hour predicate left rows up to 24 h 59 min —
do not "round it back".

**Changing a window means changing the policy in the same change set**, which
means the locale packet, which means it is not a one-line change. Treat a
retention edit as legal copy that happens to be written in SQL.

## Deleting a user

`netlify/functions/delete-user.mjs` calls `auth.admin.deleteUser`, and every
table with a `user_id` FK cascades from it, so privacy §7 can promise that
deletion is complete. Any row kept past deletion needs that promise changed in the
same change set — the trial's email hash was the last such exception (2026-10-08).

⚠️ So a new table holding anything a user could ask to be erased needs the FK.
Without it the row silently survives deletion, and nothing will tell you.
