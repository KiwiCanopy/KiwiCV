import { escapeTypst, sanitizeUrl } from '@/components/preview/themes/shared/typstUtils';

/**
 * Converts a bounded markdown subset into Typst inline markup:
 *
 * - `**bold**`      -> `#strong[...]`
 * - `_italic_`      -> `#emph[...]`  (underscore, not `*`, to avoid `***` ambiguity)
 * - `[text](url)`   -> `#link("...")[...]`
 *
 * Constructs nest: the content of a marker is converted recursively, so
 * `**a _b_**` and `[**x**](url)` both work.
 *
 * Security: structure is emitted ONLY by this converter. Every literal text run
 * is routed through `escapeTypst` and every URL through `sanitizeUrl`, so no
 * user-supplied character can become Typst syntax. Markers that do not form a
 * complete construct (an unclosed `**`, a `[text](url` missing its paren, an
 * empty `**bold**` body) never match and fall through to escaped literal text.
 */

// Anchored (`^`) matchers, tried in priority order at each scan position.
// The `+?` bodies are non-greedy so the nearest closing marker wins, and
// require at least one character so bare `****` / `__` stay literal.
const LINK = /^\[([^\]]*)\]\(([^)]*)\)/;
const BOLD = /^\*\*([\s\S]+?)\*\*/;
const ITALIC = /^_([\s\S]+?)_/;

/**
 * Each nested construct recurses one level, so pathological input like
 * `**_**_…` (which real cover-letter text never produces) could otherwise
 * exhaust the stack. Past this depth we stop parsing and emit the remainder as
 * escaped literal — consistent with how malformed markers already degrade.
 * Well above any legitimate nesting.
 */
const MAX_DEPTH = 32;

export function markdownToTypst(markdown: string | null | undefined, depth = 0): string {
  if (!markdown) return '';
  if (depth > MAX_DEPTH) return escapeTypst(markdown);

  let out = '';
  let literal = ''; // pending run of plain characters awaiting escape
  let i = 0;

  const flush = () => {
    if (literal) {
      out += escapeTypst(literal);
      literal = '';
    }
  };

  while (i < markdown.length) {
    const rest = markdown.slice(i);

    const link = LINK.exec(rest);
    if (link) {
      flush();
      // An empty/invalid URL (`[label]()`) would emit `#link("")`, which Typst
      // rejects ("URL must not be empty") and fails the whole PDF. Fall back to
      // the label as plain text when the sanitized URL is empty.
      const url = sanitizeUrl(link[2]);
      out += url
        ? `#link("${url}")[${markdownToTypst(link[1], depth + 1)}]`
        : markdownToTypst(link[1], depth + 1);
      i += link[0].length;
      continue;
    }

    const bold = BOLD.exec(rest);
    if (bold) {
      flush();
      out += `#strong[${markdownToTypst(bold[1], depth + 1)}]`;
      i += bold[0].length;
      continue;
    }

    const italic = ITALIC.exec(rest);
    if (italic) {
      flush();
      out += `#emph[${markdownToTypst(italic[1], depth + 1)}]`;
      i += italic[0].length;
      continue;
    }

    literal += markdown[i];
    i += 1;
  }

  flush();
  return out;
}
