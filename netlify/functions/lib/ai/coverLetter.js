import { describeError } from '../describe-error.js';
import {
  APP_TIMEZONE,
  COVER_LETTER_GRANULARITY,
  COVER_LETTER_MAX_OUTPUT_TOKENS,
  COVER_LETTER_STYLE_MAX,
} from './constants.js';
import { getCoverLetterSchema } from './generator.js';
import { buildCoverLetterUserPrompt, getCoverLetterPrompt } from './prompts.js';
import { isTruncated } from './responseChecks.js';
import { projectForCoverLetter, sanitizeResumeData } from './utils.js';

/**
 * Why a letter did not arrive. Every one of these is a NOTICE on a successful
 * outcome — the tailored CV is already paid for and already good — never an
 * error, and never a second usage row.
 */
export const COVER_LETTER_FAILURES = Object.freeze({
  /** The request named a language, tone or word target the prompt refuses. */
  BAD_REQUEST: 'LETTER_BAD_REQUEST',
  /** The second call would spend a slot past today's allowance. */
  ALLOWANCE_SPENT: 'LETTER_ALLOWANCE_SPENT',
  /** The call itself never returned — 429, 503, a socket, `vertex.js` throws. */
  CALL_FAILED: 'LETTER_CALL_FAILED',
  /** `finishReason: 'MAX_TOKENS'` — the JSON is truncated mid-string. */
  TRUNCATED: 'LETTER_TRUNCATED',
  /** `finishReason: 'SAFETY'` — Vertex filtered prose the model generated. */
  FILTERED: 'LETTER_FILTERED',
  /** Valid finish, unparseable body. */
  UNPARSEABLE: 'LETTER_UNPARSEABLE',
  /** Schema-valid and still a failed letter: no paragraph carries text. */
  EMPTY: 'LETTER_EMPTY',
  /** A four-digit year the CV and the ad do not contain. */
  INVENTED_YEAR: 'LETTER_INVENTED_YEAR',
});

/**
 * The two a "try again" cannot clear: the day's allowance is spent, or the same
 * request would be refused the same way. Decided here beside the codes and
 * returned to the caller, because nothing typechecks a code string across the
 * process boundary.
 */
const NOT_RETRYABLE = new Set([
  COVER_LETTER_FAILURES.ALLOWANCE_SPENT,
  COVER_LETTER_FAILURES.BAD_REQUEST,
]);

/** Whether a "try again" on this failure is worth offering at all. */
export const isCoverLetterRetryable = (failure) => Boolean(failure) && !NOT_RETRYABLE.has(failure);

/**
 * A year as prose writes one. Narrower than `\d{4}` because the check is for
 * dates, not arithmetic — "5000 users" is not a date.
 */
const YEAR_PATTERN = /\b(?:19|20)\d{2}\b/g;

/**
 * ⚠️ Always known, and no CV states it. An ongoing role carries `endDate: ''`,
 * so "from 2019 to 2026" is the correct sentence for it and the projection has
 * no 2026 to match. Berlin, like every other day boundary here.
 */
const currentYear = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE, year: 'numeric' }).format(new Date());

/**
 * The request's cover-letter block, shaped and capped. Returns `null` when no
 * letter was asked for.
 *
 * ⚠️ `styleSample` is capped HERE and nowhere else on the server. The
 * `AI_MAX_CHAR_LIMIT + 500` guard in `improve-cv-background.mjs` bounds
 * `instructions`, which the sample never travels in, and the client's own
 * 5,000-character field is a UX affordance a direct POST never runs. It
 * is truncated rather than refused: the sample governs manner alone, so a
 * shortened one still writes the letter the user asked for.
 */
export function normalizeCoverLetterRequest(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const asText = (value) => (typeof value === 'string' ? value.trim() : '');
  const jobDescription = asText(raw.jobDescription);

  // ⚠️ The ad is what makes the block a request. Without one this is null — "no
  // letter was asked for" — not a request that fails: a caller that sends the
  // block whenever its panel is mounted would otherwise report a failed letter
  // on every run where the user never asked for one.
  if (!jobDescription) return null;

  return {
    jobDescription,
    targetLang: typeof raw.targetLang === 'string' ? raw.targetLang : '',
    tone: typeof raw.tone === 'string' ? raw.tone : undefined,
    wordTarget: Number(raw.wordTarget),
    styleSample: asText(raw.styleSample).slice(0, COVER_LETTER_STYLE_MAX),
  };
}

/**
 * Years the letter states that its sources do not, which fails the letter. The
 * measurement behind it is on ops/AI_LOGIC.md § The second call.
 *
 * `subject` is deliberately not searched: an ad's reference number is four
 * digits often enough, and the prompt puts it there.
 */
export function findInventedYears(paragraphs, sources) {
  const known = new Set(String(sources).match(YEAR_PATTERN) || []);
  known.add(currentYear());
  const stated = String(paragraphs.join('\n')).match(YEAR_PATTERN) || [];
  return [...new Set(stated.filter((year) => !known.has(year)))];
}

/**
 * The letter, or the reason there is not one. Split from the call so every
 * failure class has a test that needs no network and no mock.
 */
export function validateCoverLetter({ improvedContent, finishReason, projection, jobDescription }) {
  if (isTruncated({ finishReason })) return { error: COVER_LETTER_FAILURES.TRUNCATED };
  if (finishReason === 'SAFETY') return { error: COVER_LETTER_FAILURES.FILTERED };

  let parsed;
  try {
    parsed = JSON.parse(improvedContent);
  } catch {
    // Never log the body: it is CV-derived and would land in production logs.
    return { error: COVER_LETTER_FAILURES.UNPARSEABLE };
  }

  const paragraphs = Array.isArray(parsed?.paragraphs)
    ? parsed.paragraphs.filter((entry) => typeof entry === 'string' && entry.trim())
    : [];

  // Schema-valid and still a failed letter: `paragraphs: []` satisfies
  // `getCoverLetterSchema()` and renders as an empty section.
  if (paragraphs.length === 0) return { error: COVER_LETTER_FAILURES.EMPTY };

  const invented = findInventedYears(
    paragraphs,
    `${JSON.stringify(projection)}\n${jobDescription}`,
  );
  if (invented.length > 0) {
    return { error: COVER_LETTER_FAILURES.INVENTED_YEAR, detail: invented.join(',') };
  }

  return {
    letter: {
      subject: typeof parsed.subject === 'string' ? parsed.subject.trim() : '',
      paragraphs,
    },
  };
}

/**
 * The second call: the letter, drafted from the TAILORED CV, billed by the
 * caller only if this returns one.
 *
 * ⚠️ This never throws. A letter failure is a notice on a successful outcome,
 * so the tailoring the user came for cannot be lost to a fault down here.
 */
export async function generateCoverLetter({ getAIResponse, tailoredCv, request, mock }) {
  const projection = projectForCoverLetter(sanitizeResumeData(tailoredCv));

  let systemPrompt;
  let userPrompt;
  try {
    systemPrompt = getCoverLetterPrompt({
      targetLang: request.targetLang,
      wordTarget: request.wordTarget,
      ...(request.tone ? { tone: request.tone } : {}),
      hasStyleSample: Boolean(request.styleSample),
    });
    userPrompt = buildCoverLetterUserPrompt({
      jobDescription: request.jobDescription,
      styleSample: request.styleSample,
      projection,
    });
  } catch (err) {
    console.warn('[Cover letter] Refused before the call:', describeError(err));
    return { error: COVER_LETTER_FAILURES.BAD_REQUEST, projection, systemPrompt, userPrompt };
  }

  let response;
  try {
    response = await getAIResponse({
      mock,
      granularity: COVER_LETTER_GRANULARITY,
      sanitizedResumeData: projection,
      responseSchema: getCoverLetterSchema(),
      // The one call that carries a budget: a rewrite is bounded by its input,
      // a letter only by the word target.
      maxOutputTokens: COVER_LETTER_MAX_OUTPUT_TOKENS,
      systemPrompt,
      userPrompt,
    });
  } catch (err) {
    // `vertex.js` throws on any non-OK response and has no retry, so a 429 or a
    // 503 arrives here. Retrying would double a charge the CV already carried.
    console.error('[Cover letter] Vertex call failed:', describeError(err));
    return { error: COVER_LETTER_FAILURES.CALL_FAILED, projection, systemPrompt, userPrompt };
  }

  const { improvedContent, data, latency, candidate } = response;
  const outcome = validateCoverLetter({
    improvedContent,
    finishReason: candidate?.finishReason,
    projection,
    jobDescription: request.jobDescription,
  });

  // ⚠️ SERVER-ONLY beyond `letter` and `error`. `projection` is the CV itself and
  // the prompts quote the ad; `outcome` can carry a `detail` naming the years the
  // model invented. The caller picks the two fields it needs by name — spreading
  // this object into `ai_jobs.result` or an analytics payload would put a CV into
  // a row the browser reads, in one edit and in silence.
  return {
    ...outcome,
    projection,
    systemPrompt,
    userPrompt,
    latency,
    finishReason: candidate?.finishReason || 'UNKNOWN',
    safetyRatings: candidate?.safetyRatings || [],
    usage: {
      tokens_input: data?.usageMetadata?.promptTokenCount || 0,
      tokens_output: data?.usageMetadata?.candidatesTokenCount || 0,
    },
  };
}
