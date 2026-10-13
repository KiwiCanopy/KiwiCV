import { type LocaleCode, locales } from '@/locales';

/**
 * Detects the user's preferred language from the browser settings
 * and maps it to a supported LocaleCode.
 */
export function detectBrowserLanguage(): LocaleCode {
  if (typeof navigator === 'undefined') return 'en';

  // Order of preference
  const languages = navigator.languages || [navigator.language];
  const supportedLocales = Object.keys(locales) as LocaleCode[];

  for (const lang of languages) {
    if (!lang) continue;

    // Normalize (e.g., 'en-US' -> 'en', 'zh-CN' -> 'zh')
    const code = lang.split('-')[0].toLowerCase() as LocaleCode;

    if (supportedLocales.includes(code)) {
      return code;
    }
  }

  return 'en';
}
