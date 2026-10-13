import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import enRedirect from '../../netlify/edge-functions/en-redirect.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const toml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');

// The /en retirement is enforced twice on purpose: the edge function reaches
// bots, the [[redirects]] rules are the browser-facing backstop. Deleting
// either half silently reopens `/en/*` for one class of traffic (wiki SEO.md).

test('netlify.toml declares the edge function for /en and /en/*', () => {
  const declarations = [
    ...toml.matchAll(/\[\[edge_functions\]\]\s*\n\s*path = "([^"]+)"\s*\n\s*function = "([^"]+)"/g),
  ]
    .filter(([, , fn]) => fn === 'en-redirect')
    .map(([, p]) => p);
  assert.deepEqual(declarations.sort(), ['/en', '/en/*']);
});

test('the redirect backstop rules are still present', () => {
  assert.match(toml, /from = "\/en"\s*\n\s*to = "\/"\s*\n\s*status = 301/);
  assert.match(toml, /from = "\/en\/\*"\s*\n\s*to = "\/:splat"\s*\n\s*status = 301/);
});

test('the edge function 301s every /en form to the bare path', () => {
  const cases = [
    ['https://kiwicv.kiwicanopy.com/en', 'https://kiwicv.kiwicanopy.com/'],
    ['https://kiwicv.kiwicanopy.com/en/', 'https://kiwicv.kiwicanopy.com/'],
    ['https://kiwicv.kiwicanopy.com/en/blog', 'https://kiwicv.kiwicanopy.com/blog'],
    [
      'https://kiwicv.kiwicanopy.com/en/blog/kiwicv-origin',
      'https://kiwicv.kiwicanopy.com/blog/kiwicv-origin',
    ],
    // Query strings transfer, matching what the 301 [[redirects]] rules do.
    [
      'https://kiwicv.kiwicanopy.com/en/blog?utm_source=x',
      'https://kiwicv.kiwicanopy.com/blog?utm_source=x',
    ],
  ];
  for (const [from, to] of cases) {
    const response = enRedirect(new Request(from));
    assert.equal(response.status, 301, from);
    assert.equal(response.headers.get('location'), to, from);
  }
});

test('a request the prerenderer already rewrote still 301s to the original bare path', () => {
  // The prerender extension runs first even against a toml-declared function
  // and hands over `/netlify-prerender-function?url=<original>`.
  const rewritten = (original) =>
    `https://kiwicv.kiwicanopy.com/netlify-prerender-function?url=${encodeURIComponent(original)}`;
  const cases = [
    ['https://kiwicv.kiwicanopy.com/en/blog', 'https://kiwicv.kiwicanopy.com/blog'],
    ['https://kiwicv.kiwicanopy.com/en', 'https://kiwicv.kiwicanopy.com/'],
    [
      'https://kiwicv.kiwicanopy.com/en/blog?utm_source=x',
      'https://kiwicv.kiwicanopy.com/blog?utm_source=x',
    ],
  ];
  for (const [original, to] of cases) {
    const response = enRedirect(new Request(rewritten(original)));
    assert.equal(response.status, 301, original);
    assert.equal(response.headers.get('location'), to, original);
  }
});

test('anything else passes through untouched', () => {
  // A pass-through lets the prerenderer serve it; a mangled 301 would send the
  // bot to a path only the SPA catch-all answers.
  const passThrough = [
    'https://kiwicv.kiwicanopy.com/netlify-prerender-function',
    `https://kiwicv.kiwicanopy.com/netlify-prerender-function?url=${encodeURIComponent(
      'https://kiwicv.kiwicanopy.com/blog',
    )}`,
    'https://kiwicv.kiwicanopy.com/enx',
  ];
  for (const from of passThrough) {
    assert.equal(enRedirect(new Request(from)), undefined, from);
  }
});

test('the edge function stays import-free so no deno.lock appears', () => {
  // An import makes Deno lock modules; the gitignored-lockfile stance must then
  // be re-decided deliberately, not by drift (ops/DEPLOYMENT.md).
  const source = fs.readFileSync(path.join(ROOT, 'netlify/edge-functions/en-redirect.js'), 'utf8');
  assert.doesNotMatch(source, /^\s*import\s/m);
});
