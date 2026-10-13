import type { Translations } from '@/locales/en';

export const v_003_000_000: Translations['changelog']['entries']['v_003_000_000'] = {
  _highlights: {
    'ai-import': {
      badge: 'Import IA',
      content:
        'Zaimportuj swoje CV tutaj. Po załadowaniu ten przycisk zmieni się w potężnego asystenta IA. Szukaj {wardsymbol} w aplikacji.',
      title: 'Import i asystent IA',
    },
    'google-drive': {
      badge: 'Sync w chmurze',
      content: 'Bezproblemowo synchronizuj swoje CV z Google Drive, aby mieć do niego dostęp.',
      title: 'Integracja z Google Drive',
    },
    webhosting: {
      badge: 'Webhosting',
      content: 'Dowiedz się, jak opublikować swoje CV jako stronę WWW w kilka minut.',
      title: 'Prosty hosting WWW',
    },
  },
  feat_ai_import_assistant:
    'Nowy sposób na rozpoczęcie pracy! KiwiCV umożliwia teraz importowanie treści CV przy pomocy zewnętrznych modeli LLM bezpośrednio z edytora. Ta funkcja, wcześniej ograniczona do samouczka powitalnego, jest teraz dostępna dla każdego — pozwalając na płynne przejście od prostego zapytania do idealnie sformatowanego życiorysu.',
  feat_brand_contact_modal:
    'Kontakt bezpośredni! Dodano nowy formularz kontaktowy, aby jeszcze bardziej ułatwić dzielenie się opiniami, zgłaszanie problemów lub sugerowanie nowych funkcji bezpośrednio do KiwiCV.',
  feat_deletion_prevention:
    'Dodano komunikaty potwierdzające usuwanie elementów we wszystkich sekcjach, aby zapobiec przypadkowej utracie danych.',
  feat_google_drive_sync:
    'Synchronizacja z Google Drive już jest! KiwiCV obsługuje teraz bezpieczną synchronizację z Twoim osobistym Dyskiem Google, zapewniając jeszcze większą elastyczność w utrzymywaniu danych w synchronizacji na wszystkich urządzeniach. Silnik synchronizacji został całkowicie przeprojektowany, aby obsługiwać wielu dostawców jednocześnie — a wszystko to przy zachowaniu ścisłej kontroli nad danymi dla zapewnienia maksymalnej prywatności.',
  feat_language_aware_restore:
    'Inteligentne wykrywanie w chmurze. Niezależnie od tego, czy inicjujesz przywracanie w ustawieniach, logujesz się przez Google Drive, czy ponownie konfigurujesz połączenie z GitHub, KiwiCV inteligentnie identyfikuje dostępne kopie zapasowe w tle. Dzięki temu możesz jednym kliknięciem przywrócić dokładnie tę wersję językową, której potrzebujesz.',
  feat_localized_language_display:
    'Ulepszona lokalizacja. Selektory języka CV są teraz tłumaczone na Twój aktualny język interfejsu, podczas gdy wybór języka interfejsu pozostaje w rodzimej formie dla lepszej dostępności.',
  feat_robust_manual_import:
    'Solidny import ręczny. Choć KiwiCV oferuje teraz własny, bezpieczny model AI do importowania życiorysów, nadal ulepszamy funkcje wspierające niezależność naszych użytkowników. Kopiuj swoje CV bezpośrednio z dowolnego czatu AI (jak Gemini czy ChatGPT) – nasz importer automatycznie identyfikuje i czyści teraz kłopotliwe artefakty, takie jak tagi cytowań czy bloki Markdown.',
  fix_design_tab_overflow:
    'Lepsza obsługa przepełnienia i wyśrodkowany wybór motywów w karcie projektowania, zapewniające bardziej zrównoważone i dostępne wrażenia na wszystkich urządzeniach.',
  fix_intelligent_address_cc:
    'Inteligentne formatowanie adresu. KiwiCV teraz inteligentnie ukrywa kod kraju w życiorysach krajowych. Kraj pojawia się tylko wtedy, gdy Twoja lokalizacja różni się od głównego języka życiorysu, co zapewnia czystszy i bardziej profesjonalny wygląd.',
  fix_pagebreaks_reset_on_edit:
    'Naprawiono błąd, w którym ręczne podziały stron były nieoczekiwanie resetowane po edycji treści CV. Twój niestandardowy układ teraz pozostaje dokładnie taki, jak go ustawiłeś.',
  fix_project_keywords_cleanup:
    'Oczyszczanie danych. Usunięto niefunkcjonalne pola słów kluczowych z sekcji Projekt i Projekt prywatny.',
  other_language_polish:
    'Dopracowane dla globalnej społeczności. Sformułowania w kilku językach zostały doprecyzowane, aby proces tworzenia życiorysu był bardziej intuicyjny i łatwiejszy dla każdego.',
  perf_high_growth_optimization:
    'Zaprojektowane z myślą o doskonałości. KiwiCV wprowadziło znaczące ulepszenia wydajności „pod maską”, aby zapewnić płynne i responsywne działanie w miarę ewolucji i rozwoju platformy.',
  refactor_language_certificate:
    'Zmieniono nazwę klucza JSON `languages.fluency` na `certificate`, aby lepiej odzwierciedlić jego cel, z funkcją legacy fallback dla wstecznej kompatybilności.',
  refactor_sync_organization:
    'Dopracowane pod kątem spójności. Folder w chmurze został przemianowany z „backup” na „backups”, aby idealnie pasował do struktury danych KiwiCV. Wsparcie dla starszych folderów pozostaje aktywne, co gwarantuje, że Twoje istniejące dane będą nadal poprawnie rozpoznawane i synchronizowane.',
  ui_enhancements:
    'Podnoszenie jakości tworzenia CV. Wprowadziliśmy kompleksowe ulepszenia interfejsu użytkownika i udoskonalenia układu, aby uczynić KiwiCV bardziej intuicyjnym, dostępnym i łatwiejszym w nawigacji we wszystkich obsługiwanych językach.',
  ui_improved_extras_section:
    "Kompleksowa aktualizacja podręcznika. Sekcja 'Jak to zrobić' została odświeżona i wzbogacona o nowe wskazówki dotyczące układu, podziałów stron oraz inteligentnych kopii zapasowych.",
  ui_multi_cloud_interface:
    'Bezproblemowe zarządzanie wieloma chmurami. Interfejs użytkownika został dopracowany, aby elegancko obsługiwać wiele usług synchronizacji naraz, oferując przejrzysty i intuicyjny widok stanu synchronizacji danych.',
  ui_refined_experience:
    'Dopracowane wrażenia użytkownika. Wprowadzono subtelne ulepszenia interfejsu i poprawki układu na całej platformie, aby zapewnić bardziej dopracowany i intuicyjny proces tworzenia życiorysu.',
  ui_swedish_support:
    'Välkommen! KiwiCV oficjalnie obsługuje teraz język szwedzki. Ciesz się w pełni zlokalizowanym doświadczeniem, od edytora po wyeksportowane CV.',
};
