import type { Translations } from '@/locales/en';

export const v_004_001_000: Translations['changelog']['entries']['v_004_001_000'] = {
  _highlights: {
    'matching-cover-letters': {
      badge: 'List motywacyjny',
      content:
        'Listy motywacyjne trafiają do KiwiCV. Napisz list w dokładnie takim samym stylu jak Twoje CV i wyeksportuj oba dokumenty razem jako spójny pakiet aplikacyjny — koniec z niedopasowanymi dokumentami.',
      title: 'Listy motywacyjne, idealnie dopasowane',
    },
  },
  chore_ai_model_upgrade:
    'Sztuczna inteligencja KiwiCV działa teraz na najnowszej generacji Gemini firmy Google (Gemini 3.1), zapewniając zauważalnie lepsze sugestie. Prywatność pozostaje bez zmian: przetwarzanie odbywa się wyłącznie w UE, zgodnie z RODO, a Twoje dane nigdy nie są wykorzystywane do trenowania modeli AI.',
  chore_dependency_updates:
    'Jak zawsze, kilka drobnych aktualizacji pakietów w tle dba o to, aby technologia stojąca za KiwiCV była jak najbardziej aktualna.',
  feat_matching_cover_letters:
    'Stwórz list motywacyjny pasujący do wyglądu Twojego CV i wyeksportuj je razem w jednym pakiecie aplikacyjnym. Formatuj tekst za pomocą pogrubienia, kursywy i linków, wybierz klasyczny układ DIN 5008 lub dopasowany do motywu oraz ukrywaj bądź pokazuj bloki nadawcy, odbiorcy i podpisu w zależności od potrzeb.',
  fix_design_settings_reset:
    'Twoje ustawienia w sekcji Design pozostają teraz nienaruszone podczas edycji. Pogrubione nagłówki dla Praca i Szkoły, własny układ adresu oraz ścieżka docelowa GitHub przywracały się do wartości domyślnych przy dodaniu, zmianie kolejności lub edycji dowolnego elementu sekcji listy — bez ostrzeżenia i możliwości cofnięcia. Własne nagłówki sekcji z zaimportowanego CV również zachowują swoje nazwy po każdej edycji.',
  fix_elegant_page_breaks:
    'Ręczne podziały stron działają już w motywie Elegant. Zaznaczenie podziału nie miało wcześniej wpływu na wyeksportowany plik PDF; nowa strona rozpoczyna się teraz dokładnie w wybranym miejscu, tak jak we wszystkich innych motywach.',
  fix_empty_custom_address_layout:
    'Własny układ adresu pozbawiony prawidłowych pól nie usuwa już Twojego adresu. Usunięcie wszystkich pól z własnego układu w sekcji Design całkowicie usuwało adres z CV i pliku PDF bez żadnego komunikatu na ekranie. KiwiCV używa teraz w zamian standardowego układu dla Twojego kraju.',
  fix_footer_date_round_trip:
    'Wyłączenie daty w stopce CV pozostaje aktywne po wyeksportowaniu i ponownym zaimportowaniu, a ręcznie wpisana data jest zachowywana dokładnie w wpisanej formie zamiast czyszczenia.',
  fix_import_list_warnings:
    'Ostrzeżenia dotyczące importu obejmują teraz również listy. Gdy KiwiCV musi pominąć nieczytelny element w opisach stanowiska, kursach dyplomu lub słowach kluczowych umiejętności, podaje nazwę wpisu i pola w podsumowaniu importu zamiast cichego skracania listy.',
  fix_import_warning_headings:
    'Ostrzeżenia dotyczące importu wskazują teraz sekcję Twojego CV, z której pochodzą (w tym dane osobowe), zamiast wyświetlać wewnętrzny identyfikator.',
  fix_imported_list_fields:
    'Plik CV z błędnie sformatowanymi listami wypunktowanymi nie blokuje już podglądu. Jeśli zaimportowany plik JSON zapisał opisy stanowiska, kursy dyplomu lub słowa kluczowe umiejętności jako pojedynczy tekst zamiast listy, podgląd i plik PDF przestawały się generować. KiwiCV odczytuje teraz poprawne dane i pomija resztę.',
  fix_imported_text_fields:
    'Dane kontaktowe w nieprawidłowym formacie nie uszkadzają już Twojego CV. Jeśli zaimportowany plik zapisał Twoje imię i nazwisko, stronę WWW, telefon lub miasto w formacie innym niż zwykły tekst, podgląd lub PDF mógł przestać działać. KiwiCV odczytuje teraz poprawne dane i usuwa zbędne spacje wokół imienia i adresu, dzięki czemu motywy rozbijające imię na dwie linie nie wyświetlają pustej pierwszej linii.',
  fix_imported_theme_name:
    'Zaimportowane CV z nierozpoznaną nazwą motywu wyświetla teraz wszystkie swoje sekcje zamiast pojawiać się jako prawie puste.',
  fix_missing_sections_single_column:
    'Sekcje uzupełnione po zmianie układu strony nie znikają już w motywach jednokolumnowych: każda sekcja z zawartością pojawia się w podglądzie i wyeksportowanym pliku PDF.',
  fix_pdf_special_characters:
    'Znaki specjalne oraz linki w Twoim CV są teraz niezawodnie eksportowane w plikach PDF każdego motywu.',
  fix_preview_pdf_parity:
    'To, co widzisz, odpowiada teraz temu, co eksportujesz. Zmienione nazwy nagłówków sekcji, szczegóły specyficzne dla danego motywu, ikony obok nich oraz sekcje projektów w kilku szablonach dwukolumnowych mogły różnić się między podglądem na ekranie a wyeksportowanym plikiem PDF – teraz oba renderują się identycznie.',
  fix_reload_repairs_cv:
    'Ponowne załadowanie edytora automatycznie naprawia uszkodzone lub stare pliki CV w locie, zapobiegając ewentualnym błędom podglądu i eksportu.',
  fix_signature_footer:
    'Stopka podpisu została naprawiona: pozostawia teraz miejsce na rzeczywisty podpis, nie tworzy już pustej ostatniej strony w dłuższych CV i pojawia się w szablonach Elegant, Plain i Plain 2, w których jej brakowało.',
  fix_stackoverflow_page_breaks:
    'Ręczne podziały stron ponownie działają w motywie Stack Overflow. Ustawienie podziału uniemożliwiało wcześniej wygenerowanie pliku PDF; podgląd i eksport dzielą teraz stronę dokładnie w wskazanym miejscu.',
  fix_theme_fonts:
    'Elegant, Timeless i JavaScript są teraz wyświetlane w podglądzie przy użyciu oryginalnych krojów pisma. Podgląd używał wcześniej domyślnej czcionki systemowej, a plik PDF motywu Timeless eksportował się z jeszcze inną czcionką; wszystkie trzy motywy wyglądają teraz na ekranie dokładnie tak samo jak w gotowym dokumencie.',
  fix_two_column_stray_breaks:
    'W motywach Lunar, Misty i Swiss Grid sekcja z ukrytymi wszystkimi wpisami nie przenosi już swojego ręcznego podziału strony do wyeksportowanego pliku PDF, co zapobiega powstawaniu pustej kolumny.',
  other_discord_community:
    'KiwiCV ma teraz społeczność na Discordzie — miejsce do wymiany opinii, zamawiania szablonów i wzajemnego wsparcia w poszukiwaniu pracy. Link czeka w stopce oraz na stronie głównej.',
  other_export_no_google_fonts:
    'Otwarcie wyeksportowanego CV w formacie HTML nie łączy się już z serwerami Google w celu pobrania czcionek. Używane są te same pliki czcionek, które dostarcza KiwiCV, co zapewnia identyczny wygląd bez informowania kogokolwiek, że go otworzyłeś.',
  other_import_clear_warning:
    'Podsumowanie importu ostrzega teraz wyraźnie, gdy wartości nietekstowe są usuwane z pól przeznaczonych wyłącznie na tekst, zamiast cichego ich wyczyszczenia.',
  other_kiwicanopy_family:
    'Poznaj resztę rodziny KiwiCanopy — KiwiCV zawiera teraz linki do KiwiCanopy oraz KiwiDesk na stronie O nas.',
};
