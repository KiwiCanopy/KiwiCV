import type { Translations } from '@/locales/en';
import { changelog_entries } from '@/locales/ja/changelog/index';
import { meta } from '@/locales/ja/changelog/meta';

export const changelog: Translations['changelog'] = {
  ...meta,
  entries: changelog_entries,
};
