import type { Translations } from '@/locales/en';
import { changelog_entries } from '@/locales/it/changelog/index';
import { meta } from '@/locales/it/changelog/meta';

export const changelog: Translations['changelog'] = {
  ...meta,
  entries: changelog_entries,
};
