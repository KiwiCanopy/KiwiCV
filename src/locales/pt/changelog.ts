import type { Translations } from '@/locales/en';
import { changelog_entries } from '@/locales/pt/changelog/index';
import { meta } from '@/locales/pt/changelog/meta';

export const changelog: Translations['changelog'] = {
  ...meta,
  entries: changelog_entries,
};
