/**
 * Strips markup and collapses whitespace.
 *
 * Structured-data values must be plain text — Google reads the JSON, not the
 * rendered page, so an `<a href>` left in an FAQ answer is shown verbatim in
 * the snippet. FAQ `q1` carries anchor markup and `\n\n` breaks.
 */
export const toPlainText = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
