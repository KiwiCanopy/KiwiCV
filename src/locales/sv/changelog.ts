import type { Translations } from '@/locales/en';
import { changelog_entries } from '@/locales/sv/changelog/index';
import { meta } from '@/locales/sv/changelog/meta';

export const changelog: Translations['changelog'] = {
  ...meta,
  entries: changelog_entries,
};
