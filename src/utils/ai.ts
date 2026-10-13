import {
  AI_POLL_FLOOR_MS,
  AI_POLL_MS_PER_CHAR,
  AI_PRO_DAILY_LIMIT,
  AI_TRANSLATION_MAX_CHARS,
} from '@/constants/ai';
import { supabase } from '@/lib/supabase';
import { LANGUAGES, type LocaleCode } from '@/locales';
import { type ReorgSuggestion } from '@/store/resume/slices/aiSlice';
import { type ResumeData } from '@/types/resume';
import {
  type AITargetKey,
  isItemKeyOf,
  itemTarget,
  parseAITarget,
  sectionTarget,
} from '@/utils/aiTarget';
import {
  findCustomSection,
  isCustomSectionToken,
  layoutSectionItems,
} from '@/utils/layout/customSections';

/**
 * ⚠️ The option list and the default come from ONE place: a default the picker
 * excludes leaves the select showing an option the state does not hold, and
 * `targetLang === currentLang` reads as "not a translation" at both ends.
 *
 * `keep` re-admits one excluded code, for the translate-only invite whose
 * target is fixed and must stay visible.
 */
export const translationTargets = (
  cvLanguage: LocaleCode | '',
  keep?: LocaleCode | '',
): readonly LocaleCode[] =>
  LANGUAGES.filter((language) => language.code !== cvLanguage || language.code === keep).map(
    (language) => language.code,
  );

export const getAlternateLanguage = (cvLanguage: LocaleCode | ''): LocaleCode => {
  const [first] = translationTargets(cvLanguage);
  // ⚠️ Throws rather than returning its input: the `|| currentLanguage` fallback
  // this replaced returned exactly the value every caller treats as impossible.
  if (!first) throw new Error(`No translation target other than "${cvLanguage}"`);
  return first;
};

/**
 * How long the client keeps polling a run that sent `payloadChars` characters
 * of CV — the serialised payload, measured the way the server caps it.
 * `aiPollWindow.test.ts` holds it against the measured runs.
 */
export const aiPollWindowMs = (payloadChars: number): number =>
  AI_POLL_FLOOR_MS + payloadChars * AI_POLL_MS_PER_CHAR;

export interface AIUsageStatus {
  proRequestsToday: number;
  isDailyLimitReached: boolean;
}

/**
 * Whether the user holds a pass at all — the first of the two conditions the
 * backend enforces, and the only one answerable from the profile.
 *
 * ⚠️ **This deliberately does NOT check the daily allowance**, and an earlier
 * version of it pretended to. It read `profile.ai_requests_today`, a field
 * declared on `Profile` that `public.profiles` has never had — so the
 * comparison was always `0 < 200` and the function was `isPremium` wearing a
 * second condition it could not evaluate. The credits branch masked that
 * (a limit-reached user still failed the balance check); with credits gone it
 * would have been the whole rule.
 *
 * The allowance is real, but it is only knowable from `get_ai_usage_status`.
 * `useAIUsage` fetches it and `useAIRunner` exposes `isDailyLimitReached`;
 * surfaces that need to distinguish "no pass" from "allowance spent" must read
 * that, not this. Surfaces that only gate the *attempt* can use this and let
 * the backend answer with `LIMIT_REACHED`.
 */
export const hasAIAccess = (isPremium: boolean): boolean => isPremium;

export const fetchAIUsageStatus = async (): Promise<AIUsageStatus> => {
  const { data, error } = await supabase.rpc('get_ai_usage_status', {
    p_limit: AI_PRO_DAILY_LIMIT,
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  const proRequestsToday = Number(row?.pro_requests_today || 0);

  return {
    proRequestsToday,
    isDailyLimitReached: proRequestsToday >= AI_PRO_DAILY_LIMIT,
  };
};

/**
 * Recursively removes sensitive, large, or unnecessary UI fields from resume data before sending to AI.
 * This saves bandwidth and keeps the AI focused on content.
 *
 * @param data The resume data to sanitize
 * @returns The sanitized data
 */
export const sanitizeForAI = (data: unknown): unknown => {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeForAI);
  }

  const sanitized = { ...(data as Record<string, unknown>) };
  // The recipient entry is a cover letter addressee: a THIRD PARTY name, company
  // and postal address. A cv-target run sends the whole resume, so it left the
  // browser on every Improve, tailor and translate; no mode can return it, since
  // no composition names those fields.
  //
  // Keep comments ABOVE the array below, and out of its opening line. The parity
  // guard finds that array by text and reads quoted words out of it, so an
  // apostrophe placed inside becomes a phantom key, and repeating the guard own
  // anchor text in a comment makes it lock onto the comment instead.
  const keysToStrip = [
    'image',
    'email',
    'phone',
    'url',
    'profiles',
    'references',
    'visible',
    'imageVisible',
    '_imageVId',
    '_isNew',
    'recipient',
    'location',
    'passthrough',
    'roles',
    'keywords',
  ];

  for (const key of keysToStrip) {
    if (!(key in sanitized)) continue;
    // ⚠️ Two different fields share the name. `basics.location` is the postal
    // address, an OBJECT that no run reaching this sanitizer can return;
    // an entry's is a STRING city that translation runs DO return, as
    // `entryLocation`. The shape tells them apart, as `FIELD_DEFS` already does.
    if (key === 'location' && typeof sanitized[key] === 'string') continue;
    // Skills and interests show their `keywords`; a project, the one item with a
    // `description`, does not, and the AI sees only what the CV shows.
    if (key === 'keywords' && !('description' in sanitized)) continue;
    delete sanitized[key];
  }

  // Recurse into nested objects
  for (const key in sanitized) {
    if (sanitized[key] && typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForAI(sanitized[key]);
    }
  }

  return sanitized;
};

/**
 * The sections a whole-CV run sends. ⚠️ Twin of `WHOLE_CV_SECTIONS` in
 * `netlify/functions/lib/ai/definitions.js`; `translationCap.test.tsx` holds the
 * size below to the worker's own.
 */
const WHOLE_CV_SECTIONS = [
  'basics',
  'work',
  'volunteer',
  'education',
  'awards',
  'certificates',
  'publications',
  'skills',
  'languages',
  'interests',
  'projects',
  'privateProjects',
  'customSections',
] as const;

/** A whole CV's size as the worker sends it: `meta` off, sanitized, projected. */
export const wholeCvTranslationChars = (resume: ResumeData): number => {
  const sanitized = sanitizeForAI(resume) as Record<string, unknown>;
  const projected = Object.fromEntries(
    WHOLE_CV_SECTIONS.filter((section) => section in sanitized).map((section) => [
      section,
      sanitized[section],
    ]),
  );
  return JSON.stringify(projected).length;
};

/**
 * Whether a run translates the whole CV — the client's one definition; its server
 * counterpart is `translatesWholeCv` in `validateImproveRequest`. A letter-only run skips call 1,
 * so it translates nothing.
 */
export const translatesWholeCv = (run: {
  isWholeCV: boolean;
  isLetterOnly: boolean;
  translateToAnotherLanguage: boolean;
  targetLang: string;
  cvLanguage: string;
}): boolean =>
  run.isWholeCV &&
  !run.isLetterOnly &&
  run.translateToAnotherLanguage &&
  run.targetLang !== run.cvLanguage;

/** Whether a whole-CV translation of `resume` is past the size the worker refuses. */
export const isTooLongToTranslate = (resume: ResumeData): boolean =>
  wholeCvTranslationChars(resume) > AI_TRANSLATION_MAX_CHARS;

/**
 * Returns a breakdown of AI suggestions (content vs reorg).
 */
export const getAISuggestionBreakdown = (
  suggestions: Record<string, unknown>,
  sectionIds?: string[],
  reorgSuggestion?: ReorgSuggestion | null,
  resume?: ResumeData,
): {
  content: number;
  reorg: number;
  reorgAdded: number;
  reorgRemoved: number;
  reorgTotal: number;
} => {
  const keys = Object.keys(suggestions);

  const contentCount = keys.filter((key) => {
    // The whole-CV container key would double-count its own section and item keys.
    if (key === 'cv') return false;

    const { type, sectionKey, vId } = parseAITarget(key);
    const sId = sectionKey || type;

    // If sectionIds provided, filter by them
    if (sectionIds && !sectionIds.includes(sId)) return false;

    // Filter out item suggestions whose target _vId no longer exists in resume
    if (type === 'item' && vId && resume) {
      // A deleted custom section leaves its proposals behind with nothing to show them.
      if (isCustomSectionToken(sId) && !findCustomSection(resume, sId)) return false;
      const sectionItems = layoutSectionItems(sId, resume);
      if (Array.isArray(sectionItems) && sectionItems.length > 0) {
        const exists = sectionItems.some(
          (item) => item && typeof item === 'object' && '_vId' in item && item._vId === vId,
        );
        if (!exists) return false;
      }
    }

    // Deduplication: a `section:X` key and its `item:X…` children record one
    // rewrite between them, so only the items are counted. See `isItemKeyOf`
    // for why the spelling matters.
    if (type === 'section' && keys.some((key) => isItemKeyOf(key, sId))) {
      return false;
    }

    return true;
  }).length;

  let reorgCount = 0;
  let reorgAdded = 0;
  let reorgRemoved = 0;
  let reorgTotal = 0;

  if (reorgSuggestion) {
    if (!sectionIds || sectionIds.includes(reorgSuggestion.sectionKey)) {
      reorgCount = 1;
      const values = Object.values(reorgSuggestion.classification);
      const pureAdded = values.filter((v) => v === 'added').length;
      const pureRemoved = values.filter((v) => v === 'removed').length;

      const propCount = reorgSuggestion.proposedItems.length;
      const origCount = reorgSuggestion.originalItems.length;

      // Balance accounts for items lost via merges or gained via splits
      const balance = propCount - pureAdded - (origCount - pureRemoved);

      reorgAdded = pureAdded + Math.max(0, balance);
      reorgRemoved = pureRemoved + Math.max(0, -balance);
      reorgTotal = propCount;
    }
  }

  return { content: contentCount, reorg: reorgCount, reorgAdded, reorgRemoved, reorgTotal };
};

/**
 * Utility to count pending AI suggestions for a given scope.
 *
 * @param suggestions The suggestions object from the store
 * @param sectionIds List of section IDs to include
 * @param reorgSuggestion Optional reorg suggestion from the store
 * @param resume Optional current ResumeData to filter orphaned item suggestions
 * @returns Total number of distinct suggestions (items + sections)
 */
export const getAISuggestionCount = (
  suggestions: Record<string, unknown>,
  sectionIds?: string[],
  reorgSuggestion?: ReorgSuggestion | null,
  resume?: ResumeData,
): number => {
  const { content, reorg } = getAISuggestionBreakdown(
    suggestions,
    sectionIds,
    reorgSuggestion,
    resume,
  );
  return content + reorg;
};

/**
 * Utility to construct tracking parameters for AI actions.
 * Safely parses the target string (e.g. 'cv', 'section:work', 'item:work:vId')
 * and returns metadata with the vId stripped to keep targets aggregatable.
 *
 * @param target The target string
 * @returns An object containing the ai_scope, ai_section_key, and sanitized ai_target
 */
export const getAITrackingParams = (
  target: AITargetKey | null | undefined,
): {
  ai_scope: 'cv' | 'section' | 'item' | null;
  ai_section_key: string | null;
  ai_target: string | null;
} => {
  if (!target) {
    return {
      ai_scope: null,
      ai_section_key: null,
      ai_target: null,
    };
  }

  const { type, sectionKey: parsedSectionKey } = parseAITarget(target);

  if (type === 'cv') {
    return {
      ai_scope: 'cv',
      ai_section_key: null,
      ai_target: 'cv',
    };
  }

  // A custom section's uuid would make every target unique and say nothing.
  const aggregatable = isCustomSectionToken(parsedSectionKey) ? 'custom' : parsedSectionKey;

  if (type === 'section') {
    const sectionKey = aggregatable || null;
    return {
      ai_scope: 'section',
      ai_section_key: sectionKey,
      ai_target: sectionTarget(String(sectionKey)),
    };
  }

  // An `AITargetKey` parses to `cv`, `section` or `item`, so this is an item.
  const sectionKey = aggregatable || null;
  return {
    ai_scope: 'item',
    ai_section_key: sectionKey,
    ai_target: itemTarget(String(sectionKey)), // Stripped of the specific vId!
  };
};
