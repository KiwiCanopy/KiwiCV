/**
 * Generates the Typst font metadata for the lazily-loaded CJK faces.
 *
 * The Typst worker registers most faces eagerly, but the two Noto Sans CJK
 * files are ~15.7 MB each — together roughly 24 MB brotli-compressed, which
 * every user downloaded before the first preview could render even when the CV
 * contained no CJK text at all.
 *
 * `typst.ts` supports lazy faces: given a font's metadata up front, it fetches
 * the file only when a glyph actually needs it. The metadata includes a
 * run-length-encoded coverage table, so ~10 KB of JSON stands in for a 15.7 MB
 * file until the moment a CJK codepoint appears.
 *
 * This script produces that metadata. It is committed rather than generated
 * during the build so the app has no build-time WASM dependency; the checked-in
 * file records a SHA-256 of each font, and `tests/lint/font-info.test.mjs`
 * fails if a font file is swapped without regenerating.
 *
 * Usage: npm run fonts:generate-info
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONT_DIR = path.join(ROOT, 'public', 'fonts');
const OUT_FILE = path.join(ROOT, 'src', 'workers', 'lazy-font-info.json');

/** Faces registered lazily. Keep in sync with `LAZY_FONT_FILES` in the worker. */
const LAZY_FONTS = ['noto-sans-cjk-sc-regular.otf', 'noto-sans-cjk-jp-regular.otf'];

// Resolved as a package — `ops/TESTING.md` § Paths in tests.
const require = createRequire(import.meta.url);
const wasmShim = require.resolve('@myriaddreamin/typst-ts-web-compiler/pkg/wasm-pack-shim.mjs');
const wasmBinary =
  require.resolve('@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm');

const pkg = await import(wasmShim);
await pkg.default({ module_or_path: fs.readFileSync(wasmBinary) });

const entries = LAZY_FONTS.map((file) => {
  const fontPath = path.join(FONT_DIR, file);
  if (!fs.existsSync(fontPath)) {
    throw new Error(`Font not found: ${fontPath}`);
  }

  const bytes = fs.readFileSync(fontPath);
  const builder = new pkg.TypstFontResolverBuilder();
  const info = builder.get_font_info(new Uint8Array(bytes));

  if (!info?.info?.length) {
    throw new Error(`No font info produced for ${file} — the face may be unreadable`);
  }

  console.log(
    `  ${file}: ${(bytes.length / 1048576).toFixed(1)} MB font -> ${info.info.length} face(s), ` +
      `${info.info.map((f) => f.family).join(', ')}`,
  );

  return {
    file,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
    info,
  };
});

const payload = {
  // Regenerate with `npm run fonts:generate-info` whenever a lazy font changes.
  generatedBy: 'scripts/generate-font-info.mjs',
  fonts: entries,
};

// Written minified on purpose: the coverage tables are long integer arrays, and
// pretty-printing them puts each entry on its own line — 139 KB versus 20 KB,
// all of it bundled into the worker chunk. The file is generated, never
// hand-edited, so it is not meant to be read as a diff.
fs.writeFileSync(OUT_FILE, `${JSON.stringify(payload)}\n`);

const outKb = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
const savedMb = (entries.reduce((sum, e) => sum + e.bytes, 0) / 1048576).toFixed(1);
console.log(`\nWrote ${path.relative(ROOT, OUT_FILE)} (${outKb} KB)`);
console.log(`Defers ${savedMb} MB of font data until a CJK glyph is actually used.`);
