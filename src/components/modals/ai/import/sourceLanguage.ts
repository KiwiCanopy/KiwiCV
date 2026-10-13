import { type LocaleCode } from '@/locales';

/**
 * The picker value for "my CV is written in a language KiwiCV's interface does
 * not ship in". The model reads far more languages than the 15 the UI is
 * translated into, so the interface list is the wrong gate for an import — this
 * sentinel opens a free-text field whose value is forwarded to the prompt.
 */
export const OTHER_SOURCE_LANGUAGE = 'other';

export type ImportSourceLanguage = LocaleCode | '' | typeof OTHER_SOURCE_LANGUAGE;

export const isOtherSourceLanguage = (sourceLanguage: string): boolean =>
  sourceLanguage === OTHER_SOURCE_LANGUAGE;

/**
 * What the prompt receives as `currentLang`: a locale code for the supported
 * languages, or the typed English language name for everything else.
 */
export const resolveImportSourceLanguage = (
  sourceLanguage: string,
  sourceLanguageOther: string,
): string => (isOtherSourceLanguage(sourceLanguage) ? sourceLanguageOther.trim() : sourceLanguage);

/** Whether the step has enough to start: a locale, or `other` plus a name. */
export const hasImportSourceLanguage = (
  sourceLanguage: string,
  sourceLanguageOther: string,
): boolean => resolveImportSourceLanguage(sourceLanguage, sourceLanguageOther).length > 0;
