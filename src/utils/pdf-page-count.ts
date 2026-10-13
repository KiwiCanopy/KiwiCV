/**
 * How many pages a compiled PDF has, read straight out of the bytes the preview
 * already holds.
 *
 * `$typst.pdf()` hands back a `Uint8Array` and nothing else — the worker
 * protocol carries no page count (`workers/typst.worker.ts`, `hooks/useTypst.ts`),
 * so the alternatives were a protocol change or a second parse of a document we
 * have already compiled. Every PDF this pipeline produces opens with an
 * uncompressed page tree, so a regex over the first few KB answers it for free.
 *
 * ⚠️ **Anchored on `/Type /Pages`, and only the first match.** `/Count` also
 * appears under `/Type /Outlines`, where it counts bookmarks; a bare `/Count`
 * scan reads a one-entry outline as a one-page document.
 *
 * ⚠️ **The format assumption is a Typst version away from breaking.** If Typst
 * ever moves the catalogue into an object stream, this finds nothing and returns
 * `null`, and the chip renders nothing — the failure is silent by design, since a
 * wrong page count is worse than none. `pdfPageCount.compile.test.ts` compiles a
 * real fixture through the shipped WASM and fails loudly when that day comes.
 */

/** Only the header region is scanned; the page tree is the first object. */
const SCAN_BYTES = 8192;

const PAGES_COUNT = /\/Type\s*\/Pages\b[^]*?\/Count\s+(\d+)/;
const COUNT_THEN_PAGES = /\/Count\s+(\d+)[^]*?\/Type\s*\/Pages\b/;

export function readPdfPageCount(bytes: Uint8Array): number | null {
  if (!bytes || bytes.length === 0) return null;

  // Latin-1, not UTF-8: PDF syntax is ASCII and a decoder that chokes on a
  // stray high byte would give up on a perfectly readable header.
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, SCAN_BYTES));

  // `/Count` may sit either side of `/Type /Pages` inside the same dictionary,
  // and dictionary key order is not guaranteed. Both forms stop at the first
  // page tree, so neither can wander into an outline.
  const objects = head.split(/\bendobj\b/);

  for (const object of objects) {
    if (!/\/Type\s*\/Pages\b/.test(object)) continue;
    const match = PAGES_COUNT.exec(object) ?? COUNT_THEN_PAGES.exec(object);
    if (!match) continue;

    const count = Number.parseInt(match[1], 10);

    return Number.isInteger(count) && count > 0 ? count : null;
  }

  return null;
}
