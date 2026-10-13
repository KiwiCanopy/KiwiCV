import { AI_POLL_FLOOR_MS, AI_POLL_MS_PER_CHAR } from '@/constants/ai';
import { aiPollWindowMs } from '@/utils/ai';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The poll window is derived from a measured rate, and these are the
 * measurements it has to clear. Read as numbers rather than as "floor plus
 * slope" so a future edit to either constant is judged against what Vertex
 * actually did, not against the formula's own shape.
 *
 * 2026-09-08, gemini-3.5-flash-lite on the EU endpoint, the real call-1 path:
 * a whole-CV translation of 132,786 characters returned 38,327 tokens in
 * 78.9 s. That is the output-bound case — a tailoring run of the same size
 * answered in 7.4 s because the model rewrites only what benefits.
 */
const MEASURED = { chars: 132_786, seconds: 78.9 };

/** ~480 tokens/s out, and a translation returns about as many tokens as it was sent. */
const PROJECTED_SECONDS_PER_CHAR = 0.0006;

/**
 * The cap lives on the backend only (`AI_MAX_PAYLOAD_CHARS` is not one of the
 * synced pair), so it is read as text, the way `aiImprovableSections.test.ts`
 * reads the section inventory.
 */
const payloadCap = (): number => {
  const source = readFileSync(
    path.resolve(process.cwd(), 'netlify/functions/lib/ai/constants.js'),
    'utf8',
  );
  const match = source.match(/export const AI_MAX_PAYLOAD_CHARS = (\d+);/);
  if (!match) throw new Error('AI_MAX_PAYLOAD_CHARS not found in the backend constants');
  return Number(match[1]);
};

/** The worker's own budget; a window past it waits for a run that cannot still be running. */
const WORKER_BUDGET_MS = 15 * 60 * 1000;

describe('the poll window a run gets', () => {
  it('keeps the old minute for a payload of nothing', () => {
    expect(aiPollWindowMs(0)).toBe(AI_POLL_FLOOR_MS);
    expect(AI_POLL_FLOOR_MS).toBe(60_000);
  });

  it('grows with the payload', () => {
    expect(aiPollWindowMs(10_000)).toBeGreaterThan(aiPollWindowMs(1_000));
    expect(aiPollWindowMs(1_000) - aiPollWindowMs(0)).toBe(1_000 * AI_POLL_MS_PER_CHAR);
  });

  it('clears the measured worst case with room to spare', () => {
    // Twice the measurement: variance between runs is real (the 70k run spread
    // 36–39 s), and the letter call adds up to 7 s on top.
    expect(aiPollWindowMs(MEASURED.chars)).toBeGreaterThanOrEqual(MEASURED.seconds * 1000 * 2);
  });

  it('clears the projected worst case at the payload cap, inside the worker budget', () => {
    const cap = payloadCap();
    const projectedMs = cap * PROJECTED_SECONDS_PER_CHAR * 1000;
    expect(aiPollWindowMs(cap)).toBeGreaterThanOrEqual(projectedMs * 2);
    expect(aiPollWindowMs(cap)).toBeLessThan(WORKER_BUDGET_MS);
  });
});
