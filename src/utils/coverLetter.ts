import { type ResumeData } from '@/types/resume';

/**
 * Whether the letter has content: what a fresh draft would overwrite, what the
 * PDF prints as a leading page, and what the export dialog offers to include.
 * `subject` counts as well as the body: a letter with only a subject typed is
 * still content.
 *
 * ⚠️ **Not the same question as `EditorSectionPanel`'s `letterHasText`**, which
 * reads `paragraphs` alone. That one asks "is there prose an Improve run can act
 * on"; this asks "is there anything a fresh draft would destroy". The divergence
 * is deliberate, and the shared name is the trap — a maintainer who finds one
 * will assume it is the other. Change one only after reading both.
 */
export const hasCoverLetterText = (letter: ResumeData['coverLetter']): boolean =>
  letter.subject.trim().length > 0 || letter.paragraphs.some((entry) => entry.trim().length > 0);
