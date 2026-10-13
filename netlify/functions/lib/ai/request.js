import { AI_MAX_CHAR_LIMIT, AI_MAX_PAYLOAD_CHARS, AI_TRANSLATION_MAX_CHARS } from './constants.js';
import { normalizeCoverLetterRequest } from './coverLetter.js';
import { SECTION_COMPOSITION, SINGLETON_SECTIONS } from './definitions.js';
import { BASE_ROLE_PROMPTS } from './prompts.js';
import { isCustomSectionKey, parseAITarget } from './target.js';
import { projectForWholeCv, sanitizeResumeData } from './utils.js';

/**
 * A whole CV's size as the worker sends it: `meta` off, sanitized, projected.
 * The client's `wholeCvTranslationChars` computes the same number.
 */
export function wholeCvProjectedChars(resumeData) {
  const { meta: _meta, ...rest } = resumeData;
  return JSON.stringify(projectForWholeCv(sanitizeResumeData(rest))).length;
}

const isComposedSection = (key) => Object.hasOwn(SECTION_COMPOSITION, key);

/**
 * Whether the worker can serve this target and the client can write its result
 * back: an allow-list, so a key nobody composed is refused rather than billed
 * An `item:` run is a list entry.
 * @param {ReturnType<typeof parseAITarget>} target
 */
export function isServableTarget({ type, sectionKey, vId }) {
  if (type === 'cv') return sectionKey === '';
  if (type === 'section') return isComposedSection(sectionKey) || isCustomSectionKey(sectionKey);
  if (type === 'item') {
    const isListSection =
      (isComposedSection(sectionKey) && !SINGLETON_SECTIONS.includes(sectionKey)) ||
      isCustomSectionKey(sectionKey);
    return Boolean(vId) && isListSection;
  }
  return false;
}

/** What a target is recorded as when it is not one the worker serves. */
export const UNKNOWN_TARGET = 'unknown';

/** Longer than any target the app builds; past it a target is recorded as unknown. */
const MAX_RECORDED_TARGET_CHARS = 256;

/**
 * The target as `usage_logs` and the dev log's file name record it: ids dropped
 * and a custom section reported as `custom` — for every servable target the
 * shape `getAITrackingParams` sends PostHog (pinned in `aiTarget.test.ts`).
 * Imported ids can be free text and a direct POST skips the
 * client sanitizer, so the result is only ever `cv`, `section:<key>`,
 * `item:<key>` or `unknown`.
 * @param {unknown} activeTarget
 * @returns {string}
 */
export function aggregateAITarget(activeTarget) {
  if (typeof activeTarget !== 'string' || activeTarget.length > MAX_RECORDED_TARGET_CHARS) {
    return UNKNOWN_TARGET;
  }
  const target = parseAITarget(activeTarget);
  if (!isServableTarget(target)) return UNKNOWN_TARGET;
  if (target.type === 'cv') return 'cv';
  const sectionKey = isCustomSectionKey(target.sectionKey) ? 'custom' : target.sectionKey;
  return `${target.type}:${sectionKey}`;
}

/**
 * The mode as `usage_logs` records it: a key of `BASE_ROLE_PROMPTS`, the table
 * the prompt builder indexes, else `unknown` — the run the prompt builder treated
 * as no style (improve: `professional`; import: plain `parse_import`). The mode is
 * caller-supplied text in both workers.
 * @param {unknown} mode
 * @returns {string}
 */
export function aggregateAIMode(mode) {
  return typeof mode === 'string' && Object.hasOwn(BASE_ROLE_PROMPTS, mode) ? mode : UNKNOWN_TARGET;
}

/**
 * Whether a request may ask for the canned mock instead of Vertex. A mock run
 * also counts as Pro, so it is honoured only in local development or a test
 * that opts in — never from a production request body.
 */
export function mockAllowed(env = process.env) {
  return env.NETLIFY_DEV === 'true' || env.AI_ALLOW_MOCK === 'true';
}

/**
 * Refusals of a malformed or abusive request: the worker warns on these rather
 * than logging a fault. `MISSING_PARAMS` is not one, since the app never sends it.
 */
export const REQUEST_REFUSALS = ['INSTRUCTIONS_TOO_LONG', 'PAYLOAD_TOO_LARGE', 'INVALID_TARGET'];

/**
 * The improve worker's request guards: a pure function of the parsed body — no
 * database, no user, no network — run after auth and before any quota is read.
 * Its codes land in `ai_jobs.error`, where the frontend shows the generic error;
 * only `PREMIUM_REQUIRED` and `LIMIT_REACHED`, thrown later, are branched on
 * (`.claude/rules/ai-backend.md` § Error codes). `improve-request-guards.test.mjs`
 * pins each one.
 *
 * @param {object} body - The parsed request body.
 * @param {string | null} jobId - The job id the handler resolved from it.
 * @returns {{
 *   target: ReturnType<typeof parseAITarget>,
 *   letterRequest: object | null,
 *   isLetterOnly: boolean,
 *   translatesWholeCv: boolean,
 * }}
 */
export function validateImproveRequest(body, jobId) {
  const { activeTarget, mode, resumeData, instructions, coverLetter, coverLetterOnly } = body;

  if (!jobId) throw new Error('MISSING_PARAMS');
  if (!activeTarget || !mode || !resumeData) throw new Error('MISSING_PARAMS');

  const target = parseAITarget(activeTarget);
  if (!isServableTarget(target)) {
    // Only the target's kind: a refused target is caller-supplied text and may hold personal data.
    const kind = ['cv', 'section', 'item'].includes(target.type) ? target.type : UNKNOWN_TARGET;
    console.warn(`Rejected a run on a ${kind} target, which no composition serves`);
    throw new Error('INVALID_TARGET');
  }

  // Free text only; the CV itself is bounded below.
  if (instructions && instructions.length > AI_MAX_CHAR_LIMIT + 500) {
    console.error(`Abuse attempt: Instruction length ${instructions.length} exceeds limit`);
    throw new Error('INSTRUCTIONS_TOO_LONG');
  }

  // The ad travels in its own block, not folded into `instructions`: the letter
  // call sends it verbatim rather than as an instruction to a rewrite.
  const letterRequest = normalizeCoverLetterRequest(coverLetter);
  if (letterRequest && letterRequest.jobDescription.length > AI_MAX_CHAR_LIMIT + 500) {
    console.error(
      `Abuse attempt: Job description length ${letterRequest.jobDescription.length} exceeds limit`,
    );
    throw new Error('INSTRUCTIONS_TOO_LONG');
  }

  // A letter-only run skips call 1 and drafts from this request's whole CV: with
  // no letter block, or no whole CV, it has nothing to run.
  const isLetterOnly = Boolean(coverLetterOnly);
  if (isLetterOnly && (!letterRequest || target.type !== 'cv')) {
    throw new Error('MISSING_PARAMS');
  }

  // `AI_PRO_DAILY_LIMIT` counts requests, not their size, so without this 200
  // oversized CVs spend the same quota and far more Vertex.
  const payloadChars = JSON.stringify(resumeData).length;
  if (payloadChars > AI_MAX_PAYLOAD_CHARS) {
    console.error(`Abuse attempt: CV payload ${payloadChars} exceeds ${AI_MAX_PAYLOAD_CHARS}`);
    throw new Error('PAYLOAD_TOO_LARGE');
  }

  // The one definition of a whole-CV translation: the cap below and the worker's
  // completeness grade both read it.
  const { targetLang, currentLang } = body;
  const translatesWholeCv =
    target.type === 'cv' &&
    !isLetterOnly &&
    Boolean(targetLang) &&
    targetLang !== currentLang &&
    typeof resumeData === 'object' &&
    !Array.isArray(resumeData);
  // Past this a full translation runs into the output cap and comes back partial.
  if (translatesWholeCv) {
    const projectedChars = wholeCvProjectedChars(resumeData);
    if (projectedChars > AI_TRANSLATION_MAX_CHARS) {
      console.warn(
        `Refused a translation of ${projectedChars} projected chars, over ${AI_TRANSLATION_MAX_CHARS}`,
      );
      throw new Error('PAYLOAD_TOO_LARGE');
    }
  }

  return { target, letterRequest, isLetterOnly, translatesWholeCv };
}
