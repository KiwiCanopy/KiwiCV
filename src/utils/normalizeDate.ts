/**
 * Date parsing for resume date fields: what a typed date means, and which shapes the
 * sanitizer accepts.
 *
 * ⚠️ A leaf module, like `@/utils/ongoingDate`: the editor's date fields and sort key
 * import it, and must not pull `@/utils/validation`'s sanitizer graph in with it.
 */
import { isOngoingDateWord } from '@/utils/ongoingDate';

/**
 * What `normalizeDate` emits: `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. Exported so a
 * reader of that output tests for the same shape the writer produces — the
 * capture groups are what makes an ISO date orderable without a `Date`.
 */
export const ISO_DATE_PATTERN = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

/** `MM/YYYY`, `MM.YYYY`, `MM-YYYY` — month first; the four-digit group is the year. */
const MONTH_YEAR_SHAPE = String.raw`(\d{1,2})[./-](\d{4})`;
const MONTH_YEAR_PATTERN = new RegExp(`^${MONTH_YEAR_SHAPE}$`);
/** The same shape inside a longer string, for the `Date` fallback's precision guess. */
const MONTH_YEAR_ANYWHERE = new RegExp(MONTH_YEAR_SHAPE);

/** The month of a month-and-year string, or `null` for any other shape or a month outside 1–12. */
const parseMonthYear = (trimmed: string): { month: number; year: string } | null => {
  const match = MONTH_YEAR_PATTERN.exec(trimmed);
  if (!match) return null;
  const month = parseInt(match[1], 10);
  return month >= 1 && month <= 12 ? { month, year: match[2] } : null;
};

/** `DD.MM.YYYY`, `DD/MM/YY`, `DD-MM-YYYY` — day first, any of the three separators. */
const DAY_MONTH_YEAR_SHAPE = String.raw`(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})`;
const DAY_MONTH_YEAR_PATTERN = new RegExp(`^${DAY_MONTH_YEAR_SHAPE}$`);
const DAY_MONTH_YEAR_ANYWHERE = new RegExp(DAY_MONTH_YEAR_SHAPE);

/**
 * A two-digit year below this is 20YY, otherwise 19YY — the window V8's `Date` once
 * applied, so a typed `DD.MM.YY` lands in the century it always did.
 */
const TWO_DIGIT_YEAR_PIVOT = 50;

/** Whether the day exists in that month of that year. */
const isCalendarDay = (year: number, month: number, day: number): boolean => {
  if (month < 1 || month > 12 || day < 1) return false;
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return day <= [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
};

/**
 * The ISO date of a day-month-year string, or `null` for any other shape, a three-digit year,
 * or a day that does not exist in that month — never rolled over into the next.
 */
const parseDayMonthYear = (trimmed: string): string | null => {
  const match = DAY_MONTH_YEAR_PATTERN.exec(trimmed);
  if (!match || match[3].length === 3) return null;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  let year = parseInt(match[3], 10);
  if (match[3].length === 2) year += year < TWO_DIGIT_YEAR_PIVOT ? 2000 : 1900;
  if (!isCalendarDay(year, month, day)) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`;
};

/**
 * The ISO date of a day-month-year string, or of an unambiguous US-order one (second field
 * above 12, `12/25/2019`); `null` for any other shape or a date that does not exist.
 */
const parseNumericDate = (trimmed: string): string | null => {
  const dayFirst = parseDayMonthYear(trimmed);
  if (dayFirst || !DAY_MONTH_YEAR_PATTERN.test(trimmed)) return dayFirst;
  const [first, second, year] = trimmed.split(/[./-]/);
  return Number(second) > 12 ? parseDayMonthYear(`${second}.${first}.${year}`) : null;
};

/**
 * Normalizes a date string into YYYY-MM-DD, YYYY-MM or YYYY format if possible.
 */
export const normalizeDate = (dateStr: string | null | undefined): string => {
  if (typeof dateStr !== 'string' || !dateStr.trim()) return '';

  const trimmed = dateStr.trim();

  // Preserve "Present" variants exactly as entered
  if (isOngoingDateWord(trimmed)) return trimmed;

  /**
   * ⚠️ Already normalized — return it untouched. Round-tripping it through
   * `Date` read the date-only form as UTC and re-emitted it from LOCAL getters,
   * which walked stored dates backwards, compounding.
   *
   * ⚠️ No *reachable* caller passes a timestamp form. `2019-03-01T00:00:00Z`
   * would still shift below — `isValidDate` rejects that shape and the sanitizer
   * blanks it first, which is the only reason it is inert.
   */
  if (ISO_DATE_PATTERN.test(trimmed)) return trimmed;

  const hasSeparator = /[./-]/.test(trimmed);
  const hasMonthName = /[a-zA-Z]{3,}/.test(trimmed);
  const isFourDigits = /^\d{4}$/.test(trimmed);

  if (!hasSeparator && !hasMonthName && !isFourDigits) return trimmed;

  // `Date` cannot parse a month-and-year string, so it never reaches the parser.
  const monthYear = parseMonthYear(trimmed);
  if (monthYear) return `${monthYear.year}-${String(monthYear.month).padStart(2, '0')}`;

  // ⚠️ A day-month-year string never reaches `Date`: it rolls an impossible day over and reads
  // `DD.MM.YY` month-first. One it cannot express is kept as typed.
  // Only the unambiguous US order (second field above 12, `12/25/2019`) is read month-first.
  if (DAY_MONTH_YEAR_PATTERN.test(trimmed)) return parseNumericDate(trimmed) ?? trimmed;

  const date = new Date(trimmed);

  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const hasDay =
      DAY_MONTH_YEAR_ANYWHERE.test(trimmed) || /\d{4}[./-]\d{1,2}[./-]\d{1,2}/.test(trimmed);
    const hasMonth =
      hasMonthName || MONTH_YEAR_ANYWHERE.test(trimmed) || /\d{4}[./-]\d{1,2}/.test(trimmed);

    if (hasDay) return `${year}-${month}-${day}`;
    if (hasMonth) return `${year}-${month}`;
    if (isFourDigits) return `${year}`;
  }

  return trimmed;
};

/**
 * Checks if a date string is in a standard format.
 * Now acknowledges that common user inputs are "valid enough" to not show a red error,
 * even if they aren't the final ISO format yet.
 */
export const isValidDate = (dateStr: string): boolean => {
  // Whitespace-only is blank, as the sanitizer already treats it.
  const trimmed = dateStr ? dateStr.trim() : '';
  if (!trimmed) return true;

  if (ISO_DATE_PATTERN.test(trimmed)) return true;

  // Day/Month/Year: DD.MM.YYYY, DD/MM/YY, etc. Shape-only for the same reason as month-year
  // below: an impossible day or month already sits in stored CVs.
  if (DAY_MONTH_YEAR_PATTERN.test(trimmed)) return true;

  // Month/Year: MM/YYYY, MM.YYYY or MM-YYYY. Stays shape-only: rehydration blanks whatever this
  // rejects, and an out-of-range month already sits in stored CVs.
  if (MONTH_YEAR_PATTERN.test(trimmed)) return true;

  // Words
  if (isOngoingDateWord(trimmed)) return true;

  return false;
};

/**
 * Whether the editor leaves the date unflagged: blank, an ongoing word, or a date
 * `isValidDate` accepts whose `normalizeDate` result is an ISO date that exists on the calendar.
 * Stricter than `isValidDate`, which stays shape-only because stored CVs hold impossible dates.
 */
export const isExpressibleDate = (dateStr: string | null | undefined): boolean => {
  if (typeof dateStr !== 'string') return !dateStr;
  const trimmed = dateStr.trim();
  if (!trimmed || isOngoingDateWord(trimmed)) return true;
  if (!isValidDate(trimmed)) return false;

  const iso = ISO_DATE_PATTERN.exec(normalizeDate(trimmed));
  if (!iso) return false;
  return !iso[2] || isCalendarDay(Number(iso[1]), Number(iso[2]), Number(iso[3] ?? 1));
};
