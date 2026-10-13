/**
 * AI Service Configuration & Limits
 *
 * IMPORTANT: This file must be kept in sync with the backend constants:
 * netlify/functions/lib/ai/constants.js
 */
export const AI_PRO_DAILY_LIMIT = 200;

export const AI_MAX_CHAR_LIMIT = 10000;

/**
 * Longest free-text language name the AI import accepts. Both the field's
 * `maxLength` and the backend's own slice read this one value — raising it on
 * one side alone would let the field accept a name the prompt never sees.
 *
 * ⚠️ This is one of **two** caps, and not the one that usually binds. The
 * backend also keeps only the first `MAX_LANGUAGE_LABEL_WORDS` (4) words, and
 * applies that first — so "Chinese Traditional Hong Kong Cantonese" fits inside
 * this length and still reaches the prompt as "Chinese Traditional Hong Kong".
 * Raising this value alone does not make longer names arrive intact. The word
 * cap stays backend-only on purpose: nothing on the frontend mirrors it, so it
 * is not a duplicated constant this check could guard.
 */
export const AI_LANGUAGE_NAME_MAX_LENGTH = 40;

/**
 * Largest upload accepted. The file picker applies this value
 * (`useAIImportFile.ts:17`) as a UX affordance; the server enforces its own copy,
 * which is the one that binds, since a direct POST never runs the picker.
 *
 * ⚠️ Compared against the **base64 length**, derived as x4/3, rather than the
 * decoded byte count — decoding it to measure would allocate the very payload
 * the cap exists to refuse.
 */
export const AI_MAX_UPLOAD_BYTES = 5242880;

/**
 * Largest whole-CV translation, as projected characters: the CV `meta`-stripped,
 * sanitized and projected exactly as the worker sends it (`wholeCvTranslationChars`). A full translation hit
 * the 65,536-token output cap at ≈175k (ops/AI_LOGIC.md § The poller window).
 * Measured for German only.
 */
export const AI_TRANSLATION_MAX_CHARS = 150000;

/**
 * The cap for the two strings that state it, floored so the copy can only ever
 * understate what the bytes enforce. Divides by MiB while the copy says "MB" —
 * deliberately, since MiB-flooring is the stricter of the two readings.
 *
 * ⚠️ Frontend-only and derived, so it is absent from `constantsToSync` in
 * `scripts/check-ai-constants-sync.cjs`: mirroring it as a literal would stop it
 * tracking the bytes, and listing it would compare this expression against that
 * literal on every push.
 */
export const AI_MAX_UPLOAD_MB = Math.floor(AI_MAX_UPLOAD_BYTES / (1024 * 1024));

/**
 * Cover-letter length presets, as fractions of one letter page. The label
 * promises a page fraction, so the word count behind it is derived from the
 * page — `coverLetterWordTarget` in `src/utils/coverLetterLength.ts`.
 */
export const COVER_LETTER_LENGTH_PRESETS = { short: 0.28, medium: 0.52, long: 0.85 };

export type CoverLetterLengthPreset = keyof typeof COVER_LETTER_LENGTH_PRESETS;

/**
 * Languages whose letters are counted in characters, not words.
 *
 * ⚠️ **Not a preference — a word is not a unit in these scripts.** Chinese and
 * Japanese are written without spaces, so whitespace tokenisation counts a whole
 * paragraph as one or two. Measured 2026-09-05: a 300-word Chinese letter came
 * back as ~330 characters and scored 31.
 *
 * Korean is deliberately absent: Hangul is spaced, so words survive as a unit.
 */
export const COVER_LETTER_CHARACTER_LANGS = ['zh', 'ja'] as const;

/**
 * ⚠️ Derived, never restated. Everything keyed by script — the fixtures, the
 * sweep, the font faces — types itself against this, so adding a third language
 * to the array above is a **build error** until every one of them has an entry.
 * Restating the union is how a new language gets a character target read off a
 * table measured on another script's face, silently.
 */
export type CoverLetterCharacterLang = (typeof COVER_LETTER_CHARACTER_LANGS)[number];

/**
 * How much wider the character bounds are than the word bounds. The measured chars-per-word ratio
 * spans **2.13 to 3.14** across the 24 theme/layout cells, median 2.58 — only 6
 * of them fall between 2.4 and 2.6, so this is a spread, not a constant. 2.5 sits
 * just below the median deliberately: a clamp that errs short shortens a letter,
 * where one that errs long promises a page that spills. These are advisory clamps, not render
 * limits, so a value from the middle of the range is honest where a table entry
 * would not be.
 *
 * ⚠️ Applying the word bounds to characters would cap `long` on nearly every
 * theme, silently shortening the letter the preset promised.
 */
export const COVER_LETTER_CHARACTER_CLAMP_FACTOR = 2.5;

/**
 * The user-set range behind the presets. One flat range: 1,000 words stays
 * within two pages on every theme in either layout at `fontScale` 1.
 *
 * ⚠️ These bound a letter counted in WORDS. A character target is widened by
 * `COVER_LETTER_CHARACTER_CLAMP_FACTOR` before it meets them.
 */
export const COVER_LETTER_MIN_WORDS = 100;
export const COVER_LETTER_MAX_WORDS = 1000;

/**
 * The four tones the letter prompt knows, in the order the picker offers them.
 *
 * ⚠️ **A key array, against an object of behavioural definitions.**
 * `COVER_LETTER_TONES` in `netlify/functions/lib/ai/prompts.js` carries a
 * sentence per key and `getCoverLetterPrompt` throws `UNKNOWN_LETTER_TONE` for
 * anything else, so a tone this side offers and that side does not is a
 * `LETTER_BAD_REQUEST` — one of the two failures a retry cannot clear.
 * `ai:check-sync` pairs named numeric constants and cannot pair these two
 * shapes; `__tests__/coverLetterTones.test.ts` reads the backend file as text
 * instead.
 */
export const COVER_LETTER_TONES = ['professional', 'warm', 'formal', 'confident'] as const;

export type CoverLetterTone = (typeof COVER_LETTER_TONES)[number];

export const COVER_LETTER_DEFAULT_TONE: CoverLetterTone = 'professional';

export const COVER_LETTER_DEFAULT_LENGTH: CoverLetterLengthPreset = 'medium';

/**
 * Longest writing sample the "Match my writing style" field accepts.
 * The server truncates to the same value before the sample reaches the prompt,
 * because a direct POST never runs the field.
 *
 * ⚠️ Raised from 4,000 on 2026-09-08 (owner): a full letter plus a paragraph of
 * voice notes ran into the cap. It buys the prompt ~250 more tokens against a
 * call already sending the whole CV, so it is a UX cap, not a cost one — the
 * cost bound is `AI_MAX_PAYLOAD_CHARS`. Nothing derives from the value: the
 * counter, the two announcements and the field's `maxLength` all read it here,
 * and the near-limit threshold is 90% of whatever it says.
 *
 * ⚠️ The Privacy Policy (§4, all 15 locales) states this number, and so
 * does the backend copy in `netlify/functions/lib/ai/constants.js`: changing it
 * is a legal-text edit.
 */
export const COVER_LETTER_STYLE_MAX = 5000;

/**
 * The stage a two-call job writes into `ai_jobs.result` between call 1 and call
 * 2, so the poller can head the status view with the call that is actually
 * running.
 *
 * ⚠️ Kept in `scripts/check-ai-constants-sync.cjs` alongside the backend copy.
 * The value crosses the process boundary as a bare string and nothing
 * typechecks it there — the same reason `coverLetterRetryable` is decided
 * beside the failure codes rather than re-derived in the app.
 */
export const AI_JOB_STAGE_COVER_LETTER = 'cover_letter';

/**
 * The worker refusals the client answers with the paywall rather than the
 * generic error: `PREMIUM_REQUIRED` opens it in `generic` mode, `LIMIT_REACHED`
 * in `limit` mode. Any other `ai_jobs.error` is a failure. Kept in
 * `scripts/check-ai-constants-sync.cjs` with the workers' copy.
 */
export const AI_PAYWALL_CODES = {
  PREMIUM_REQUIRED: 'PREMIUM_REQUIRED',
  LIMIT_REACHED: 'LIMIT_REACHED',
} as const;

export type AIPaywallCode = (typeof AI_PAYWALL_CODES)[keyof typeof AI_PAYWALL_CODES];

/**
 * The poll window of an Improve, tailor or translate run: this floor plus one
 * millisecond per character of the serialised payload. Derived from
 * measured runs, which `aiPollWindow.test.ts` holds it against; the table is
 * on ops/AI_LOGIC.md § The poller window. Frontend-only — the worker never
 * times a run out — so absent from `constantsToSync`.
 */
export const AI_POLL_FLOOR_MS = 60_000;
export const AI_POLL_MS_PER_CHAR = 1;

export const AI_EXCLUDED_SECTIONS = ['references', 'profiles'] as const;

/** Sections that support the "Optimize skill grouping" toggle */
export const AI_REORG_SECTIONS = ['skills'] as const;

export type AIServiceGranularity = 'item' | 'section' | 'cv';
