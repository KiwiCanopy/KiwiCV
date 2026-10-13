import type { Translations } from '@/locales/en';
import { changelog_entries } from '@/locales/ru/changelog/index';
import { meta } from '@/locales/ru/changelog/meta';

export const changelog: Translations['changelog'] = {
  ...meta,
  entries: changelog_entries,
};
