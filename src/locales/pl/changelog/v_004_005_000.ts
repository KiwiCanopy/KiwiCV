import type { Translations } from '@/locales/en';

export const v_004_005_000: Translations['changelog']['entries']['v_004_005_000'] = {
  _highlights: {
    custom_sections: {
      badge: 'Własne sekcje',
      content:
        'Twoje CV nie jest już ograniczone do standardowych sekcji. Dodaj własne — Konferencje, Główne wyniki, wszystko, co opowiada Twoją historię —, wypełnij je jak każdą inną sekcję, a będą pasować do każdego wyglądu, w podglądzie i w PDF. „Ulepsz z AI” oraz tłumaczenie działają także na nich.',
      title: 'Twoje własne sekcje',
    },
  },
  chore_dependency_updates:
    'Jak zawsze, kilka drobnych aktualizacji pakietów w tle dba o to, aby technologia stojąca za KiwiCV była jak najbardziej aktualna.',
  feat_custom_sections:
    'Dodaj do swojego CV własne sekcje — Konferencje, Główne wyniki lub cokolwiek, czego nie obejmują standardowe sekcje. „Dodaj sekcję” znajdziesz na końcu listy sekcji: nadaj sekcji tytuł i wypełnij ją wpisami jak każdą inną — nazwa, daty, link, podsumowanie i osiągnięcia. Własne sekcje pasują do każdego wyglądu, w podglądzie i w PDF, a w edytorze układu można je przenosić między kolumnami jak pozostałe. „Ulepsz z AI” działa na nich i na każdym z ich wpisów, a tłumaczenie CV obejmuje także ich tytuły i wpisy.',
  feat_json_round_trip:
    'Import pliku CV z innego narzędzia nie odrzuca już tego, czego KiwiCV nie potrafi pokazać. Dodatkowe bloki w pliku oraz role i słowa kluczowe Twoich projektów są przechowywane razem z CV i wracają bez zmian, gdy je eksportujesz lub tworzysz kopię zapasową na Google Drive albo w prywatnym repozytorium GitHub. Nigdy nie pojawiają się w Twoim CV ani nie trafiają do AI, a import informuje, które bloki zachował.',
  feat_privacy_by_design:
    'KiwiCV nadal kształtuje swoje działanie wokół Twojej prywatności. Repozytorium GitHub, które może czytać każdy — publiczne lub opublikowane przez GitHub Pages — otrzymuje teraz tylko to, co pokazuje Twoje CV: ukryte wpisy, pominięte części adresu i Twój list motywacyjny pozostają poza nim. Prywatne repozytorium zachowuje pełną kopię zapasową, a okno połączenia mówi, z którym przypadkiem masz do czynienia. Zdjęcia w zaimportowanym pliku CV tracą przed zapisaniem metadane aparatu, w tym lokalizację GPS.',
  fix_hidden_entries_stay_hidden:
    'Wszystko, co ukryjesz, pozostaje ukryte. Edycja, przenoszenie, sortowanie lub usuwanie innego wpisu mogło przywrócić ukryty, podobnie jak reorganizacja umiejętności przez AI czy przykładowy podgląd pustego CV. Te same czynności nie przyjmują już po cichu sugestii AI, zanim na nią odpowiesz.',
  fix_keyboard_screen_reader:
    'Płynniej z klawiaturą i czytnikiem ekranu: nowy pierwszy wpis otwiera się od razu, pole serwisu działa jak prawdziwa lista, a przyciski są odczytywane z nazwy.',
  fix_language_polish:
    'Szlif językowy w całej aplikacji: poprawione nagłówki sekcji po włosku, bułgarsku, turecku i portugalsku, wielka litera İ z kropką w tureckich CV, przetłumaczone ostatnie angielskie ekrany i prawdziwa przykładowa treść w pustym CV w dwunastu językach.',
  fix_reduced_json_hides_sections:
    '„Zredukowany” JSON na stronie Surowe dane JSON pomija teraz wszystko, co Twoje CV ukrywa — całą ukrytą sekcję i ukryte zdjęcie profilowe —, a także części adresu, które Twoje CV pomija, oraz pola projektów zachowane wyłącznie z zaimportowanego pliku.',
};
