import type { Translations } from '@/locales/en';

export const v_005_000_000: Translations['changelog']['entries']['v_005_000_000'] = {
  _highlights: {
    one_day_pass: {
      badge: 'Nowość',
      content:
        'Nie masz pewności, czy KiwiCV jest dla Ciebie? Nowy Pass 1-dniowy odblokowuje wszystkie funkcje AI na Twoją następną aplikację, więc przekonasz się, zanim zdecydujesz się na dłuższy Pass. Karty cennika oferują teraz 1, 7 i 30 dni.',
      title: 'Wypróbuj na jeden dzień',
    },
    open_source: {
      badge: 'Open Source',
      content:
        'Każda linijka KiwiCV jest teraz publicznie dostępna w serwisie GitHub na licencji AGPL. Sprawdź dokładnie, jak przetwarzane jest Twoje CV, zgłoś błąd lub zaproponuj funkcję: kod stojący za obietnicami prywatności każdy może sprawdzić.',
      title: 'KiwiCV jest open source',
    },
  },
  feat_ai_review_calmer:
    'Przeglądanie propozycji AI jest spokojniejsze. Umiejętności i Języki mają teraz panel przeglądu przy każdym wpisie, pola przepisane przez propozycję pozostają tylko do odczytu, dopóki nie wybierzesz „Zachowaj moje” lub „Użyj propozycji”, a Ulepsz czeka, aż zdecydujesz, więc drugie uruchomienie nie może zastąpić propozycji, zanim ją zobaczysz. Czytniki ekranu ogłaszają każdą decyzję.',
  feat_ai_tailoring_keeps_facts:
    'Dopasowanie Twojego CV do ogłoszenia nie zmienia już Twoich stanowisk, pracodawców, dat ani wymienionych umiejętności. Umiejętność, której Twoje CV nigdy nie wspomina, jest oznaczona „Nie ma tego w Twoim CV — zaakceptuj tylko, jeśli to prawda”, żeby decyzja należała do Ciebie, zanim trafi do CV.',
  feat_raw_data_extra_blocks:
    'Strona Surowe dane JSON pokazuje teraz dodatkowe dane, które przyniósł zaimportowany plik, na przykład blok ustawień innego narzędzia. Otwórz blok, aby przeczytać jego JSON, albo usuń te, których nie chcesz już w eksportach.',
  fix_dates:
    'Daty zaczynające się od dnia, jak 05.06.19, są teraz czytane jako 5 czerwca, nie 6 maja. Data, która nie istnieje, jak 31.02.2019, zostaje tak, jak ją wpisano, i dostaje czerwone oznaczenie błędu.',
  fix_drive_reconnect:
    'Ponowne połączenie z Google Drive zawsze się teraz kończy, włącza kopie zapasowe i zaczyna się prawdziwym przesłaniem.',
  fix_photos:
    'Zdjęcia w zaimportowanym CV tracą metadane aparatu, w tym lokalizację GPS, a zdjęcia GIF, HEIC i AVIF zamieniają się w JPEG. Zdjęcia z przezroczystym tłem po przycięciu pozostają białe zamiast robić się czarne.',
  fix_preview_pdf_match:
    'Podgląd na żywo i PDF są teraz bardziej zgodne w Soft, Misty, Skyline, Swiss Grid, Lunar i Elegant: te same wielkie litery, osie czasu, czcionki i linki. Podgląd nie ładuje już czcionek z serwera zewnętrznego, a tytuł i autor PDF zawierają tylko Twoje imię i nazwisko.',
  fix_privacy_controls:
    'To Ty decydujesz, co zostaje na tym urządzeniu. Logowanie przez Google prosi o trwały dostęp tylko wtedy, gdy łączysz Google Drive. Karty Google Drive i GitHub w Ustawieniach zawsze oferują Odłącz, wylogowanie lub usunięcie konta proponuje też usunięcie połączenia z GitHub, a Twoja próbka tekstu zostaje przy koncie, które ją zapisało.',
  fix_privacy_policy:
    'Polityka prywatności została napisana od nowa. Wymienia, co KiwiCV przechowuje o Twoich żądaniach AI (nigdy Twojego tekstu), wskazuje Twoje prawo sprzeciwu i sposób wycofania zgody oraz nazywa każdą usługę i miejsce, w którym działa.',
  fix_small_things:
    'Obrót tabletu przy otwartym menu bocznym nie blokuje już dotknięć, pływający przycisk Podgląd nie zasłania już menu telefonu, karta zostawiona otwarta podczas aktualizacji przeładowuje się na nową wersję, a CV zbyt długie do tłumaczenia jest odrzucane od razu, zamiast kończyć się błędem po długim oczekiwaniu.',
  ui_editor_polish:
    'Wracasz? Strona startowa mówi teraz Kontynuuj edycję, a Stwórz swoje CV otwiera od razu Twoje dane osobowe. W liście motywacyjnym Temat i Data są nad treścią listu, a Odbiorca otwiera się, gdy pojawi się adresat. Ulepsz pozostaje widoczne w pustej sekcji z podpowiedzią, co dodać najpierw, a liczniki znaków AI robią się bursztynowe przed limitem.',
  ui_informal_address_more_languages:
    'Hiszpański, niderlandzki, rosyjski, ukraiński i bułgarski zwracają się teraz do Ciebie na „Ty” w całej aplikacji, tak jak pozostałe języki.',
  ui_install_app:
    'Używaj KiwiCV jak aplikacji: w Ustawienia → Interfejs jest teraz przycisk Zainstaluj KiwiCV, a na iPhonie i iPadzie KiwiCV dostaje prawdziwą ikonę po dodaniu do ekranu głównego.',
};
