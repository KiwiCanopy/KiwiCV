import type { ResumeData } from '@/types/resume';

/** Formats `date` against a `{date-FORMAT}` pattern such as `YYYY-MM-DD`. */
const formatDate = (format: string, date: Date): string =>
  format
    .replace(/YYYY/g, String(date.getFullYear()))
    .replace(/MM/g, String(date.getMonth() + 1).padStart(2, '0'))
    .replace(/DD/g, String(date.getDate()).padStart(2, '0'))
    .replace(/HH/g, String(date.getHours()).padStart(2, '0'))
    .replace(/mm/g, String(date.getMinutes()).padStart(2, '0'))
    .replace(/ss/g, String(date.getSeconds()).padStart(2, '0'));

/**
 * Expands the export filename pattern the user edits in Settings.
 *
 * Every token is substituted in a **single pass**, and every value goes in via a
 * function replacement. Both matter, because the values are user data:
 *
 * - A sequence of `String.replace` calls with *string* replacements expands
 *   `$&`, `` $` ``, `$'` and `$$`, so a `basics.name` of `A$&B` used to
 *   re-insert the very `{name}` token it was replacing.
 * - A sequence of passes also re-scans what earlier passes wrote, so a
 *   `basics.name` of `{lang}` used to come out as the locale rather than as the
 *   literal text the user typed.
 */
export const generateFilename = (pattern: string, resume: ResumeData): string => {
  const filename = pattern.trim() || '{date-YYYYMMDD}_{name}';
  const now = new Date();

  const values: Record<string, string> = {
    '{name}': (resume.basics.name || 'Resume').replace(/\s+/g, '_'),
    '{theme}': resume.meta.theme?.name || 'standard',
    '{lang}': resume.meta.theme?.locale || 'en',
    // The UI documents `{date-FORMAT}`; bare `{date}` is a legacy fallback.
    '{date}': formatDate('YYYYMMDD', now),
  };

  return filename.replace(
    /{date-([^}]+)}|{name}|{theme}|{lang}|{date}/g,
    (token, dateFormat?: string) =>
      dateFormat === undefined ? values[token] : formatDate(dateFormat, now),
  );
};
