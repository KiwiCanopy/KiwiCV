import {
  formatDate,
  formatDateRange,
  getThemeTranslations,
} from '@/components/preview/themes/shared';
import { type LocaleCode, locales } from '@/locales';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useUIStore } from '@/store/ui/useUIStore';
import type { ResumeMeta } from '@/types/resume';
import { getNestedValue, lookupTranslation } from '@/utils/translationLookup';

const { en } = locales;

export const useTranslation = (overrideMeta?: ResumeMeta) => {
  const meta = useResumeStore((state) => overrideMeta || state.resume.meta);
  const uiLanguage = useUIStore((state) => state.appLanguage);

  const cvLanguage = (meta?.theme?.locale || 'en') as LocaleCode;

  const currentLocale = locales[uiLanguage] || locales['en'];
  const uiLocale = getThemeTranslations(uiLanguage);
  const cvLocale = getThemeTranslations(cvLanguage);

  const createTranslator = (baseLocale: unknown) => {
    const t = (path: string, vars?: Record<string, string | number>): string => {
      const found = lookupTranslation(baseLocale, path, vars);
      if (found === null) return path;
      let translation = found;

      if (vars) {
        Object.entries(vars).forEach(([key, value]) => {
          // Support both {{key}} and {key}
          const regex = new RegExp(`{{?${key}}}?`, 'g');
          // A function replacement: `$&` or `$$` in a user-typed value stays literal.
          translation = translation.replace(regex, () => String(value));
        });
      }

      return translation;
    };

    const tObject = <T>(path: string): T | null => {
      let result = getNestedValue(baseLocale, path);
      if (!result) {
        result = getNestedValue(en, path);
      }
      return result as T;
    };

    return { t, tObject };
  };

  const { t, tObject } = createTranslator(currentLocale);
  const formatUIDate = (dateStr: string | undefined) => formatDate(dateStr, uiLocale);

  const { t: tCV, tObject: tCVObject } = createTranslator(locales[cvLanguage] || en);

  const formatCVDate = (dateStr: string | undefined) => formatDate(dateStr, cvLocale);

  const formatCVDateRange = (start: string | undefined, end: string | undefined) =>
    formatDateRange(start, end, cvLocale);

  return {
    t,
    tObject,
    tCV,
    tCVObject,
    uiLanguage,
    uiLocale,
    cvLanguage,
    cvLocale,
    formatCVDate,
    formatCVDateRange,
    formatUIDate,
    language: uiLanguage,
  };
};
