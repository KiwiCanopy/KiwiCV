import type { Translations } from '@/locales/en';
import { changelog_entries } from '@/locales/nl/changelog/index';
import { meta } from '@/locales/nl/changelog/meta';

export const changelog: Translations['changelog'] = {
  ...meta,
  entries: changelog_entries,
};
