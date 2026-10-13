export const BRAND_CONFIG = {
  productName: 'KiwiCV',
  /** Marketing lockup. Footer endorsement and similar surfaces. */
  endorsedName: 'KiwiCV by KiwiCanopy',
  /**
   * The business designation, for legal disclosure.
   *
   * Deliberately separate from `endorsedName` even though both mention
   * KiwiCanopy. The Impressum's `RESPONSIBLE_TITLE` was aliased to the lockup
   * and so printed "KiwiCV by KiwiCanopy" in a § 5 DDG field, against the
   * locked decision to treat KiwiCanopy as the business designation and
   * KiwiCV as the product. One constant serving a marketing surface and a legal
   * one is how that drifted; changing the footer must not move the Impressum.
   */
  businessDesignation: 'KiwiCanopy',
  canonicalHostname: 'kiwicv.kiwicanopy.com',
  canonicalOrigin: 'https://kiwicv.kiwicanopy.com',
  legacyGatewayHostnames: ['cvcanvas.app', 'www.cvcanvas.app'],
  /**
   * The day after which the legacy hostnames stop serving the migration
   * gateway. ISO so it formats per locale rather than being written out
   * fifteen times by hand.
   *
   * The move was 2026-07-22 with a committed 90-day gateway window,
   * which lands on 2026-10-20; the owner rounded to month end on 2026-07-23.
   * The permanent-redirect step keys off the same date, so change both
   * together or the redirect starts before the notice says it will.
   */
  legacyGatewayRetirementDate: '2026-10-31',
  /**
   * Opt-in hosts that render `MigrationGateway` without owning a legacy domain.
   * Checked **before** the development branch, so this must never list an
   * address a dev server prints — `vite.config.ts` pins the dev host to
   * `127.0.0.1` (`ops/SYNC_FLOWS.md` § 10).
   */
  migrationPreviewHostnames: ['migration.localhost'],
  contact: {
    base: 'kiwicv@kiwicanopy.com',
    support: 'kiwicv-support@kiwicanopy.com',
    legal: 'kiwicv-legal@kiwicanopy.com',
    contact: 'kiwicv-contact@kiwicanopy.com',
    feedback: 'kiwicv-feedback@kiwicanopy.com',
  },
  assets: {
    symbol: '/logos/kiwicv/KiwiCV.svg',
    favicon: '/logos/kiwicv/favicon.ico',
    socialImage: '/logos/kiwicv/og.jpg',
  },
  external: {
    kofi: 'https://ko-fi.com/kiwicanopy',
    /**
     * `@kiwicv` was already taken, hence the `app` suffix. Claimed 2026-07-23,
     * replacing the former-brand handle — the last provider profile still
     * carrying the old name, which is what the Phase 4 preflight waited on.
     */
    x: 'https://x.com/kiwicvapp',
    /**
     * Sibling-product destinations. KiwiCanopy is the parent brand (apex
     * domain); KiwiDesk is a sibling product on the same subdomain pattern as
     * KiwiCV. Both went live ahead of the 4.1.0 release, which is what unblocked
     * the footer endorsement link and the Extras "family" cards.
     */
    kiwicanopy: 'https://kiwicanopy.com',
    kiwidesk: 'https://kiwidesk.kiwicanopy.com',
    /** Public source repository; the footer's license link, which is also the AGPL § 13 source offer. */
    source: 'https://github.com/KiwiCanopy/KiwiCV',
  },
} as const;

/**
 * Display names for the sibling products shown in the Extras "family" cards.
 * Brand proper nouns — kept out of the locale files (they stay verbatim in
 * every language, like theme names) and out of JSX literals so the
 * bare-literal check never sees them.
 */
export const SIBLING_PRODUCTS = [
  { name: 'KiwiCanopy', url: BRAND_CONFIG.external.kiwicanopy },
  { name: 'KiwiDesk', url: BRAND_CONFIG.external.kiwidesk },
] as const;

export const BRAND_STORAGE_KEYS = {
  uiPreferences: 'kiwicv-ui-prefs',
  flowState: 'kiwicv-flow-state',
  importModal: 'kiwicv-import-modal',
  lastSeenVersion: 'kiwicv_last_seen_version',
  /**
   * Per-device export dialog choices (destinations and formats). Post-rebrand,
   * so it has no pre-rebrand predecessor and needs no migration entry below.
   */
  exportPreferences: 'kiwicv-export-prefs',
  /**
   * The cover letter's writing sample, per device. New here, so like
   * `exportPreferences` it has no pre-rebrand predecessor and needs no migration
   * entry below.
   */
  coverLetterStyle: 'kiwicv-cover-letter-style',
  /**
   * sessionStorage: an OAuth sign-in started in this tab and no session has
   * claimed the writing sample since. New, no migration.
   */
  coverLetterStyleFreshSignIn: 'kiwicv-cover-letter-style-fresh-sign-in',
  /** sessionStorage: when the last stale-chunk reload ran. New, no migration. */
  chunkReloadAt: 'kiwicv-chunk-reload-at',
} as const;

export const BRAND_STORAGE_MIGRATIONS = {
  local: [
    {
      target: BRAND_STORAGE_KEYS.uiPreferences,
      legacy: ['cvcanvas-ui-prefs', 'cv-canvas-ui-prefs'],
    },
    {
      target: BRAND_STORAGE_KEYS.lastSeenVersion,
      legacy: ['cv_canvas_last_seen_version'],
    },
  ],
  session: [
    {
      target: BRAND_STORAGE_KEYS.flowState,
      legacy: ['cvcanvas-flow-state'],
    },
    {
      target: BRAND_STORAGE_KEYS.importModal,
      legacy: ['cvcanvas-import-modal'],
    },
  ],
} as const;

export type HostnameKind =
  'canonical' | 'legacy-gateway' | 'migration-preview' | 'development' | 'unknown';

const normalizeHostname = (hostname: string): string =>
  hostname.trim().toLowerCase().replace(/\.$/, '');

export const classifyHostname = (hostname: string): HostnameKind => {
  const normalized = normalizeHostname(hostname);

  if (normalized === BRAND_CONFIG.canonicalHostname) return 'canonical';
  if (BRAND_CONFIG.legacyGatewayHostnames.some((legacy) => legacy === normalized)) {
    return 'legacy-gateway';
  }
  if (BRAND_CONFIG.migrationPreviewHostnames.some((preview) => preview === normalized)) {
    return 'migration-preview';
  }
  // `vite.config.ts` pins the dev host to `127.0.0.1`; `[::1]` is what
  // `location.hostname` yields for IPv6 loopback.
  if (
    normalized === 'localhost' ||
    normalized.endsWith('.localhost') ||
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === '[::1]'
  ) {
    return 'development';
  }
  return 'unknown';
};

export const shouldShowMigrationGateway = (hostname: string): boolean => {
  const kind = classifyHostname(hostname);
  return kind === 'legacy-gateway' || kind === 'migration-preview';
};

export const buildCanonicalMigrationUrl = (
  pathname: string,
  search: string,
  hash: string,
): string => {
  const target = new URL(BRAND_CONFIG.canonicalOrigin);
  target.pathname = pathname;
  target.search = search;
  target.searchParams.set('from', 'migration');
  target.hash = hash;
  return target.toString();
};
