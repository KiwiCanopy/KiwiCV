/**
 * Whether the letter has prose an Improve run could act on.
 *
 * ⚠️ **Not the same question as `hasCoverLetterText`** (`coverLetterRequest.ts`),
 * which counts a subject too because it asks "is there anything a fresh draft
 * would destroy". This one asks "is there anything to rewrite", and a subject
 * alone is a header, not a letter. The divergence is deliberate and the shared
 * shape is the trap — named on both sides so the next reader meets two
 * predicates rather than a name and a stray expression.
 */
export const hasLetterProse = (paragraphs: string[]): boolean =>
  paragraphs.some((paragraph) => paragraph.trim().length > 0);
