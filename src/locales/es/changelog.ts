import type { Translations } from '@/locales/en';
import { changelog_entries } from '@/locales/es/changelog/index';
import { meta } from '@/locales/es/changelog/meta';

export const changelog: Translations['changelog'] = {
  ...meta,
  entries: changelog_entries,
};
