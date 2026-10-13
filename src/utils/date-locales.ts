import { type LocaleCode } from '@/locales';
import { type Locale } from 'date-fns';
import { bg, de, enUS, es, fr, it, ja, nl, pl, pt, ru, sv, tr, uk, zhCN } from 'date-fns/locale';

export const dateFnsLocales: Record<LocaleCode, Locale> = {
  en: enUS,
  de: de,
  fr: fr,
  ja: ja,
  es: es,
  it: it,
  pt: pt,
  nl: nl,
  pl: pl,
  ru: ru,
  zh: zhCN,
  bg: bg,
  tr: tr,
  sv: sv,
  uk: uk,
};

export function getDateFnsLocale(code: LocaleCode): Locale {
  return dateFnsLocales[code] || enUS;
}
