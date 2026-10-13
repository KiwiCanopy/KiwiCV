import type { Translations } from '@/locales/en';
import { changelog_entries } from '@/locales/fr/changelog/index';
import { meta } from '@/locales/fr/changelog/meta';

export const changelog: Translations['changelog'] = {
  ...meta,
  entries: changelog_entries,
};
