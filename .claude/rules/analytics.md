---
paths:
  - 'src/services/analytics.ts'
  - 'src/providers/PostHogProvider.tsx'
---

# Analytics

`code/ANALYTICS.md` is the reference — the event categories and what each one
means. This is what binds when you add or change one.

## No PII, ever, in any property

Not an email, not a name, not a CV field value, not a free-text input. The
product's privacy claim is that none is captured, and that claim is published on
the legal pages.

⚠️ **`ai_target` strips the item UUID (`:vId`) on purpose** — `item:work`, never
`item:work:3f2a…`. It keeps targets aggregatable _and_ keeps a per-item
identifier out of the vendor. Do not "enrich" it back in.

A new event or property can be a new **data flow**, not just a metric. If it
records something the privacy policy does not describe, the policy changes in
the same change set.

## Define the event in `ANALYTICS_EVENTS`, never as a literal

`src/services/analytics.ts` is the single source. An inline string is invisible
to every consumer of that constant, and a duplicated one is worse — a literal
appearing twice in a file is exactly what made a lint assertion vacuous in
`tests/lint/pricing-analytics.test.mjs`, which now scopes itself to the event's
payload rather than the source text.

## Do not undo the privacy configuration

`persistence: 'memory'`, `cookieless_mode: 'always'`, `disable_session_recording:
true`, and **no `identify()` or `alias()`**. These are load-bearing for the
no-cookie claim, not defaults someone left behind.

`api_host` is hardcoded to the first-party proxy path in
`src/providers/PostHogProvider.tsx`. Pointing it at the vendor host directly
makes the traffic third-party: the visitor's browser then contacts PostHog
directly. The path is twinned with the `/api/v1/sync/*` redirect in
`netlify.toml`; renaming one without the other silently drops every event.

⚠️ **Analytics is off unless `VITE_POSTHOG_KEY` is set**, in production as much
as in development, and local dev logs to the console instead of initialising. If
events are not arriving, check the variable before debugging anything else.

⚠️ IP hashing is a **setting in the PostHog project** (verified by the owner,
2026-10-11), not a property of this code. Do not cite it as one.

## "Update this documentation" is not a step

`code/ANALYTICS.md` listed that as step 3 of adding an event, and it is the
instruction that reliably does not happen — which is why the binding parts are
here instead. Keep this rule true; let the wiki page describe.
