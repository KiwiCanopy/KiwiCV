import type { Translations } from '@/locales/en';

export const v_004_004_000: Translations['changelog']['entries']['v_004_004_000'] = {
  _highlights: {
    ai_cover_letters: {
      badge: 'AI',
      content:
        'KiwiCV pisze teraz list motywacyjny za Ciebie. Wklej ogłoszenie o pracę i otrzymaj list dopasowany do Twojego obecnego CV — określ jego długość i ton lub podaj próbkę własnego tekstu, by KiwiCV pisało Twoim głosem. List pojawia się jako propozycja, którą możesz czytać obok swojego szkicu i akceptować akapit po akapicie.',
      title: 'Listy motywacyjne pisane dla Ciebie',
    },
  },
  chore_dependency_updates:
    'Jak zawsze, kilka drobnych aktualizacji pakietów w tle dba o to, aby technologia stojąca za KiwiCV była jak najbardziej aktualna.',
  feat_ai_cover_letters:
    'Twój list motywacyjny może teraz zostać napisany dla Ciebie na podstawie ogłoszenia o pracę i CV, które już masz. Wybierz długość i ton lub przekaż próbkę własnego tekstu, a KiwiCV dopasuje styl do Twojego głosu. List pojawia się jako propozycja wyświetlana obok Twojego szkicu, którą możesz akceptować akapit po akapicie — zarówno gdy list jest pusty, jak i gdy jest już rozpoczęty. Sekcja otwiera się teraz bezpośrednio na treści listu zamiast na pięciu polach adresowych odbiorcy dla tekstu, którego jeszcze nie było.',
  fix_ai_large_cv_wait:
    'Ulepszanie lub tłumaczenie dużego CV nie kończy się już błędem po minucie — czas oczekiwania rośnie teraz wraz z rozmiarem CV.',
  fix_dates:
    'Daty znów działają prawidłowo. Wpisana data mogła poza Europą cofnąć się o jeden dzień, a sam rok mógł całkowicie zniknąć; w selektorze przypadkowe kliknięcie blisko krawędzi siatki przenosiło bez ostrzeżenia do sąsiedniego miesiąca i roku; a funkcja „Sortuj wpisy chronologicznie” w ogóle nie rozpoznawała dat z dniem na początku, takich jak 15.03.2019, przez co te wpisy lądowały na samym dole, jakby nie miały daty.',
  fix_keyboard_navigation:
    'Praca z klawiaturą nie cofa Cię już na samą górę strony. Zamknięcie okna dialogowego przywraca fokus na przycisk, z którego zostało otwarte, usunięcie wpisu lub zapisanego CV przenosi Cię na następny element, a odpowiedź na sugestię AI zatrzymuje Cię w miejscu, w którym pracujesz. Do zdjęcia profilowego można teraz dotrzeć w całości z klawiatury — wcześniej kafelek reagował tylko na kliknięcie myszą, przez co opcje „Edytuj”, „Podmień” i „Usuń” były nieosiągalne.',
  fix_main_badge_overlaps_label:
    'Etykieta „main” obok nazwy pola nie nachodzi już na jej tekst. Była renderowana wewnątrz ramki o rozmiarze ikony, przez co szersza plakietka wystawała poza nią i zasłaniała sąsiadujące słowa.',
};
