import posthog from 'posthog-js';

export const ANALYTICS_EVENTS = {
  // Exports & Sync
  EXPORT_MODAL_OPENED: 'export_modal_opened',
  EXPORT_PERFORMED: 'export_performed', // type: 'download' | 'cloud', formats: string[], providers?: string[]
  BACKUP_PERFORMED: 'backup_performed', // type: 'auto' | 'manual', providers: string[]
  MOBILE_PREVIEW_PDF: 'mobile_preview_pdf',
  MOBILE_PREVIEW_HTML: 'mobile_preview_html',
  PREVIEW_HTML_TAB: 'preview_html_tab',
  PREVIEW_PDF_TAB: 'preview_pdf_tab',

  // Design
  THEME_CHANGED: 'theme_changed',
  PALETTE_CHANGED: 'palette_changed',

  // AI Interactions
  AI_TOOL_SELECTED: 'ai_tool_selected',
  AI_SUGGESTION_REQUESTED: 'ai_suggestion_requested',
  AI_SUGGESTION_CONFIRMED: 'ai_suggestion_confirmed',
  AI_SUGGESTION_ERROR_RETRY: 'ai_suggestion_error_retry',
  AI_SUGGESTION_ERROR_BACK: 'ai_suggestion_error_back',
  // Its own event, not `AI_SUGGESTION_ERROR_RETRY`: this is a retry of a run
  // that SUCCEEDED, and folding it into the error funnel would misreport both.
  AI_COVER_LETTER_RETRY: 'ai_cover_letter_retry', // error: the failure code
  AI_PAYWALL_SHOWN: 'ai_paywall_shown', // Legacy/Specific
  AI_SUGGESTION_ACCEPTED: 'ai_suggestion_accepted',
  AI_SUGGESTION_DECLINED: 'ai_suggestion_declined',

  // Reorg
  AI_REORG_VIEW_TOGGLED: 'ai_reorg_view_toggled',
  AI_REORG_ACCEPTED: 'ai_reorg_accepted',
  AI_REORG_REJECTED: 'ai_reorg_rejected',

  // Language
  UI_LANGUAGE_SWITCHED: 'ui_language_switched',
  RESUME_LANGUAGE_CHANGED: 'resume_language_changed',

  // Funnel
  PAYWALL_SHOWN: 'paywall_shown',
  PAYWALL_OPTION_SELECTED: 'paywall_option_selected',
  PAYWALL_CLOSED: 'paywall_closed',
  PRICING_MODAL_OPENED: 'pricing_modal_opened',
  PRICING_MODAL_CLOSED: 'pricing_modal_closed',
  CHECKOUT_STARTED: 'checkout_started',
  PURCHASE_COMPLETED: 'purchase_completed',

  // Auth
  AUTH_MODAL_OPENED: 'auth_modal_opened',
  AUTH_MODAL_CLOSED: 'auth_modal_closed',
  SIGNUP_COMPLETED: 'signup_completed',

  // Sync
  SYNC_PROVIDER_TOGGLED: 'sync_provider_toggled',
  SYNC_PROVIDER_CONNECTED: 'sync_provider_connected',
  SYNC_RESTORE_STARTED: 'sync_restore_started',
  SYNC_RESTORE_COMPLETED: 'sync_restore_completed',
  SYNC_DELETE_STARTED: 'sync_delete_started',
  SYNC_DELETE_COMPLETED: 'sync_delete_completed',

  // CV library page. These replace `management_modal_opened`,
  // `management_locale_changed` and `management_source_changed`, whose only
  // emitters were the deleted selector modal — and `sync_restore_requested`,
  // which had no emitter at all.
  CV_LIBRARY_VIEWED: 'cv_library_viewed',
  CV_LIBRARY_REFRESHED: 'cv_library_refreshed',
  CV_LIBRARY_SCOPE_CHANGED: 'cv_library_scope_changed',
  CV_LIBRARY_FILTER_CHANGED: 'cv_library_filter_changed',

  // Account & Data Management
  ACCOUNT_DELETE_MODAL_OPENED: 'account_delete_modal_opened',
  ACCOUNT_DELETE_CANCELLED: 'account_delete_cancelled',
  ACCOUNT_DELETE_COMPLETED: 'account_delete_completed',
  DATA_CLEAR_MODAL_OPENED: 'data_clear_modal_opened',
  DATA_CLEAR_CANCELLED: 'data_clear_cancelled',
  DATA_CLEAR_COMPLETED: 'data_clear_completed',

  // Migration Funnel
  MIGRATION_DOWNLOAD_CLICKED: 'migration_download_clicked',
  MIGRATION_LINK_CLICKED: 'migration_link_clicked',
  MIGRATION_LANDED: 'migration_landed',

  // Promo
  PROMO_REDIRECTED: 'promo_redirected', // channel: string

  // Onboarding
  APP_FIRST_VISIT: 'app_first_visit',

  // Imports
  CV_IMPORTED_MANUAL: 'cv_imported_manual', // method: 'file' | 'paste', format: 'json'
  CV_IMPORTED_AI: 'cv_imported_ai', // format: 'pdf' | 'docx' | 'text', mode: string
  AI_IMPORT_ABANDONED: 'ai_import_abandoned', // format: string

  // Creation. The counterpart to the two import events, without which the
  // start-from-scratch path is invisible and no activation rate is computable.
  CV_STARTED_BLANK: 'cv_started_blank', // source: string

  // Navigation (High-value pages)
  PAGE_VIEWED: 'page_viewed',
  CONTACT_MODAL_OPENED: 'contact_modal_opened',

  // Editor navigation
  EDITOR_SECTION_SELECTED: 'editor_section_selected', // section: string
  EDITOR_RAIL_TOGGLED: 'editor_rail_toggled', // collapsed: boolean
  AI_COMPOSER_RUN: 'ai_composer_run', // mode: string, translate: boolean
  AI_REVIEW_NEXT: 'ai_review_next', // section: string, remaining: number

  // Blog
  BLOG_POST_VIEWED: 'blog_post_viewed', // slug: string, lang: string
  BLOG_POST_CLICKED: 'blog_post_clicked', // slug: string, lang: string
  BLOG_SHARE_CLICKED: 'blog_share_clicked', // platform: string, slug: string
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * Analytics service to wrap PostHog tracking calls.
 * Ensures strict anonymity and provides a clean interface for the app.
 */
class AnalyticsService {
  /**
   * Track a custom event.
   * Properties are automatically augmented with standard PostHog properties.
   */
  track(eventName: AnalyticsEvent, properties?: Record<string, unknown>) {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Track: ${eventName}`, properties);
      return;
    }

    // Only capture if initialized (handled by posthog-js internally)
    posthog.capture(eventName, properties);
  }

  /**
   * Track a page view.
   * Useful for manual pageview tracking in SPAs.
   */
  trackPageView() {
    if (import.meta.env.DEV) {
      console.log('[Analytics] Page View');
      return;
    }

    posthog.capture('$pageview');
  }

  /**
   * SAFETY: Never call identify() or alias() to maintain strict anonymity.
   * This service explicitly does not provide these methods.
   */
}

export const analytics = new AnalyticsService();
export default analytics;
