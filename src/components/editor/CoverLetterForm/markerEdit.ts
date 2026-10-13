/**
 * Pure helpers for splicing inline markdown markers around a textarea selection.
 *
 * The cover-letter body stores the same bounded markdown subset the shared
 * tokenizer understands (`**bold**`, `_italic_`, `[text](url)`), so the toolbar
 * never touches Typst — it only edits marker characters in the plain buffer.
 * Keeping the string surgery here (framework-free, no DOM) makes the toggle
 * behaviour unit-testable and keeps the React component thin.
 */

export interface MarkerEdit {
  /** The full buffer after the edit. */
  text: string;
  /** Selection to restore afterwards, in the new buffer's coordinates. */
  selectionStart: number;
  selectionEnd: number;
}

/**
 * True when the current selection is already wrapped in `marker` — either the
 * markers sit just inside the selection (`|**bold**|`) or just outside it
 * (`**|bold|**`). Collapsed carets count as active only when bracketed outside.
 */
export function isSymmetricMarkerActive(
  text: string,
  start: number,
  end: number,
  marker: string,
): boolean {
  const len = marker.length;
  const selected = text.slice(start, end);

  const insideWrapped =
    selected.length >= len * 2 &&
    selected.startsWith(marker) &&
    selected.endsWith(marker) &&
    // `**` alone (len*2 exactly) is an empty body, not an active marker.
    selected.length > len * 2;

  const outsideWrapped =
    text.slice(start - len, start) === marker && text.slice(end, end + len) === marker;

  return insideWrapped || outsideWrapped;
}

/**
 * Toggle a symmetric marker (`**`, `_`) around the selection. Wrapping when
 * absent, unwrapping when present, so a second press — or a repeated shortcut —
 * cleanly removes the markers it added.
 */
export function toggleSymmetricMarker(
  text: string,
  start: number,
  end: number,
  marker: string,
): MarkerEdit {
  const len = marker.length;
  const selected = text.slice(start, end);

  // Markers inside the selection: `|**bold**|` -> `|bold|`.
  if (selected.length > len * 2 && selected.startsWith(marker) && selected.endsWith(marker)) {
    const inner = selected.slice(len, selected.length - len);
    return {
      text: text.slice(0, start) + inner + text.slice(end),
      selectionStart: start,
      selectionEnd: start + inner.length,
    };
  }

  // Markers just outside the selection: `**|bold|**` -> `|bold|`.
  if (text.slice(start - len, start) === marker && text.slice(end, end + len) === marker) {
    return {
      text: text.slice(0, start - len) + selected + text.slice(end + len),
      selectionStart: start - len,
      selectionEnd: end - len,
    };
  }

  // Not marked yet: wrap the selection (or drop an empty pair at the caret).
  return {
    text: text.slice(0, start) + marker + selected + marker + text.slice(end),
    selectionStart: start + len,
    selectionEnd: end + len,
  };
}

/**
 * Splice a `[text](url)` link around the selection. Uses the selected text as
 * the link label, or `fallbackLabel` when the caret is collapsed, and leaves
 * the label selected so it can be typed over.
 */
export function insertLink(
  text: string,
  start: number,
  end: number,
  url: string,
  fallbackLabel: string,
): MarkerEdit {
  const label = text.slice(start, end) || fallbackLabel;
  const snippet = `[${label}](${url})`;
  return {
    text: text.slice(0, start) + snippet + text.slice(end),
    // Select just the label so the user lands back on their words, not the URL.
    selectionStart: start + 1,
    selectionEnd: start + 1 + label.length,
  };
}
