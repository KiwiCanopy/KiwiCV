import type { Translations } from '@/locales/en';

export const v_002_000_002: Translations['changelog']['entries']['v_002_000_002'] = {
  fix_tag_field_pdf_sync:
    'Naprawa TagField w trybie PDF: Rozwiązano problem, w którym dane wejściowe tagów nie synchronizowały się poprawnie podczas korzystania z podglądu PDF.',
  perf_pdf_render_safety:
    'Zwiększona stabilność generowania PDF: Wprowadzono solidne zabezpieczenie, które zapobiega pętlom w tle i zapewnia jasne kroki naprawcze w przypadku złożonych konfliktów układu.',
};
