import type { Translations } from '@/locales/en';

export const v_002_000_003: Translations['changelog']['entries']['v_002_000_003'] = {
  fix_editor_save_redirect:
    'Resolved an issue where clicking the Save button in the editor would always redirect to settings; it now performs a direct GitHub sync if configured.',
};
