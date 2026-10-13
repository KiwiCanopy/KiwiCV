import type { Translations } from '@/locales/en';
import { changelog_entries } from '@/locales/tr/changelog/index';
import { meta } from '@/locales/tr/changelog/meta';

export const changelog: Translations['changelog'] = {
  ...meta,
  entries: changelog_entries,
};
