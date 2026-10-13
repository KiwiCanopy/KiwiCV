/**
 * Icon paths live in `index.html`, `public/manifest.json` and the asset script,
 * and a missing file fails silently: iOS falls back to a screenshot, Chromium
 * logs a manifest warning nobody reads. Every referenced file must exist.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PUBLIC = path.join(ROOT, 'public');
// `?v=N` busts the 1-day /logos/ cache when an icon is redrawn; the file has no query.
const onDisk = (url) => path.join(PUBLIC, url.split('?')[0]);

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'manifest.json'), 'utf8'));

const linkHrefs = [...html.matchAll(/<link\s[^>]*rel="(?:icon|apple-touch-icon|manifest)"[^>]*>/g)]
  .map(([tag]) => tag.match(/href="([^"]+)"/)?.[1])
  .filter(Boolean);

test('index.html declares the icons and the manifest', () => {
  assert.ok(linkHrefs.includes('/manifest.json'), 'no manifest link');
  assert.ok(
    linkHrefs.some((href) => href.split('?')[0].endsWith('apple-touch-icon.png')),
    'no apple-touch-icon link',
  );
});

test('every icon and manifest path in index.html exists under public/', () => {
  for (const href of linkHrefs) {
    assert.ok(fs.existsSync(onDisk(href)), `index.html points at missing ${href}`);
  }
});

test('every manifest icon exists under public/', () => {
  assert.ok(manifest.icons.length > 0, 'manifest has no icons');
  for (const { src } of manifest.icons) {
    assert.ok(fs.existsSync(onDisk(src)), `manifest.json points at missing ${src}`);
  }
});
