import { changelog_entries } from '@/locales/bg/changelog/index';
import { meta } from '@/locales/bg/changelog/meta';
import type { Translations } from '@/locales/en';

export const changelog: Translations['changelog'] = {
  ...meta,
  entries: changelog_entries,
};
