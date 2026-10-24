# Monetization

> **Last Updated: 2026-10-12**

## Overview

KiwiCV sells **time-limited Premium Passes** and nothing else. Passes are recorded in **Supabase** (database) and sold through **Stripe** (payments).

⚠️ **This page was `CREDITS.md` until 2026-09-03.** A consumable credit balance was the other half of the model; it was removed on 2026-09-03, and AI is now reachable only with an active Pass. If you are reading older code comments, commit messages or changelog entries that mention credits, they are describing a system that no longer exists. It was an owner ruling; do not reintroduce credits without the owner.

## Monetization Model

- **Free Tier**: All basic themes and manual editing, plus unlimited PDF export. Nothing about exporting is paid.
- **No free trial** (since 2026-10-08): a new account starts without a Pass. The earlier 2-day sign-up trial is retired, and its anti-abuse email-hash table `used_freebies` with it. See [history/DECISIONS.md](../history/DECISIONS.md).
- **Premium Pass**: Full access to the AI features for a fixed duration — **1, 7, or 30 days** (`pro_1_days` / `pro_7_days` / `pro_30_days`). The 1-day Pass is the low-priced way to try the AI, standing in for the retired trial; the 90-day Pass was dropped with it (see [history/DECISIONS.md](../history/DECISIONS.md)). A Pass bought with none active runs to the end of the Berlin day after the purchase day (`add_timepass`), so even the 1-day Pass lasts at least 24 hours. The amounts live once, as `priceCents` in `src/components/monetization/pricing/catalog.tsx`, and are formatted per locale (`formatPrice`); Stripe charges by lookup key, so a price change is two edits, the catalog and the Stripe price. Each card shows its price per day (`formatPerDay`) — never a crossed-out "old" price or a % badge: those read as a former price under PAngV §11, and these Passes never cost more. The one highlighted card (`recommended: true`, the 7-day Pass) says **Recommended**, never "Most Popular": a popularity claim is a statement of fact about sales, and an unbacked one is misleading advertising under UWG §5. See `src/components/monetization/pricing/catalog.tsx`.
- **Fair use, not unlimited**: a Pass is subject to `AI_PRO_DAILY_LIMIT` (200) requests per Berlin day. The allowance resets; there is no way to buy past it, which is why the paywall's `limit` mode offers no purchase action.
- **Stacking**: buying a second Pass while one is active extends the existing period rather than replacing it (`add_timepass`).

## Technical Implementation

- **Payment Processor**: Stripe.
- **Checkout**: `netlify/functions/create-checkout.mjs`. It resolves a Stripe price by **lookup key** and rejects any key that does not start with `pro_` — an unrecognised key is a 400 rather than a session that fulfillment could never complete.
- **Fulfillment (dual strategy)**:
  - **Webhook (push)**: `netlify/functions/stripe-webhook.mjs` listens for `checkout.session.completed`.
  - **Verification fallback (pull)**: `netlify/functions/verify-stripe-session.mjs` lets the frontend trigger fulfillment by checking session status directly with Stripe. This keeps deploy previews and delayed-webhook environments working.
- **Shared logic**: both paths use the idempotent `fulfillOrder` in `netlify/functions/lib/stripe-fulfillment.mjs`, which accepts `type === 'timepass'` only and calls the `fulfill_stripe_order` RPC.
- **Pass expiry**: stored as `profiles.premium_until`. There is no `is_premium` column — `isPremium` is computed client-side in `AuthProvider.tsx` as `premium_until > now()`.
- **Frontend sync**: `PurchaseSuccessHandler.tsx` orchestrates the manual verification and the polling fallback so the UI reflects the new expiry.
- ⚠️ **Two API versions are in play, and they move separately.** The SDK (`stripe` 23) pins
  `2026-09-30.endive` for our own requests — none of the three functions passes `apiVersion`, so a
  major SDK bump silently moves checkout create/retrieve. The webhook endpoint's version, set in
  the Stripe dashboard (Workbench → Webhooks), shapes the events we receive: `2026-03-25.dahlia`
  as of 2026-10-24. From events we read only `type`, `id`, `payment_status` and `metadata`, the same in both; our own requests also read the session `url` and the price `id`.
  Measured on the 23 bump in test mode: the real `create-checkout` handler for all three lookup
  keys, `sessions.retrieve`, and signature verification through `constructStripeWebhookEvent`.

## What a Pass Unlocks

Every AI capability, all of it gated by the same two conditions (active Pass, daily allowance not spent):

- **Full AI resume match**: analysing a job description and rewriting the whole résumé.
- **Section and item optimization**: rewriting one section or one entry.
- **AI translation** of a résumé into another supported language.
- **AI CV import**: parsing an uploaded PDF/DOCX into the schema.

## Error Handling

The two conditions produce two distinct rejections, and the frontend maps each to a different paywall mode:

- **`PREMIUM_REQUIRED`** — no active Pass. `InsufficientPremiumAccessModal` in `generic` mode, offering the Pass CTA.
- **`LIMIT_REACHED`** — Pass active, daily allowance spent. The same modal in `limit` mode, which deliberately offers **no** action: another Pass does not restore a spent allowance, so the honest answer is to wait for the reset.

Both are thrown by `netlify/functions/improve-cv-background.mjs` and `parse-cv-background.mjs` and classified there as business errors (not logged as faults). The strings live once per side as `AI_PAYWALL_CODES` (`src/constants/ai.ts` and `netlify/functions/lib/ai/constants.js`, paired by `npm run ai:check-sync`), and `useAIJobRun` hands either to the dialog's `onRefused` — the improve dialog picks the mode from the code, the import dialog from `isDailyLimitReached` after a usage refresh. `src/utils/ai.ts`'s `hasAIAccess` checks the same two conditions client-side so a guaranteed rejection surfaces as the paywall instead of a failed job.

- **Payment failures**: handled by Stripe's own UI; the app receives status via webhook or the pull fallback.

## Database Schema

`supabase/schema.sql` owns it, and `.claude/rules/database.md` carries what binds when you
change it. Deliberately not restated here: the columns were
written out on this page as well until 2026-09-03, and the credits removal swept one copy
and not the other, leaving the two pages contradicting each other about the same enum.
