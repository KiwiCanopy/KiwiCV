import { bg } from '@/locales/bg/index';
import { de } from '@/locales/de/index';
import { en } from '@/locales/en/index';
import { es } from '@/locales/es/index';
import { fr } from '@/locales/fr/index';
import { it } from '@/locales/it/index';
import { ja } from '@/locales/ja/index';
import { nl } from '@/locales/nl/index';
import { pl } from '@/locales/pl/index';
import { pt } from '@/locales/pt/index';
import { ru } from '@/locales/ru/index';
import { sv } from '@/locales/sv/index';
import { tr } from '@/locales/tr/index';
import { uk } from '@/locales/uk/index';
import { zh } from '@/locales/zh/index';

export const locales = {
  en,
  de,
  fr,
  ja,
  es,
  it,
  pt,
  nl,
  pl,
  ru,
  zh,
  bg,
  tr,
  sv,
  uk,
};

export type LocaleCode = keyof typeof locales;
export type { Translations } from '@/locales/en/index';

export const LANGUAGES = (
  [
    { code: 'de', label: 'Deutsch' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'it', label: 'Italiano' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'pl', label: 'Polski' },
    { code: 'pt', label: 'Português' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'bg', label: 'Български' },
    { code: 'ru', label: 'Русский' },
    { code: 'ja', label: '日本語' },
    { code: 'sv', label: 'Svenska' },
    { code: 'zh', label: '中文' },
    { code: 'uk', label: 'Українська' },
  ] satisfies { code: LocaleCode; label: string }[]
).sort((a, b) => a.label.localeCompare(b.label));
