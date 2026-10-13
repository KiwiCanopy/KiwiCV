import type { Translations } from '@/locales/en';
import { changelog_entries } from '@/locales/pl/changelog/index';
import { meta } from '@/locales/pl/changelog/meta';

export const changelog: Translations['changelog'] = {
  ...meta,
  entries: changelog_entries,
};
