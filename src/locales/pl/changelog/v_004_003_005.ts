import type { Translations } from '@/locales/en';

export const v_004_003_005: Translations['changelog']['entries']['v_004_003_005'] = {
  chore_dependency_updates:
    'Jak zawsze, kilka drobnych aktualizacji pakietów w tle dba o to, aby technologia stojąca za KiwiCV była jak najbardziej aktualna.',
  fix_ai_proposal_diff:
    'Propozycje AI są teraz czytelniejsze i łatwiejsze do rozpatrzenia. Dodane i usunięte linie mają teraz własne cieniowanie tła zamiast samego koloru tekstu, oba warianty pozostają czytelne w trybie ciemnym i znajdują się bezpośrednio pod odpowiednim tekstem — po lewej zachowujesz swój tekst, po prawej przejmujesz propozycję.',
  fix_ai_stuck_dialog:
    'Zawieszone zadanie AI nie blokuje już otwartego okna postępu. Okno nie chciało się zamknąć w przypadku zawieszenia operacji, a odświeżenie strony natychmiast je przywracało i uruchamiało to samo zadanie od nowa — jedyne wyjście tylko pogarszało sytuację. Teraz okno można w każdej chwili zamknąć, a po odświeżeniu pozostaje zamknięte.',
  fix_ai_translate_addon:
    'Zaznaczenie opcji „Przetłumacz również mój CV” rzeczywiście uruchamia teraz tłumaczenie. Pole wyboru języka obok otwierało się z ustawionym językiem, w którym CV już było przygotowane, co system odczytywał jako „brak treści do tłumaczenia” — CV wracało dostosowane do ogłoszenia, ale nadal w pierwotnym języku, bez jakiejkolwiek informacji o odrzuceniu prośby.',
  fix_cover_letter_footer:
    'Wiersz podpisu pod twoim listem motywacyjnym stosuje się teraz do ustawień sekcji „Stopka PDF”, dokładnie tak samo jak pod twoim CV. Wcześniej kopiował on pole daty z góry listu, więc wyczyszczenie tego pola usuwało również podpis i obie wartości nie mogły się różnić.',
  fix_cvs_connect_button:
    'Łączenie pamięci w chmurze z poziomu „Moje CV” działa ponownie bez przeszkód. Przycisk „Połącz pamięć w chmurze” nie reagował, gdy zalogowano się bez podłączonego dostawcy, a otwierane okno dialogowe zaczynało się od przycisku, który jedynie przekierowywał z powrotem na tę samą stronę.',
};
