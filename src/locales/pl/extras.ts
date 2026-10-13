import type { Translations } from '@/locales/en';

export const extras: Translations['extras'] = {
  about: {
    family_intro:
      'KiwiCV to jedno z kilku narzędzi stworzonych w ramach KiwiCanopy. Poznaj resztę rodziny.',
    family_title: 'Część rodziny KiwiCanopy',
    kiwicanopy_desc: 'Dom rodziny KiwiCanopy, w którym wszystkie narzędzia mieszkają razem.',
    kiwidesk_desc: 'Siostrzana aplikacja w rodzinie KiwiCanopy.',
    story_p1:
      'Czy to u mnie, czy w rozmowach ze znajomymi i przyjaciółmi – wciąż doświadczałem tej samej frustracji: żmudnego przepisywania życiorysu przy każdej nowej aplikacji. Każdy chce dostosować swoje doświadczenie pod konkretne stanowisko, aby CV nie wydawało się od razu przeładowane. Jednak tradycyjne narzędzia sprawiają, że staje się to męczarnią: przy każdej drobnej zmianie często trzeba tworzyć zupełnie nowy dokument, co szybko kończy się niekończącym się chaosem wersji.',
    story_p2:
      'Właśnie z tego powodu stworzyłem KiwiCV: modułowy kreator życiorysów, w którym można łatwo włączać i wyłączać poszczególne sekcje, dowolnie przesuwać segmenty i elastycznie eksportować – a wszystko to z jednego, centralnego widoku. Koniec z uciążliwym kopiowaniem i wklejaniem między niezliczonymi dokumentami Word. Cała Twoja historia zawodowa zyskuje stały dom, a Ty ze spokojem wybierasz tylko to, co chcesz pokazać przy każdej aplikacji.',
    story_title: 'Historia powstania KiwiCV',
    title: 'O KiwiCV',
    visit_site: 'Odwiedź stronę',
  },
  howto: {
    core: {
      ai_assistant: 'Asystent IA',
      ai_assistant_desc:
        'Użyj Asystenta IA, aby zoptymalizować poszczególne elementy, sekcje lub całe CV. Szukaj ikony {wardsymbol}!',
      hide_show: 'Ukryj/Pokaż',
      hide_show_desc:
        'Aby uniknąć ciągłego usuwania i ponownego wstawiania wpisów, możesz ukryć poszczególne elementy lub całe sekcje jednym kliknięciem.',
      move_items_desc:
        'Przeciągaj i upuszczaj sekcje lub pojedyncze elementy między paskiem bocznym a kolumną główną.',
      page_breaks: 'Podziały stron',
      page_breaks_desc:
        'Wstawiaj ręczne podziały stron, aby Twój eksport PDF wyglądał dokładnie tak, jak chcesz. Dotyczy to tylko pliku PDF, a nie wersji internetowej.',
      rearrange: 'Zmień kolejność',
      rearrange_desc:
        'Zmień kolejność elementów w dowolnej sekcji, aby skupić się na tym, co chcesz wyróżnić.',
      switch_sides: 'Zmień strony',
      switch_sides_desc: 'Łatwo zamień kolumnę główną i pasek boczny, aby znaleźć najlepszy układ.',
      title: 'Główne funkcje',
    },
    footer: {
      message: 'Mamy nadzieję, że pisanie CV będzie przyjemniejsze z KiwiCV! Powodzenia!',
    },
    github: {
      create_pat_link: 'Utwórz token na GitHub',
      create_repo_link: 'Utwórz repozytorium na GitHub',
      go_to_settings: 'Przejdź do ustawień',
      intro:
        'Połącz swoje CV z repozytorium GitHub w celu automatycznej obsługi wielu języków, kontroli wersji i prostego hostingu. Postępuj zgodnie z tymi trzema krokami:',
      pat_security_tip:
        "Wskazówka bezpieczeństwa: użyj Personal Access Token 'Fine-grained' z uprawnieniami do odczytu/zapisu wyłącznie dla 'Contents' w konkretnym repozytorium. Pamiętaj, aby wybrać 'Only select repositories' i ustawić preferowaną datę wygaśnięcia.",
      step1_desc:
        'Utwórz nowe prywatne repozytorium na GitHubie. Na razie możesz pozostawić je całkowicie puste (nie są potrzebne README ani .gitignore).',
      step1_title: 'Utwórz repozytorium',
      step2_desc:
        'Potrzebujesz Personal Access Token (PAT), aby umożliwić KiwiCV wypychanie zmian do Twojego repozytorium. Dla maksymalnego bezpieczeństwa polecam token fine-grained.',
      step2_title: 'Utwórz Personal Access Token (PAT)',
      step3_desc:
        'Przejdź do strony Ustawienia i wprowadź szczegóły repozytorium oraz token w sekcji GitHub. Alternatywnie kliknij przycisk GitHub w prawym górnym rogu, aby otworzyć formularz, w którym również możesz wprowadzić swój PAT.',
      step3_title: 'Połącz w KiwiCV',
      title: 'Przewodnik po połączeniu z GitHub',
    },
    hosting: {
      automated_title: 'Opcja B: Automatyczny hosting (przez GitHub)',
      github_pages_desc:
        'Użyj pliku HTML wygenerowanego przez KiwiCV i prześlij go do repozytorium GitHub. Włącz GitHub Pages w ustawieniach repozytorium, aby uzyskać bezpłatny publiczny adres URL swojego życiorysu.',
      github_pages_title: 'GitHub Pages',
      intro:
        'Możesz bezpłatnie hostować wygenerowaną wersję HTML swojego życiorysu. Oto najczęstsze opcje:',
      manual_title: 'Opcja A: Ręczne przesyłanie (GitHub nie jest wymagany)',
      netlify_desc:
        'Usługi takie jak Netlify lub Vercel oferują darmowy hosting statyczny z łatwym wdrażaniem metodą przeciągnij i upuść lub automatyczną synchronizacją z repozytorium GitHub. Możesz tam po prostu przesłać swój życiorys w formacie HTML bez ujawniania historii edycji.',
      netlify_drop_desc:
        'Zapewnij sobie przewagę konkurencyjną dzięki osobistemu adresowi URL. Istnieje wielu **darmowych dostawców**, u których możesz umieścić swoje CV online **w kilka sekund**. Czy to za pośrednictwem narzędzia linkowanego powyżej, czy alternatyw takich jak [Tiiny.host](https://tiiny.host): wystarczy szybkie **przeciągnij i upuść (drag-and-drop)** swojej strony internetowej, aby uzyskać profesjonalną obecność w sieci.',
      netlify_drop_title: 'Szybko i łatwo: Netlify Drop',
      netlify_title: 'Netlify, Vercel i spółka',
      privacy_warning:
        'Uwaga: jeśli nie masz płatnego planu GitHub, musisz upublicznić swoje repozytorium, aby korzystać z GitHub Pages. Oznacza to, że cała historia Twojego CV (wszystkie commity) będzie widoczna dla każdego! Jeśli zależy Ci na prywatności, rozważ pierwszą opcję.',
      push_folder_hint:
        'KiwiCV obsługuje wyłączne wypychanie pliku HTML do konkretnego folderu w Twoim repozytorium. Sprawdź ustawienia zaawansowane na stronie podglądu.',
      sensitive_data_warning:
        'Ostrzeżenie o prywatności: jeśli hostujesz swój życiorys pod publicznym adresem URL, każdy może uzyskać dostęp do Twoich danych. Rozważ usunięcie wrażliwych informacji osobistych, takich jak dokładny adres, numer telefonu czy e-mail.',
      title: 'Hosting Twojego życiorysu',
    },
    pdf_guide: {
      font_size: 'Rozmiar czcionki',
      font_size_desc:
        'Dostosuj rozmiar czcionki w zakładce Projektowanie, aby zoptymalizować miejsce.',
      intro:
        'Renderowanie PDF jest złożone. Eksperymentuj z poniższymi funkcjami, aż dokument będzie idealny:',
      rearrange_sections: 'Zmień kolejność',
      rearrange_sections_desc: 'Zmiana kolejności sekcji może zapobiec brzydkim podziałom stron.',
      space_opt: 'Optymalizacja miejsca',
      space_opt_desc: 'Przeniesienie krótkiej sekcji na pasek boczny może zwolnić miejsce.',
      title: 'Wskazówki dotyczące układu PDF',
      use_pagebreaks: 'Używaj podziałów stron',
      use_pagebreaks_desc:
        'Elementy blisko krawędzi mogą źle wyglądać. Użyj podziałów stron, aby przenieść je na nową stronę.',
    },
    sync_guide: {
      auto_recognition_desc:
        'Zmiana języka powoduje sprawdzenie, czy wersja istnieje już w chmurze.',
      auto_recognition_title: 'Automatyczne rozpoznawanie',
      desc: 'KiwiCV obsługuje wiele języków. Po zapisaniu lub utworzeniu kopii zapasowej aplikacja tworzy wersję specyficzną dla aktywnego języka. Później rozpozna istniejące kopie, aby je przywrócić.',
      language_specific_desc:
        'Każda wersja językowa jest przechowywana jako oddzielny wpis w Twoim repozytorium w chmurze.',
      language_specific_title: 'Specyficzne dla języka',
      title: 'Inteligentne kopie zapasowe języków',
    },
    toc_title: 'SPIS TREŚCI',
  },
  page_description:
    'Kontekst, wsparcie i wizja: dowiedz się, jak najlepiej wykorzystać KiwiCV, dokąd zmierzamy i jaka historia kryje się za Twoim kreatorem CV.',
  page_title: 'Dodatki',
  tabs: {
    about: 'O KiwiCV',
    changelog: 'Changelog',
    howto: 'Poradniki',
    roadmap: 'Plan rozwoju',
  },
};
