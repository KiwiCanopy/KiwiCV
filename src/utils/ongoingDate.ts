/**
 * The words that mean "still running" where a date is expected. One inventory:
 * `normalizeDate` preserves them, `isValidDate` accepts them, the sanitizer
 * declines to warn about them, `parseDateString` sorts them as open-ended, and
 * the CV renderers print them as the locale's own "present".
 *
 * ⚠️ A leaf module: the theme layer's date formatter imports it, and must not
 * pull `@/utils/validation`'s dependencies in with it.
 */
export const ONGOING_DATE_WORDS = ['present', 'now', 'current', 'today', 'auto'] as const;

const ONGOING = new Set<string>(ONGOING_DATE_WORDS);

/** Whether a stored date is one of the ongoing words, in any case, ignoring surrounding space. */
export const isOngoingDateWord = (value: string | null | undefined): boolean =>
  typeof value === 'string' && ONGOING.has(value.trim().toLowerCase());

/**
 * Whether an end date means "still running": absent, blank, or one of the ongoing
 * words. ⚠️ `typeof`, not `?.trim()` — a stored field is arbitrary JSON.
 */
export const isOngoingEndDate = (end: string | null | undefined): boolean =>
  typeof end !== 'string' || !end.trim() || isOngoingDateWord(end);
