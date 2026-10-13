import { changelog_entries } from '@/locales/de/changelog/index';
import { meta } from '@/locales/de/changelog/meta';
import type { Translations } from '@/locales/en';

export const changelog: Translations['changelog'] = {
  ...meta,
  entries: changelog_entries,
};
