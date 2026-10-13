import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  AI_MAX_PAYLOAD_CHARS,
  AI_MAX_UPLOAD_BYTES,
} from '../../netlify/functions/lib/ai/constants.js';
import { maxBase64CharsFor } from '../../netlify/functions/lib/ai/utils.js';

/**
 * The CV payload arrived unbounded. `AI_MAX_CHAR_LIMIT` capped the free
 * text only, and `AI_PRO_DAILY_LIMIT` counts REQUESTS, so 200 oversized ones
 * spent the same quota and a very different amount of Vertex.
 *
 * These caps are the kind that fail in two opposite directions, so both are
 * asserted: too high and they bound nothing, too low and they refuse a CV
 * somebody legitimately wrote. The second is the one no reviewer would notice.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('base64 length allows a file exactly at the byte cap', () => {
  // A real encoder's output, not a recomputation of the formula under test.
  const atCap = Buffer.alloc(AI_MAX_UPLOAD_BYTES).toString('base64');
  assert.ok(
    atCap.length <= maxBase64CharsFor(AI_MAX_UPLOAD_BYTES),
    `a ${AI_MAX_UPLOAD_BYTES}-byte file encodes to ${atCap.length} chars, over the ${maxBase64CharsFor(AI_MAX_UPLOAD_BYTES)} the guard allows — the cap would refuse a file the picker accepts`,
  );
});

test('base64 length refuses a file meaningfully over the byte cap', () => {
  const over = Buffer.alloc(AI_MAX_UPLOAD_BYTES + 1024 * 1024).toString('base64');
  assert.ok(over.length > maxBase64CharsFor(AI_MAX_UPLOAD_BYTES));
});

test('the base64 cap is not so slack that it bounds nothing', () => {
  // 128 chars of tolerance for padding and a `data:` prefix, not 128 KB.
  const slack = maxBase64CharsFor(AI_MAX_UPLOAD_BYTES) - Math.ceil((AI_MAX_UPLOAD_BYTES * 4) / 3);
  assert.ok(slack > 0 && slack < 1024, `slack is ${slack} chars`);
});

/**
 * The direction that would break real users. Every committed example is a CV
 * that once opened in the app, so a cap any of them exceeds is a cap that
 * refuses legitimate work — and the failure would arrive as a rejected AI run,
 * not as a red test, unless this exists.
 */
test('every committed example CV fits well inside the payload cap', () => {
  const dir = path.join(ROOT, 'examples');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

  assert.ok(files.length > 0, 'no example CVs found — this test would be vacuous');

  for (const file of files) {
    const chars = JSON.stringify(JSON.parse(readFileSync(path.join(dir, file), 'utf8'))).length;
    assert.ok(
      chars * 10 < AI_MAX_PAYLOAD_CHARS,
      `${file} is ${chars} chars; the cap is ${AI_MAX_PAYLOAD_CHARS}, leaving under 10x headroom`,
    );
  }
});

/**
 * All four figures measured on 2026-09-04 by scaling `examples/resume_4_3_5.json`.
 *
 * ⚠️ **The constraint is the PLAUSIBLE extreme, not the absurd one.** A
 * professor with 200 publications is a real CV at ~79,600 characters, and that
 * is the row where a cap set too low starts refusing people — silently, as a
 * failed AI run carrying the generic error, with nothing telling them why or
 * how to fix it. A cap of 128,000 would look defensible and leave that person
 * 1.6x, which is one unusually long career from a false refusal.
 *
 * The absurd row is not a target to sit above; it is the evidence that 256,000
 * cuts nothing a human writes. Fifty jobs carrying a thousand highlight bullets
 * between them still fits.
 */
const MEASURED_CVS = {
  'academic, 200 publications': 79601,
  'heavy: 20 jobs x 10 highlights, 15 projects': 82219,
  'absurd: 50 jobs x 20 highlights, 100 publications': 204227,
};

test('the cap clears the plausible extremes by at least 3x', () => {
  for (const [label, chars] of Object.entries(MEASURED_CVS)) {
    if (chars > 150000) continue; // the absurd row has its own, weaker bar
    assert.ok(
      AI_MAX_PAYLOAD_CHARS >= chars * 3,
      `${label} is ${chars} chars; a cap of ${AI_MAX_PAYLOAD_CHARS} leaves under 3x, which is where false refusals start`,
    );
  }
});

test('the cap still admits a CV nobody would actually write', () => {
  const absurd = MEASURED_CVS['absurd: 50 jobs x 20 highlights, 100 publications'];
  assert.ok(
    AI_MAX_PAYLOAD_CHARS > absurd,
    `cap ${AI_MAX_PAYLOAD_CHARS} refuses a ${absurd}-char CV — if even the absurd case is rejected, the cap is bounding CVs rather than abuse`,
  );
});
