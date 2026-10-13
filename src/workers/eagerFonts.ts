import { loadFonts } from '@myriaddreamin/typst.ts/options.init';

/**
 * Faces fetched up front by the Typst worker. Together roughly 1 MB —
 * everything a Latin-script CV needs to render. The two Noto Sans CJK faces are
 * registered lazily instead; see `typst.worker.ts`.
 *
 * Extracted from the worker so the compile smoke test
 * (`preview/__tests__/typstCompile.test.ts`) can load the *same* faces without
 * importing the worker itself, whose module-level `?url` WASM imports only
 * resolve under Vite.
 *
 * What sharing this list actually buys, stated exactly: the harness
 * `readFileSync`s every entry, so a filename here that is missing from
 * `public/fonts` fails the suite. It does **not** make the test a guard against
 * font problems in general — Typst treats an unregistered family as a *warning*
 * and still produces a PDF, so a theme switched to a face nobody registers
 * compiles cleanly in both places and only misrenders. The value is one list
 * instead of two, plus that existence check.
 */
export const EAGER_FONT_FILES = [
  'inter-latin-400-normal.ttf',
  'inter-latin-400-italic.ttf',
  'inter-latin-500-normal.ttf',
  'inter-latin-700-normal.ttf',
  'lora-latin-400-normal.ttf',
  'lora-latin-400-italic.ttf',
  'lora-latin-700-normal.ttf',
  'DejaVuSans.ttf',
  'jetbrains-mono-latin-400-normal.ttf',
  'jetbrains-mono-latin-400-italic.ttf',
  'jetbrains-mono-latin-700-normal.ttf',
  'jetbrains-mono-latin-700-italic.ttf',
];

/**
 * The compiler's font loader, shared by the worker and the test harness.
 * `assets: false` stops `typst.ts` adding its default text fonts, fetched from
 * `cdn.jsdelivr.net` on every compiler start.
 */
export function typstFontLoaders(fonts: Uint8Array[] = []) {
  return [loadFonts(fonts, { assets: false })];
}
