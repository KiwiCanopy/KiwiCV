# Anonymous Analytics (PostHog)

> **Last Updated: 2026-10-11**

This document outlines the privacy-first analytics implementation using PostHog.

## Gating

Analytics is **off unless `VITE_POSTHOG_KEY` is set** — `PostHogProvider.tsx:6,8` returns children unwrapped when the key is missing, in production as much as in development. If events are not arriving, check the variable before debugging anything else. See [ops/DEPLOYMENT.md](../ops/DEPLOYMENT.md).

## Privacy Principles

- **No Cookies**: Configured with `persistence: 'memory'` and `cookieless_mode: 'always'`.
- **Anonymity**: No Personally Identifiable Information (PII) is captured. IP addresses are hashed server-side within PostHog — a setting in the PostHog project (verified by the owner, 2026-10-11), not in this repo.
- **Session Recording**: Disabled (`disable_session_recording: true`) to ensure maximum privacy.
- **No Identity Tracking**: `identify()` and `alias()` are strictly avoided.
- **Reverse Proxy (First-Party)**: All data is routed through `/api/v1/sync/*` on our own domain via a Netlify Reverse Proxy (configured in `netlify.toml`). The `api_host` is hardcoded as `'/api/v1/sync'` in `PostHogProvider.tsx`. This keeps all analytics traffic first-party, on our own domain, and needs no external host configuration.
  - Proxy Target: `https://eu.i.posthog.com`
- **Development Mode**: In local development (`import.meta.env.DEV`), PostHog is not initialized and tracking is disabled. Events are logged to the console instead for debugging purposes.

## Event Schema

All events are centrally managed in [analytics.ts](../../../src/services/analytics.ts) using the `ANALYTICS_EVENTS` constant. This ensures type safety and a single source of truth.

**`ANALYTICS_EVENTS` is the authority — read it, don't trust this list to be complete.** The categories below are the ones with behaviour worth explaining; the constant also carries Auth (`AUTH_MODAL_*`, `SIGNUP_COMPLETED`), Imports (`CV_IMPORTED_MANUAL`, `CV_IMPORTED_AI`, `AI_IMPORT_ABANDONED`), Creation (`CV_STARTED_BLANK` — the counterpart that makes an activation rate computable), Onboarding (`APP_FIRST_VISIT`), Account & Data deletion (`ACCOUNT_DELETE_*`, `DATA_CLEAR_*`), Blog (`BLOG_POST_VIEWED`, `BLOG_POST_CLICKED`, `BLOG_SHARE_CLICKED`), Reorg (`AI_REORG_*`), preview/mobile tab events, `PAGE_VIEWED`, and `CONTACT_MODAL_OPENED`.

### Key Tracking Categories:

- **Exports & Backups**: Workflow-based tracking for success actions.
  - `EXPORT_MODAL_OPENED`: Entry into the unified Export/Cloud Hybrid modal.
  - `EXPORT_PERFORMED`: One per Export-dialog run, fired only from `useExportRun.ts` (`type: 'export'`). Includes `formats`, `providers` (the destinations that succeeded), `language`, `themeId`, `paletteId`, and — for two-column themes only — `sidebarPosition`.
  - `BACKUP_PERFORMED`: Tracks background "Save" actions to distinguish them from user-initiated exports.
- **Cloud Sync & Management**: Tracks the lifecycle of cloud data.
  - `MANAGEMENT_MODAL_OPENED`: Entry into the backup history selector.
  - `MANAGEMENT_LOCALE_CHANGED` / `MANAGEMENT_SOURCE_CHANGED`: Interactions with filters.
  - `SYNC_RESTORE` / `SYNC_DELETE`: Started and completed events for cloud maintenance actions.
- **Design**: Theme and palette changes.
- **AI Interactions**: Enriched tracking schema to support granular filtering by scope (CV level, section level, and item level).
  - All AI events (`AI_SUGGESTION_REQUESTED`, `AI_SUGGESTION_CONFIRMED`, `AI_SUGGESTION_ACCEPTED`, `AI_SUGGESTION_DECLINED`, etc.) are enriched with:
    - `ai_scope`: `'cv' | 'section' | 'item'` (grouping level)
    - `ai_section_key`: section name (e.g. `'work'`, `'education'`) or `null`
    - `ai_target`: sanitized suggestion path (e.g. `'item:work'`, with the specific item UUID `:vId` stripped to keep targets perfectly aggregatable)
  - `AI_SUGGESTION_ACCEPTED`: Tracked when a user accepts AI suggestions inline or via full modal confirmation.
  - `AI_SUGGESTION_DECLINED`: Tracked when a user declines suggestions inline or via full modal confirmation.
  - `AI_SUGGESTION_ERROR_RETRY` / `AI_SUGGESTION_ERROR_BACK`: Tracked when the user retries generation from an error state or goes back, enriched with the prompt mode.
- **Migration Funnel**: Tracks legacy domain exit (`migration_download_clicked`, `migration_link_clicked`) and new domain entry (`migration_landed` via `?from=migration`).
- **Promo Redirects**: Tracks incoming traffic from specific channels via `/promo/:channel` (`promo_redirected`).
- **Language**: Manual switches for UI language and CV content locale.
- **Monetization Funnel**: Paywall views (`PAYWALL_*`), pricing modal interactions (`PRICING_MODAL_*`, `PRICING_TAB_SWITCHED`, `PRICING_MOBILE_BLOCKED`), `CHECKOUT_STARTED` when the redirect to Stripe is requested, and `PURCHASE_COMPLETED` on fulfilment.

## Implementation Details

The `AnalyticsService` singleton (`src/services/analytics.ts`) acts as the central interface:

```typescript
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';

// Example usage (from useExportRun.ts)
analytics.track(ANALYTICS_EVENTS.EXPORT_PERFORMED, {
  type: 'export',
  formats: ['json', 'pdf'],
  providers: ['zip', 'google_drive'],
  themeId: 'lunar',
});
```

## Adding New Events

See `.claude/rules/analytics.md`, which loads when you edit
`src/services/analytics.ts`. It carries the no-PII rule, why `ai_target` strips
the item UUID, and why the privacy configuration is load-bearing rather than a
leftover default.

This page used to end with "update this documentation" as step 3 — the
instruction that reliably does not happen, and the reason the binding parts
moved.
