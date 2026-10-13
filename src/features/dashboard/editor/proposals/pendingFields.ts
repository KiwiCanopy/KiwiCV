import type { AISuggestionEntry } from '@/store/resume/slices/ai/types';

/**
 * The fields of one entry still awaiting a choice. The diff panel turns each
 * into a row and the form locks each, so both read this one list.
 */
export const pendingFields = (suggestion: AISuggestionEntry | undefined): string[] =>
  suggestion ? Object.keys(suggestion.improvedValue) : [];
