import { getProfileImagePath } from '@/components/preview/themes/shared/typstUtils';
import { EAGER_FONT_FILES, typstFontLoaders } from '@/workers/eagerFonts';
import lazyFontInfo from '@/workers/lazy-font-info.json';
import rendererWasmUrl from '@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url';
import compilerWasmUrl from '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url';
import { $typst } from '@myriaddreamin/typst.ts';

// Compiler and renderer WASM are served from our own origin. They used to be
// fetched from jsDelivr, which made every first compile depend on a third
// party: a blocked or slow CDN produced an empty preview, and the default
// PDF view triggers that fetch on every fresh load. Vite resolves these to
// hashed assets emitted from node_modules, so the versions always match the
// installed packages.
$typst.setCompilerInitOptions({
  getModule: () => new URL(compilerWasmUrl, self.location.href).href,
  // The faces themselves arrive through `setFonts` in `initFonts`.
  beforeBuild: typstFontLoaders(),
});

$typst.setRendererInitOptions({
  getModule: () => new URL(rendererWasmUrl, self.location.href).href,
});

let fontsInitialized = false;
let initFontsPromise: Promise<void> | null = null;

/** Lazy-font bytes already downloaded, keyed by URL. See `prefetchLazyFonts`. */
const lazyFontCache = new Map<string, Uint8Array>();

/**
 * Matches any script that needs one of the Noto CJK faces: CJK ideographs and
 * their extensions, kana, Hangul, bopomofo, and the CJK punctuation/compat
 * blocks.
 *
 * This is a **prefetch hint, not a correctness gate.** Typst still decides
 * which face to use from the coverage tables, and `fetchFontSync` remains as
 * the fallback, so a false negative here costs latency rather than glyphs.
 */
// Written as escapes rather than literal ranges: the CJK punctuation block
// includes U+3000 IDEOGRAPHIC SPACE, which is invisible in review and an
// ESLint `no-irregular-whitespace` error.
const CJK_PATTERN = new RegExp(
  '[' +
    '\\u1100-\\u11FF' + // Hangul Jamo
    '\\u2E80-\\u2FDF' + // CJK radicals, Kangxi
    '\\u3000-\\u303F' + // CJK symbols and punctuation
    '\\u3040-\\u30FF' + // Hiragana, Katakana
    '\\u3100-\\u312F' + // Bopomofo
    '\\u3130-\\u318F' + // Hangul compatibility Jamo
    '\\u31F0-\\u31FF' + // Katakana phonetic extensions
    '\\u3400-\\u4DBF' + // CJK Unified Ideographs Extension A
    '\\u4E00-\\u9FFF' + // CJK Unified Ideographs
    '\\uAC00-\\uD7AF' + // Hangul syllables
    '\\uF900-\\uFAFF' + // CJK compatibility ideographs
    '\\uFE30-\\uFE4F' + // CJK compatibility forms
    '\\uFF00-\\uFFEF' + // Halfwidth and fullwidth forms
    ']',
);

/**
 * Downloads the lazy faces ahead of the compile when the markup needs them.
 *
 * Typst's callback is synchronous, so without this the 15.7 MB download happens
 * inside the compile on a thread that cannot yield — and on a real connection
 * that blew past the 30 s compile timeout in `useTypst.ts`, failing a CJK CV
 * with "taking longer than expected". Locally the file comes off disk in
 * milliseconds, so this only ever appears on a deploy preview or in production.
 *
 * Fetching here instead means the download is a normal async request that the
 * worker can await, and the synchronous callback then serves from the cache.
 */
async function prefetchLazyFonts(markup: string) {
  if (!CJK_PATTERN.test(markup)) return;

  await Promise.all(
    lazyFontInfo.fonts.map(async (entry) => {
      const url = `${self.location.origin}/fonts/${entry.file}`;
      if (lazyFontCache.has(url)) return;

      try {
        const res = await fetch(url);
        if (!res.ok) return; // fetchFontSync will retry and report properly
        lazyFontCache.set(url, new Uint8Array(await res.arrayBuffer()));
      } catch {
        // Leave it uncached; the synchronous path is still there as a fallback.
      }
    }),
  );
}

/**
 * Pulls a font file synchronously.
 *
 * Typst asks for a lazy face's bytes from inside the compile, and its callback
 * is synchronous — it must return the buffer, not a promise. A blocking XHR is
 * the only way to satisfy that, which is legal here precisely because this is a
 * worker: the request blocks this thread, never the UI. `typst.ts` resolves its
 * own lazy fonts the same way (`loadFontSync` in its `init` module).
 *
 * `prefetchLazyFonts` normally fills the cache first, so this is the fallback
 * for a glyph the prefetch heuristic did not anticipate.
 */
function fetchFontSync(url: string): Uint8Array {
  const cached = lazyFontCache.get(url);
  if (cached) return cached;

  const xhr = new XMLHttpRequest();
  xhr.overrideMimeType('text/plain; charset=x-user-defined');
  xhr.open('GET', url, false);
  xhr.send(null);

  if (xhr.status !== 200 || typeof xhr.response !== 'string') {
    throw new Error(`Failed to load lazy font: ${url} (status ${xhr.status})`);
  }

  const bytes = Uint8Array.from(xhr.response, (c) => c.charCodeAt(0));

  // A missing file under `public/` does NOT 404 here: both the Vite dev server
  // and Netlify's SPA rewrite answer with index.html and status 200, so a
  // status check alone would hand Typst a few KB of markup as a typeface. Check
  // the sfnt magic instead — `OTTO` for CFF outlines (the Noto CJK faces),
  // 0x00010000 for TrueType.
  const magic = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | (bytes[3] ?? 0);
  const isOpenType = magic === 0x4f54544f; // 'OTTO'
  const isTrueType = magic === 0x00010000 || magic === 0x74727565; // 'true'

  if (!isOpenType && !isTrueType) {
    throw new Error(
      `Lazy font is not a font: ${url} returned ${bytes.length} bytes ` +
        'that are not sfnt-tagged (an SPA fallback page, most likely)',
    );
  }

  lazyFontCache.set(url, bytes);
  return bytes;
}

async function initFonts() {
  if (fontsInitialized) return;
  if (initFontsPromise) return initFontsPromise;

  initFontsPromise = (async () => {
    try {
      // Every face is served from our own origin (public/fonts). The Inter,
      // Lora and DejaVu faces used to come from jsDelivr, so a blocked CDN
      // silently dropped them and Typst fell back to whatever was left.
      const fontUrls = EAGER_FONT_FILES.map((file) => `${self.location.origin}/fonts/${file}`);

      const fb = (await (
        $typst as unknown as { getFontResolver: () => Promise<unknown> }
      ).getFontResolver()) as {
        fontBuilder: {
          add_raw_font: (buf: Uint8Array) => void;
          add_lazy_font: (info: unknown, blob: (idx: number) => Uint8Array) => void;
          build: () => Promise<unknown>;
        };
      };

      // Fetch all font binaries in parallel
      const fontBuffers = await Promise.all(
        fontUrls.map(async (url) => {
          try {
            const res = await fetch(url);
            if (!res.ok) {
              console.warn(`⚠️ Failed to load font from: ${url}`);
              return new Uint8Array(); // Return empty to avoid crashing on 404 HTML pages
            }
            return new Uint8Array(await res.arrayBuffer());
          } catch (e) {
            console.warn(`⚠️ Network error fetching font: ${url}`, e);
            return new Uint8Array();
          }
        }),
      );

      // Map valid font buffers
      for (const buffer of fontBuffers) {
        if (buffer.length > 0) {
          fb.fontBuilder.add_raw_font(buffer);
        }
      }

      // The two Noto Sans CJK faces are ~15.7 MB each. Registering them eagerly
      // meant every user downloaded ~24 MB (brotli) before the first preview
      // could render, whether or not the CV contained a single CJK character.
      //
      // They are registered lazily instead: `lazy-font-info.json` carries each
      // face's family, variant and run-length-encoded coverage table — 19 KB
      // standing in for 31 MB — so Typst knows what the face covers and pulls
      // the file only when a glyph actually resolves to it. Font selection is
      // unchanged, because the coverage table is the same one Typst would have
      // computed from the file itself.
      //
      // Regenerate with `npm run fonts:generate-info` after changing a face;
      // `tests/lint/font-info.test.mjs` fails if the two drift apart.
      for (const entry of lazyFontInfo.fonts) {
        const url = `${self.location.origin}/fonts/${entry.file}`;
        fb.fontBuilder.add_lazy_font(entry.info, () => fetchFontSync(url));
      }

      const compiler = (await (
        $typst as unknown as { getCompiler: () => Promise<unknown> }
      ).getCompiler()) as {
        setFonts: (fonts: unknown) => void;
      };

      const fonts = await fb.fontBuilder.build();
      compiler.setFonts(fonts);

      fontsInitialized = true;
    } catch (error) {
      initFontsPromise = null; // reset so we can retry on failure
      console.error('Failed to load fonts in Web Worker:', error);
      throw error;
    }
  })();

  return initFontsPromise;
}

self.onmessage = async (event: MessageEvent) => {
  const { type, id, markup, assets, profileImage } = event.data;

  try {
    // Ensure compiler and fonts are initialized
    await initFonts();

    // A warm-up carries no document. It exists so the compiler WASM, the
    // renderer and the eager font set are already resolved by the time a real
    // compile arrives — on phones nothing else creates this worker before the
    // Preview tap does, so that tap used to pay the whole cold start. Answered
    // right after `initFonts`, which is the cost being moved.
    if (type === 'warm') {
      self.postMessage({ type: 'warm-success', id });
      return;
    }

    // Pull the lazy CJK faces before the compile if this document needs them.
    // Typst's own callback cannot await, so downloading there would block the
    // worker past the compile timeout on a real connection.
    if (typeof markup === 'string') {
      await prefetchLazyFonts(markup);
    }

    const compiler = (await (
      $typst as unknown as { getCompiler: () => Promise<unknown> }
    ).getCompiler()) as {
      mapShadow: (path: string, content: Uint8Array) => void;
    };

    // Map the profile image if present
    if (profileImage) {
      try {
        let bytes: Uint8Array;

        if (profileImage.startsWith('data:image/')) {
          const base64Data = profileImage.replace(/^data:image\/[^;]+;base64,/, '');
          const binaryString = atob(base64Data);
          bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
        } else {
          // Resolve relative to host origin if it's a relative path
          const url = profileImage.startsWith('http')
            ? profileImage
            : self.location.origin + profileImage;

          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          bytes = new Uint8Array(await res.arrayBuffer());
        }

        const imagePath = getProfileImagePath(profileImage);
        compiler.mapShadow(imagePath, bytes);
      } catch (err) {
        console.error('Failed to map profile image in Web Worker:', err);
      }
    }

    // Map any dynamic SVG assets to the virtual file system
    if (assets) {
      const encoder = new TextEncoder();
      for (const [name, content] of Object.entries(assets)) {
        const bytes = encoder.encode(content as string);
        compiler.mapShadow(`/icons/${name}.svg`, bytes);
      }
    }

    if (type === 'compile-svg') {
      console.log('TYPST MARKUP TO COMPILE:\n', markup);
      const svgContent = await $typst.svg({ mainContent: markup });
      self.postMessage({ type: 'compile-svg-success', id, svg: svgContent });
    } else if (type === 'compile-pdf') {
      console.log('TYPST MARKUP TO COMPILE PDF:\n', markup);
      const pdfBytes = await $typst.pdf({ mainContent: markup });
      self.postMessage({ type: 'compile-pdf-success', id, pdf: pdfBytes });
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Typst compile error in Web Worker:', errorMsg);
    self.postMessage({
      type: 'compile-error',
      id,
      error: errorMsg,
    });
  }
};
