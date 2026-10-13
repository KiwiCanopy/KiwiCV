import type { Translations } from '@/locales/en';
import { changelog_entries } from '@/locales/zh/changelog/index';
import { meta } from '@/locales/zh/changelog/meta';

export const changelog: Translations['changelog'] = {
  ...meta,
  entries: changelog_entries,
};
