/**
 * The Typst worker registers the two Noto Sans CJK faces lazily, using the
 * metadata in `src/workers/lazy-font-info.json` — family, variant and a
 * coverage table — so Typst can decide whether a glyph needs the 15.7 MB file
 * before fetching it.
 *
 * That metadata is generated from the font binaries and then committed. If a
 * face is replaced, subset or re-exported without regenerating, the coverage
 * table silently describes a file that no longer exists: Typst would either
 * skip a face that does cover a glyph (tofu in the PDF) or fetch 15.7 MB for
 * one that does not. Neither shows up as an error — the PDF just renders wrong.
 *
 * These tests bind the two together so that drift fails the build instead.
 */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const INFO_PATH = path.join(ROOT, 'src', 'workers', 'lazy-font-info.json');
const WORKER_PATH = path.join(ROOT, 'src', 'workers', 'typst.worker.ts');
const EAGER_PATH = path.join(ROOT, 'src', 'workers', 'eagerFonts.ts');

const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf8'));
const worker = fs.readFileSync(WORKER_PATH, 'utf8');
const eagerFonts = fs.readFileSync(EAGER_PATH, 'utf8');

test('every lazy font file exists and matches its recorded hash', () => {
  assert.ok(info.fonts.length > 0, 'no lazy fonts recorded');

  for (const entry of info.fonts) {
    const fontPath = path.join(ROOT, 'public', 'fonts', entry.file);
    assert.ok(fs.existsSync(fontPath), `${entry.file} is registered lazily but missing`);

    const bytes = fs.readFileSync(fontPath);
    const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');

    assert.equal(
      sha256,
      entry.sha256,
      `${entry.file} changed since its metadata was generated — ` +
        'run `npm run fonts:generate-info`',
    );
    assert.equal(bytes.length, entry.bytes, `${entry.file} size disagrees with the metadata`);
  }
});

test('each entry carries a usable family and coverage table', () => {
  for (const entry of info.fonts) {
    const faces = entry.info?.info;
    assert.ok(Array.isArray(faces) && faces.length > 0, `${entry.file} has no face metadata`);

    for (const face of faces) {
      assert.ok(face.family, `${entry.file} has a face with no family name`);
      assert.ok(
        Array.isArray(face.coverage) && face.coverage.length > 0,
        `${face.family} has an empty coverage table — Typst would never select it`,
      );
    }
  }
});

test('the CJK faces are not also registered eagerly', () => {
  // Registering a face both eagerly and lazily would defeat the change without
  // any visible symptom: the eager fetch still downloads the file.
  // The list lives in `eagerFonts.ts`, not in the worker: the compile smoke
  // test loads the same faces and cannot import the worker, whose module-level
  // `?url` WASM imports only resolve under Vite.
  const eagerBlock = eagerFonts.match(/export const EAGER_FONT_FILES = \[([\s\S]*?)\]/);
  assert.ok(eagerBlock, 'EAGER_FONT_FILES not found in src/workers/eagerFonts.ts');

  // Since the list moved out of the worker, this check would still pass if the
  // worker stopped using it altogether. Pin the wiring too.
  assert.match(
    worker,
    /import \{[^}]*\bEAGER_FONT_FILES\b[^}]*\} from '@\/workers\/eagerFonts'/,
    'the worker no longer imports EAGER_FONT_FILES',
  );

  for (const entry of info.fonts) {
    assert.ok(
      !eagerBlock[1].includes(entry.file),
      `${entry.file} is registered lazily but still listed in EAGER_FONT_FILES`,
    );
  }
});

test('the font stack still names every lazily-registered family', () => {
  // Typst resolves per glyph against the families named in the theme's font
  // stack. A lazy face missing from that stack is dead weight: it is fetched
  // for nobody, and CJK text falls through to a face that cannot render it.
  const utils = fs.readFileSync(
    path.join(ROOT, 'src', 'components', 'preview', 'themes', 'shared', 'typstUtils.ts'),
    'utf8',
  );

  for (const entry of info.fonts) {
    for (const face of entry.info.info) {
      assert.ok(
        utils.includes(`'${face.family}'`) || utils.includes(`"${face.family}"`),
        `${face.family} is registered but absent from TYPST_FONTS in typstUtils.ts`,
      );
    }
  }
});
