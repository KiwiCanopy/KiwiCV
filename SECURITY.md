# Security Policy

## Reporting a Vulnerability

Please **do not** open a public issue for security problems.

Instead, use GitHub's private vulnerability reporting
("Security" tab → "Report a vulnerability") on this
repository. You will get an acknowledgement within a few days.

Please include reproduction steps, the affected commit or the
version shown in the app's changelog, and the browser you used.

## Testing Rules

Test against a local instance (see the README) or your own
account. Do not access or modify other users' data, do not run
denial-of-service or social-engineering attempts, and do not
automate requests to the AI features — each one is a billed call.

## Supported Versions

Only the deployed version at
[kiwicv.kiwicanopy.com](https://kiwicv.kiwicanopy.com) and the
latest `main` are supported. Fixes land on `main` first.

## Scope & Design Notes

Facts that matter when assessing KiwiCV's attack surface:

- **The CV lives in the browser.** The editor, the preview and
  the PDF export (Typst compiled to WebAssembly) run client-side.
  CV data leaves the browser only when the user turns on an
  optional feature: GitHub or Google Drive backup, or an AI
  feature.
- **Server-side checks are the security boundary, not the
  client.** Anything the browser sends can be forged. Access is
  enforced by Supabase Row Level Security on every table and by
  the `protect_premium_fields` trigger, which stops a user from
  writing their own account tier, Pass expiry, Stripe customer
  or email (both in
  [`supabase/schema.sql`](supabase/schema.sql)), and by the Pass
  and usage checks inside the Netlify functions in
  [`netlify/functions/`](netlify/functions/).
- **Public keys are public by design.** The Supabase URL and
  publishable key, the PostHog project key and the Sanity project
  ID ship in the client bundle. A report that one of
  them is readable is not a vulnerability; a way to use one
  beyond what Row Level Security allows is.
- **Stripe webhooks are signature-verified** before any payment
  is credited.
- **AI calls run server-side.** The browser never holds a Google
  Cloud credential; the Netlify functions call Vertex AI.
- **Third-party tokens stay in the browser.** A GitHub personal
  access token or a Google Drive refresh token that a user
  connects is stored in that browser's storage and sent
  only to GitHub or to KiwiCV's own Drive sync function.
