/**
 * AI Service Constants (Backend)
 *
 * IMPORTANT: This file must be kept in sync with the frontend constants:
 * src/constants/ai.ts
 */

export const AI_PRO_DAILY_LIMIT = 200;

export const AI_MAX_CHAR_LIMIT = 10000;

/**
 * Longest free-text language name the AI import accepts. Both the field's
 * `maxLength` and the backend's own slice read this one value — raising it on
 * one side alone would let the field accept a name the prompt never sees.
 *
 * ⚠️ This is one of **two** caps, and not the one that usually binds.
 * `resolveLanguageLabel` keeps only the first `MAX_LANGUAGE_LABEL_WORDS` (4)
 * words and applies that first, so "Chinese Traditional Hong Kong Cantonese"
 * fits inside this length and still reaches the prompt as "Chinese Traditional
 * Hong Kong". Raising this value alone does not make longer names arrive
 * intact. The word cap stays here rather than joining the synced pair because
 * nothing on the frontend mirrors it.
 */
export const AI_LANGUAGE_NAME_MAX_LENGTH = 40;

export const VERTEX_CONFIG = {
  // Note: the EU REP endpoint below serves a limited model list — verify a
  // model responds there before swapping these values.
  //
  // Both pipelines run flash-lite since 2026-08-02, each backed by its own
  // live side-by-side against flash: parsing extracted identically at ~4x
  // the speed on a real CV; improvement produced equal-caliber writing at
  // ~5x the speed on a metric-free work entry. The two constants stay
  // separate so the pipelines can diverge again with a one-line change.
  MODEL: 'gemini-3.5-flash-lite',
  PARSING_MODEL: 'gemini-3.5-flash-lite',
  REGION: 'eu',
  // EU multi-region REP endpoint. Not derivable from REGION: the regional
  // `${REGION}-aiplatform.googleapis.com` pattern does not serve multi-regions.
  API_HOST: 'aiplatform.eu.rep.googleapis.com',
};

export const PROMPT_VERSION = '2026-10-12b';

/**
 * Largest CV, serialised, that may be sent for improvement or tailoring.
 *
 * ⚠️ Measured, not chosen round. The committed `examples/*.json` are ~7,400
 * characters; a deliberately heavy synthetic CV — 20 jobs of 10 highlights each,
 * 15 projects, 40 publications — is 82,219. This is 3x that, so no CV a person
 * could plausibly write reaches it, and ~64,000 tokens, so one that does cannot
 * quietly cost a fortune.
 *
 * It bounds cost, not correctness: `AI_PRO_DAILY_LIMIT` counts REQUESTS, so
 * without this 200 oversized ones bill the same quota and a very different
 * amount of Vertex.
 */
export const AI_MAX_PAYLOAD_CHARS = 256000;

/**
 * Largest whole-CV translation, as projected characters: the CV `meta`-stripped,
 * sanitized and projected exactly as the worker sends it. A full translation hit
 * the 65,536-token output cap at ≈175k (ops/AI_LOGIC.md § The poller window).
 * Measured for German only.
 */
export const AI_TRANSLATION_MAX_CHARS = 150000;

/**
 * Largest upload the import job accepts, mirroring the cap the file picker
 * already applies (`useAIImportFile.ts:17`). The client's is a UX affordance
 * that a direct POST never runs; this is the one that binds.
 *
 * ⚠️ Compared against the **base64 length**, derived as x4/3, rather than the
 * decoded byte count — decoding it to measure would allocate the very payload
 * the cap exists to refuse.
 */
export const AI_MAX_UPLOAD_BYTES = 5242880;

/**
 * Languages whose letters are counted in characters, not words — a word is not
 * a unit in an unspaced script. Mirrors `src/constants/ai.ts`.
 */
export const COVER_LETTER_CHARACTER_LANGS = ['zh', 'ja'];

/**
 * How much wider the character bounds are than the word bounds; The measured chars-per-word ratio
 * spans **2.13 to 3.14** across the 24 theme/layout cells, median 2.58 — only 6
 * of them fall between 2.4 and 2.6, so this is a spread, not a constant. 2.5 sits
 * just below the median deliberately: a clamp that errs short shortens a letter,
 * where one that errs long promises a page that spills. Mirrors the frontend.
 */
export const COVER_LETTER_CHARACTER_CLAMP_FACTOR = 2.5;

/**
 * The cover-letter word target is resolved on the client, which knows the
 * theme, layout and font scale, and will cross the boundary as a number
 * clamped to this range.
 */
export const COVER_LETTER_MIN_WORDS = 100;
export const COVER_LETTER_MAX_WORDS = 1000;

/**
 * What the letter call calls itself, to the engine, the mock, the job log and
 * the usage row's `details.context`. One constant because a rename that reaches
 * only some of those is silent: the mock falls through to the CV shape and the
 * run reports a plausible failure class instead of a wiring fault.
 */
export const COVER_LETTER_GRANULARITY = 'cover_letter';

/**
 * Longest writing sample the letter call accepts, and the cap the field applies
 * on the client.
 *
 * ⚠️ The server's copy is the one that binds. `AI_MAX_CHAR_LIMIT + 500` bounds
 * `instructions`, which the sample does not travel in, so without this the
 * densest possible source of claims the no-invention rule must reject arrives
 * unbounded from any direct POST.
 */
export const COVER_LETTER_STYLE_MAX = 5000;

/**
 * Written into `ai_jobs.result` between the two calls so the client can head its
 * status view with the call that is running. `status` stays `processing`
 * throughout — it is a Postgres enum, and a new value there would be a
 * migration; `result` is jsonb and needs none.
 */
export const AI_JOB_STAGE_COVER_LETTER = 'cover_letter';

/**
 * The refusals the client answers with the paywall: `PREMIUM_REQUIRED` (no
 * active Pass) and `LIMIT_REACHED` (allowance spent). They cross the boundary
 * as bare `ai_jobs.error` strings, so the frontend copy is kept in
 * `scripts/check-ai-constants-sync.cjs`.
 */
export const AI_PAYWALL_CODES = {
  PREMIUM_REQUIRED: 'PREMIUM_REQUIRED',
  LIMIT_REACHED: 'LIMIT_REACHED',
};

/**
 * `generationConfig.maxOutputTokens` for the letter call, derived from whichever
 * cap asks for more tokens so the budget and the ask cannot drift.
 *
 * ⚠️ **The word cap alone no longer bounds the ask.** Three tokens a
 * word covers a Latin letter with ~2.5x headroom. A character-counted letter is
 * capped at `COVER_LETTER_MAX_WORDS * COVER_LETTER_CHARACTER_CLAMP_FACTOR`
 * characters, the prompt states a ceiling 1.12x above that, and CJK tokenises at
 * roughly one token per character — so the ask approaches ~2,800 tokens against
 * the old 3,512 budget. Headroom fell from ~2.5x to ~1.2x, on a model whose
 * thinking tokens come out of the same budget. The failure is not a short
 * letter: `finishReason: 'MAX_TOKENS'` becomes `COVER_LETTER_FAILURES.TRUNCATED`,
 * the letter is lost, and only the CV call is billed.
 *
 * ⚠️ The 1-token-per-character figure is the published rule of thumb, **not
 * measured here** — no CJK letter has been generated end to end. Measure one
 * long `zh` letter and record the real count before tightening this.
 */
export const COVER_LETTER_MAX_OUTPUT_TOKENS =
  Math.max(
    COVER_LETTER_MAX_WORDS * 3,
    Math.ceil(COVER_LETTER_MAX_WORDS * COVER_LETTER_CHARACTER_CLAMP_FACTOR * 1.5),
  ) + 512;

export const APP_TIMEZONE = 'Europe/Berlin';

/**
 * AI Pricing (USD per 1,000,000 tokens)
 *
 * Non-global endpoint rates (in effect since 2026-07-01) — the EU REP host is
 * a non-global endpoint, so the global rates undercount. The previous
 * 0.3/2.5 entry for gemini-3.5-flash was actually flash-lite's global rate
 * and understated real cost ~4x. Dev-only cost display via logger.js.
 */
export const AI_PRICING = {
  'gemini-3.5-flash': {
    input_per_1m: 1.65,
    output_per_1m: 9.9,
  },
  'gemini-3.5-flash-lite': {
    input_per_1m: 0.33,
    output_per_1m: 2.75,
  },
};
