import { createRoot } from 'react-dom/client';

import { ResumeHTML } from '@/components/preview/ResumeHTML';
import { type ResumeData } from '@/types/resume';

/**
 * How long to wait for React when animation frames are not being served.
 *
 * Only ever reached in a hidden document, so it costs nothing on the path a
 * user watches: two frames land in ~33ms and settle the race long before this.
 */
const RENDER_FALLBACK_MS = 250;

/**
 * Runs `callback` once React has rendered and its effects have settled.
 *
 * Two nested animation frames when the document is visible — the original
 * heuristic, and the one that actually observes a paint. A timer as the
 * fallback, because `requestAnimationFrame` is **suspended**, not throttled, in
 * a hidden document: without this the callback is never reached at all.
 *
 * Whichever arrives first wins and the other is ignored, so the callback runs
 * exactly once either way.
 */
const afterRender = (callback: () => void) => {
  let settled = false;
  const run = () => {
    if (settled) return;
    settled = true;
    callback();
  };

  requestAnimationFrame(() => requestAnimationFrame(run));
  setTimeout(run, RENDER_FALLBACK_MS);
};

/**
 * Tab icon for the exported document: a neutral person silhouette, inlined.
 * Never the KiwiCV mark — see `code/DESIGN_LANGUAGE.md` § Exported documents.
 *
 * ⚠️ Two formats on purpose. A `blob:` document gets no `/favicon.ico` fallback, and
 * SVG-only `rel="icon"` is ignored by some engines (Safari); the PNG is the floor.
 */
const EXPORT_TAB_ICON_SVG =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%236B7280%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%228%22%20r%3D%224%22%2F%3E%3Cpath%20d%3D%22M4%2021a8%208%200%200%201%2016%200Z%22%2F%3E%3C%2Fsvg%3E';
const EXPORT_TAB_ICON_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAy0lEQVR42u2VwQ2DMAxFM0JGYQSPkBFy760TeBNGYYSMkBEyAg2SkVAKlR1qKhUf3iUI/Xewv93jie6XOBMwgc4ffSVWkIj0dolAqJTK3FDom6oA7AS3gKZAZghkLYGBEb4yaAiAQAD+UsAdTP/eNqgNITIEULsHxg/h41VNuDRf2gQnerNjdA8BT3uODdBzEaWDNzHWcJIMJLcBs6AFt0cJzgrEjuCW2CsQvhC+EqQCntn7XMrRgJ7pfCkoEUgKAkkiMCthVWwCb7wAMCVfGVQHTJAAAAAASUVORK5CYII=';

/**
 * Generates a full HTML document string for the given resume data.
 * This function renders the ResumeHTML component to a string within a virtual container.
 */
export const generateThemedHTML = async (
  resume: ResumeData,
  tabTitle?: string,
): Promise<string> => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  document.body.appendChild(container);
  const root = createRoot(container);

  return new Promise<string>((resolve) => {
    root.render(<ResumeHTML data={resume} />);

    // Wait for React to render and its effects to settle, then read the markup.
    //
    // ⚠️ Two animation frames alone **hang forever** here. Browsers suspend
    // `requestAnimationFrame` entirely in a hidden document, and this function's
    // main caller has already hidden it: `openHTMLPreview` opens the preview tab
    // *before* generating, so by the time we get here the KiwiCV tab is in the
    // background and no frame will ever be served. On a phone that is every
    // single HTML preview — the PDF path was unaffected only because it never
    // touches rAF, which is exactly how the two came to behave differently.
    //
    // So the frames race a timer. On a visible tab two frames land in ~33ms and
    // win, keeping the original behaviour; on a hidden one the timer is the only
    // thing that fires, and timers still run there (throttled, never suspended).
    afterRender(() => {
      const content = container.innerHTML;
      root.unmount();
      document.body.removeChild(container);

      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((el) => el.outerHTML)
        .join('\n');

      const html = `<!DOCTYPE html>
<html lang="${resume.meta.theme.locale || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base href="${window.location.origin}/">
  <title>${tabTitle || resume.basics.name || 'Resume'}</title>
  <link rel="icon" type="image/svg+xml" href="${EXPORT_TAB_ICON_SVG}">
  <link rel="icon" type="image/png" sizes="32x32" href="${EXPORT_TAB_ICON_PNG}">
  <!-- No web-font <link> here, deliberately. The \`styles\` capture above
       carries every @font-face the app declares in \`tokens.css\`, and their
       \`url('/fonts/…')\` sources are root-relative, so the \`<base>\` tag on the
       line above resolves them back to this origin. The export therefore renders
       in the same faces as the preview, from the same files.

       What used to sit here was a Google Fonts request for Inter, Merriweather,
       Roboto and Source Sans 3. Three of those four are referenced nowhere in
       the codebase, and Inter was already arriving through \`styles\` — so every
       opened résumé made a third-party request that changed nothing it
       rendered. It also omitted the two families that actually needed help at
       the time, Lora and JetBrains Mono, which is the export half of the same
       bug. -->
  ${styles}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } 
    body { -webkit-font-smoothing: antialiased; }
  </style>
</head>
<body>${content}</body>
</html>`;
      resolve(html);
    });
  });
};
