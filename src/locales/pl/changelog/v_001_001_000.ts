import type { Translations } from '@/locales/en';

export const v_001_001_000: Translations['changelog']['entries']['v_001_001_000'] = {
  feat_ats_friendly: 'Zapewniono format przyjazny dla ATS dla generowanych plików PDF',
  feat_github_backup:
    'Podczas wysyłania do GitHub (z karty podglądu) Twoja konfiguracja zostanie również zaktualizowana zgodnie z bieżącym stanem',
  feat_mock_data_preview:
    'Jeśli nie zostaną podane żadne dane, dane testowe zostaną użyte do wypełnienia szablonów podglądu, co pozwoli natychmiast zobaczyć podgląd',
  feat_onboarding_flow:
    'Zwiększone doświadczenie wdrożeniowe dzięki ulepszonemu przepływowi powitalnemu',
  fix_link_references: 'zoptymalizowano kilka odniesień do linków w motywach PDF i HTML',
  fix_lunar_sidebar_header:
    'Naprawiono problem, w którym nagłówki paska bocznego nie były wyświetlane w motywie Lunar',
  fix_netlify_routing:
    'Naprawiono problem, w którym odświeżanie podstron w serwisie Netlify powodowało błąd 404',
  fix_welcome_modal_scroll:
    'Naprawiono problem, w którym okno powitalne nie było przewijalne na mniejszych ekranach',
};
