/**
 * Application metadata: facts about where a CV version was sent, kept beside
 * the resume in a cloud backup and never inside it (#54).
 *
 * This module is the only place that knows the envelope key, the Drive
 * `appProperties` encoding and the GitHub cache. `ResumeData`, the store, the
 * AI payload and the sync hashes never see the link.
 */

/** The top-level backup JSON key. Outside `ResumeData`, so never in `meta`. */
export const APPLICATION_KEY = 'application';

export interface ApplicationMeta {
  postingUrl: string;
}

/** Long enough for any tracking-laden job board link, short enough for 18 Drive slots. */
export const MAX_POSTING_URL_LENGTH = 2048;

/**
 * The URL as it will be saved, or `null` when there is nothing valid to save.
 * A missing scheme becomes `https://`; anything but http(s) is rejected.
 */
export function normalizePostingUrl(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (!url.hostname.includes('.')) return null;
  return url.href.length <= MAX_POSTING_URL_LENGTH ? url.href : null;
}

/** Adds the envelope key to a serialized backup. A `null` link returns it unchanged. */
export function wrapBackupJson(json: string, postingUrl: string | null): string {
  if (!postingUrl) return json;
  const application: ApplicationMeta = { postingUrl };
  return JSON.stringify({ ...JSON.parse(json), [APPLICATION_KEY]: application }, null, 2);
}

/**
 * Splits a downloaded backup into the resume and its link.
 *
 * Must run before `sanitizeResumeData`, which would otherwise keep the key as
 * pass-through and write it back into every later export. A value that is not
 * our shape is left in place: it belongs to some other tool.
 */
export function peelBackup<T>(data: T): { data: T; postingUrl: string | null } {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { data, postingUrl: null };
  const record = data as Record<string, unknown>;
  const application = record[APPLICATION_KEY];
  if (!application || typeof application !== 'object') return { data, postingUrl: null };
  const postingUrl = normalizePostingUrl(
    String((application as Partial<ApplicationMeta>).postingUrl ?? ''),
  );
  if (!postingUrl) return { data, postingUrl: null };
  const { [APPLICATION_KEY]: _peeled, ...rest } = record;
  return { data: rest as T, postingUrl };
}

// --- Google Drive appProperties ---------------------------------------------

/**
 * Drive caps one property at 124 bytes of key plus value, so the URL is split
 * over numbered slots. `normalizePostingUrl` percent-encodes it, so it is
 * ASCII and a character is a byte.
 */
const DRIVE_PROPERTY_PREFIX = 'kcvUrl';
const DRIVE_PROPERTY_BYTES = 124;
const DRIVE_CHUNK = DRIVE_PROPERTY_BYTES - `${DRIVE_PROPERTY_PREFIX}00`.length;
export const DRIVE_URL_SLOTS = Math.ceil(MAX_POSTING_URL_LENGTH / DRIVE_CHUNK);

/**
 * Every slot, the unused ones `null`: Drive deletes a property set to `null`,
 * so an overwrite with a shorter link, or none, leaves no stale tail.
 */
export function toDriveAppProperties(postingUrl: string | null): Record<string, string | null> {
  const properties: Record<string, string | null> = {};
  for (let slot = 0; slot < DRIVE_URL_SLOTS; slot++) {
    const chunk = postingUrl?.slice(slot * DRIVE_CHUNK, (slot + 1) * DRIVE_CHUNK);
    properties[`${DRIVE_PROPERTY_PREFIX}${slot}`] = chunk || null;
  }
  return properties;
}

export function fromDriveAppProperties(
  properties: Record<string, string> | null | undefined,
): string | null {
  if (!properties) return null;
  let joined = '';
  for (let slot = 0; slot < DRIVE_URL_SLOTS; slot++) {
    const chunk = properties[`${DRIVE_PROPERTY_PREFIX}${slot}`];
    if (!chunk) break;
    joined += chunk;
  }
  return normalizePostingUrl(joined);
}

// --- GitHub cache -----------------------------------------------------------

/**
 * Per device, keyed by blob sha: a rename keeps the sha, a deleted file never
 * matches again, and an overwrite misses once and costs one lazy read.
 */
export const GITHUB_POSTING_URL_CACHE_KEY = 'kiwicv_github_posting_urls';
const GITHUB_CACHE_MAX_ENTRIES = 500;

type ShaCache = Record<string, string>;

function readShaCache(): ShaCache {
  try {
    const parsed = JSON.parse(localStorage.getItem(GITHUB_POSTING_URL_CACHE_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/** `undefined` is a miss; `null` is a cached "this version has no link". */
export function readCachedPostingUrl(sha: string): string | null | undefined {
  const cache = readShaCache();
  if (!Object.hasOwn(cache, sha)) return undefined;
  return cache[sha] || null;
}

export function writeCachedPostingUrl(sha: string, postingUrl: string | null): void {
  const cache = readShaCache();
  delete cache[sha];
  cache[sha] = postingUrl ?? '';
  // Insertion order is age: the oldest entries fall off first.
  const entries = Object.entries(cache).slice(-GITHUB_CACHE_MAX_ENTRIES);
  try {
    localStorage.setItem(GITHUB_POSTING_URL_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Storage full or blocked: the row falls back to a lazy read next time.
  }
}
