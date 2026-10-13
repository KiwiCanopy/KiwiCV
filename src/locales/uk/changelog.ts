import type { Translations } from '@/locales/en';
import { changelog_entries } from '@/locales/uk/changelog/index';
import { meta } from '@/locales/uk/changelog/meta';

export const changelog: Translations['changelog'] = {
  ...meta,
  entries: changelog_entries,
};
