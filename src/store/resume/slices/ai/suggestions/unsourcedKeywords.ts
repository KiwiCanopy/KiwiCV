import { type ResumeStore } from '@/store/resume/types';
import { type ResumeData } from '@/types/resume';
import { type AITargetKey, parseAITarget } from '@/utils/aiTarget';

/**
 * Every string the CV holds outside `meta` and the cover letter (its body and its
 * `recipient`): what "in your CV" means for a keyword. The letter and its
 * addressee can be copied from the job ad, which would vouch for the ad's own keywords.
 */
export const cvText = (resume: ResumeData): string => {
  const strings: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === 'string') strings.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  const { meta: _meta, coverLetter: _coverLetter, ...content } = resume;
  walk(content);
  return strings.join('\n');
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Whether `word` occurs in `text` case-insensitively as a whole word: not
 * flanked by a letter or digit. Lookarounds rather than `\b`, which fails on a
 * keyword ending in a symbol (`C++`, `Next.js`).
 */
export const occursIn = (text: string, word: string): boolean => {
  const needle = word.trim();
  if (!needle) return true;
  return new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(needle)}(?![\\p{L}\\p{N}])`, 'iu').test(
    text,
  );
};

/**
 * Marks, on each skills entry proposal this apply recorded, the added keywords the
 * pre-run CV never mentions (`cvText`/`occursIn`). Marked, never dropped: a
 * truthful rewording (`JS` → `JavaScript`) is usually written elsewhere in
 * the CV, and the user decides about the rest.
 */
export const markUnsourcedKeywords = (
  state: ResumeStore,
  sourceText: string,
  updatedTargets: readonly AITargetKey[],
) => {
  for (const key of updatedTargets) {
    const { type, sectionKey, vId } = parseAITarget(key);
    if (type !== 'item' || sectionKey !== 'skills' || !vId) continue;
    const suggestion = state.ai.suggestions[key];
    if (!suggestion) continue;
    const proposed = suggestion.improvedValue.keywords;
    if (!Array.isArray(proposed)) continue;
    const before = new Set(
      (Array.isArray(suggestion.originalValue.keywords)
        ? suggestion.originalValue.keywords
        : []
      ).map(String),
    );
    const unsourced = proposed
      .map(String)
      .filter((keyword) => !before.has(keyword) && !occursIn(sourceText, keyword));
    if (unsourced.length > 0) suggestion.unsourced = { keywords: unsourced };
  }
};
