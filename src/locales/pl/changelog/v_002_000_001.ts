import type { Translations } from '@/locales/en';

export const v_002_000_001: Translations['changelog']['entries']['v_002_000_001'] = {
  feat_whats_new_modal:
    'Bądź na bieżąco: Dodano okno „Co nowego”, które wyróżnia najnowsze funkcje i ulepszenia po aktualizacji.',
  fix_html_preview_scrolling:
    'Rozwiązano problem, przez który panel podglądu HTML mógł stać się nieprzewijalny w niektórych przeglądarkach.',
  fix_onboarding_tour_mobile_overlay:
    'Rozwiązano problem z pozycjonowaniem, przez który karta samouczka mogła nakładać się na wyróżnione elementy na małych ekranach.',
  fix_sidebar_position_placeholders:
    'Naprawiono błąd uniemożliwiający zmianę pozycji paska bocznego przy danych przykładowych.',
  fix_ui_header_action_bubbling:
    'Płynne działania edytora: Przełączanie widoczności lub dodawanie nowych elementów w nagłówkach sekcji nie powoduje już niepożądanego rozwijania lub zwijania.',
  perf_ats_rendering_optimization:
    'Optymalizacja ATS: treść w głównej kolumnie ma teraz priorytet dla czytników ekranu we wszystkich motywach dwukolumnowych.',
  refactor_backend_cleanup:
    'Oczyszczanie backendu i metadanych poprzez usunięcie przestarzałych kluczy z generowanych plików JSON w celu uzyskania uporządkowanej struktury danych.',
  refactor_package_upgrades:
    'Główna optymalizacja pod maską dzięki aktualizacji do Node 24 (z Node 22) i Vite 8, co zapewnia bezpieczniejsze i nowoczesne wrażenia.',
  ui_interactive_3d_buttons:
    'Ujednolicenie designu: System przycisków 3D został ujednolicony w całej aplikacji, zapewniające spójność i prestiżowy wygląd.',
  ui_section_field_ordering:
    'Zreorganizowano pola formularza edytora, aby dopasować je do wizualnej hierarchii wygenerowanego CV.',
};
