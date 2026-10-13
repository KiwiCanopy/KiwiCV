import type { CVLocaleMetadata } from '@/components/preview/themes/shared/types';
import { isOngoingEndDate } from '@/utils/ongoingDate';

/**
 * The three fields these two functions read, and nothing else.
 *
 * ⚠️ **`Pick`, not the whole interface.** Taking `CVLocaleMetadata` gave the
 * unswappability the pairing needs — but it also dragged this module, the lowest-level
 * formatter in the theme layer, onto `./types` → `./sections` →
 * `@/utils/layoutMetadata`. It is `import type`, so there is no runtime cycle,
 * but it is a real compile-time edge from the bottom of the layer to the top for
 * three string fields. `Pick` preserves the swap-proofing **exactly** — the
 * property names are what make `code` and `bcp47` uninterchangeable, not the
 * interface — and every call site stays source-identical, because a full
 * `CVLocaleMetadata` is structurally assignable to it. Suggested by the
 * architect pass.
 */
export type DateLocaleFields = Pick<CVLocaleMetadata, 'code' | 'bcp47' | 'present'>;

/**
 * Format a date string (YYYY-MM-DD or YYYY-MM or YYYY) to a localized short format.
 * Uses Intl.DateTimeFormat for correct locale ordering.
 *
 * ⚠️ **One `CVLocaleMetadata`, not `(locale, bcp47)`.** The two fields mean
 * different things (`bcp47` is the `Intl.DateTimeFormat` constructor argument;
 * `code` is read *only* by the year-only branch, for the CJK `年` suffix) and they
 * were two adjacent `string` parameters **with defaults**, which is the
 * adjacent-string rule's case verbatim (`.claude/rules/testing.md`):
 * interchangeable by definition, and a swap is silent for fourteen of the fifteen
 * shipped locales (`pt` is the sole exception). Taking the object makes the swap
 * unexpressible at all eight call sites at once, and dropping the defaults makes
 * an omission `TS2554` instead of a silent `en`/`en-US`.
 *
 * ⚠️ **It does not replace `cvLocaleDateFieldProvenance.test.ts`, and reading it
 * as if it did is the error an earlier docblock made.** This closes the *call-site
 * swap*; it says nothing about which field the *body* reads, and a body that
 * built `Intl` from `code` would type-check perfectly.
 *
 * ⚠️ The mismatched pair this found was real: `useDatePicker` derived one
 * `bcp47` from `dataLocaleCode` and handed it to `formatDate` alongside
 * **`interactionLocaleCode`** at two of its three sites. With a Japanese UI over
 * an English CV that gave `2026年` for a year and English month names for a
 * month — the `年` and the month ordering disagreeing inside one picker. There
 * is no way to express that now: each code arrives with its own `bcp47`.
 */
export function formatDate(dateStr: string | null | undefined, cvLocale: DateLocaleFields): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const monthIndex = parts[1] ? parseInt(parts[1], 10) - 1 : -1;
  const day = parts[2] ? parseInt(parts[2], 10) : -1;

  if (monthIndex >= 0 && monthIndex < 12) {
    const hasDay = day > 0;
    const date = new Date(year, monthIndex, hasDay ? day : 1);
    try {
      return new Intl.DateTimeFormat(cvLocale.bcp47 || 'en-US', {
        year: 'numeric',
        month: 'short',
        ...(hasDay ? { day: 'numeric' } : {}),
      }).format(date);
    } catch {
      // Fallback if Intl fails
      return hasDay ? `${day}/${monthIndex + 1}/${year}` : `${monthIndex + 1}/${year}`;
    }
  }

  // Year only — for Japanese/Chinese add 年
  if (cvLocale.code === 'ja' || cvLocale.code === 'zh') {
    return `${parts[0]}年`;
  }
  return parts[0];
}

/**
 * Format a date range string.
 *
 * ⚠️ `presentLabel` is gone too. Both callers passed `cvLocale.present`,
 * so it was a third `string` parameter restating a field of the object beside
 * it — the "two default sets for one block agree by luck" shape on a
 * single value. It is read from the locale now, with the same `|| 'Present'`
 * `getBoundFormatters` applied.
 */
export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  cvLocale: DateLocaleFields,
): string {
  const s = formatDate(start, cvLocale);
  // ⚠️ A stored ongoing word ("Present", from an import) is open-ended too, not a
  // year — `formatDate` would print it verbatim, and as `Present年` in ja/zh.
  // Only the END date: a start date carrying the word is not "present".
  const e = isOngoingEndDate(end) ? cvLocale.present || 'Present' : formatDate(end, cvLocale);
  if (!s && !e) return '';
  if (!s) return e;
  return `${s} – ${e}`;
}
